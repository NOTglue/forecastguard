/**
 * Screenshot helper that can drive the page before capturing.
 *
 *   node scripts/shot.mjs <out.png> [--url=...] [--click="selector,selector"] [--full] [--height=900] [--wait=1200]
 *
 * Uses the Chrome DevTools Protocol over a WebSocket (Node 22 global).
 */
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9411;

const args = process.argv.slice(2);
const out = resolve(args.find((a) => !a.startsWith("--")) ?? ".preview/shot.png");
const opt = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const url = opt("url", "http://localhost:3000");
const clicks = opt("click", "");
const full = args.includes("--full");
const width = Number(opt("width", "1440"));
const height = Number(opt("height", "1000"));
const waitMs = Number(opt("wait", "1200"));
const evalExpr = opt("eval", "") || (opt("eval-file", "") ? readFileSync(opt("eval-file", ""), "utf8") : "");
const skipShot = args.includes("--no-shot");

const profile = mkdtempSync(join(tmpdir(), "fg-shot-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--force-color-profile=srgb",
    "--allow-file-access-from-files",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=1440,${height}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(200);
  }
  throw new Error("Chrome did not expose a page target");
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: res, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      } else if (msg.method) {
        (this.events.get(msg.method) ?? []).forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method) {
    return new Promise((res) => {
      const list = this.events.get(method) ?? [];
      const fn = (p) => {
        this.events.set(method, (this.events.get(method) ?? []).filter((f) => f !== fn));
        res(p);
      };
      this.events.set(method, [...list, fn]);
    });
  }
}

const connect = (u) =>
  new Promise((res, rej) => {
    const ws = new WebSocket(u);
    ws.addEventListener("open", () => res(new CDP(ws)));
    ws.addEventListener("error", rej);
    setTimeout(() => rej(new Error("ws timeout")), 15000);
  });

let code = 0;

try {
  const cdp = await connect(await wsUrl());

  const consoleErrors = [];
  cdp.events.set("Runtime.exceptionThrown", [
    (p) => consoleErrors.push(p.exceptionDetails?.text ?? "exception"),
  ]);
  cdp.events.set("Runtime.consoleAPICalled", [
    (p) => {
      if (p.type !== "error") return;
      const text = (p.args ?? [])
        .map((a) => a.value ?? a.description ?? a.type)
        .join(" ");
      // Offline basemap tiles are an accepted limitation, not a page bug.
      if (/tile|wikimedia|ERR_NAME_NOT_RESOLVED|net::ERR/i.test(text)) return;
      consoleErrors.push(text);
    },
  ]);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(waitMs);

  // surface any client-side error state
  const err = await cdp.send("Runtime.evaluate", {
    expression:
      `(() => { const el = document.querySelector('nextjs-portal'); ` +
      `const txt = document.body.innerText || ''; ` +
      `const bad = /Unhandled Runtime Error|Application error|Hydration failed/i.test(txt); ` +
      `return JSON.stringify({ bad, hasPortal: !!el }); })()`,
    returnByValue: true,
  });
  const pageState = JSON.parse(err.result.value);
  if (pageState.bad) {
    console.error("RUNTIME ERROR VISIBLE IN PAGE");
    code = 1;
  }

  for (const sel of clicks.split(",").filter(Boolean)) {
    const r = await cdp.send("Runtime.evaluate", {
      expression: `(() => { const e = document.querySelector(${JSON.stringify(
        sel.trim()
      )}); if (!e) return 'missing'; e.click(); return 'clicked'; })()`,
      returnByValue: true,
    });
    console.log(`click ${sel.trim()} -> ${r.result.value}`);
    await sleep(1500);
  }

  if (consoleErrors.length) {
    console.error("console errors:");
    for (const e of consoleErrors.slice(0, 10)) console.error("  -", e.slice(0, 300));
    code = 1;
  }

  /*
   * Lazy-loaded images below the fold never decode during a full-page
   * capture, which silently produces blank section backgrounds. Walk the
   * page once so everything has a chance to load before measuring.
   */
  const settleImages = () =>
    cdp.send("Runtime.evaluate", {
      expression:
        `(async () => { const h = document.documentElement.scrollHeight; ` +
        `for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.8)) { ` +
        `window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } ` +
        `window.scrollTo(0, 0); ` +
        `await Promise.all([...document.images].map(i => i.complete ? null : ` +
        `new Promise(r => { i.onload = i.onerror = r; }))); ` +
        `await new Promise(r => setTimeout(r, 250)); return h; })()`,
      awaitPromise: true,
      returnByValue: true,
    });

  await settleImages();

  if (evalExpr) {
    const r = await cdp.send("Runtime.evaluate", {
      expression: evalExpr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      console.error("eval threw:", r.exceptionDetails.text);
      code = 1;
    } else {
      console.log(
        typeof r.result.value === "string"
          ? r.result.value
          : JSON.stringify(r.result.value, null, 2)
      );
    }
  }

  /*
   * Clicks may reveal new lazy content, so settle images again before the
   * capture as well.
   */
  await settleImages();
  await sleep(250);

  if (skipShot) {
    // nothing to capture
  } else {
    let clip;
    if (full) {
      const m = await cdp.send("Page.getLayoutMetrics");
      const size = m.cssContentSize ?? m.contentSize;
      clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
      console.log(`full page ${Math.round(size.width)}x${Math.round(size.height)}`);
    }

    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: !!full,
      ...(clip ? { clip } : {}),
    });
    writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log("wrote", out, pageState.hasPortal ? "(next dev portal present)" : "");
  }
} catch (e) {
  console.error("shot failed:", e.message);
  code = 1;
} finally {
  chrome.kill();
  process.exit(code);
}

