/**
 * ForecastGuard — static image asset generator.
 *
 * Renders every illustration and background texture used by the app into
 * public/img as plain SVG. Generated (rather than hand-written or fetched
 * from a CDN) so the demo works fully offline and every visual stays
 * reproducible: change a coordinate here, re-run, asset updates.
 *
 *   node scripts/generate-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const IMG = resolve(root, "public", "img");
mkdirSync(IMG, { recursive: true });

/* ------------------------------------------------------------------ *
 * Palette — a restrained, print-inspired meteorological set.
 * ------------------------------------------------------------------ */
const C = {
  paper: "#f7f6f2",
  paper2: "#efece4",
  land: "#e4e0d4",
  landDim: "#d9d4c5",
  ink: "#14171a",
  ink2: "#3d444b",
  muted: "#6f7a83",
  rule: "#c9c4b6",
  ruleSoft: "#ddd8cb",
  contour: "#b3ab9a",
  accent: "#1b4f72",
  accentSoft: "#4a7fa5",
  rain: "#4a7fa5",
  risk0: "#2c7150",
  risk1: "#856a1c",
  risk2: "#9a5320",
  risk3: "#962a26",
  cloud: "#c9d2d6",
};

/* ------------------------------------------------------------------ *
 * Projection: equirectangular, fine for national-scale geometry.
 * ------------------------------------------------------------------ */
const B = { lonMin: 67, lonMax: 99, latMin: 6, latMax: 36 };
const W = 1200;
const H = 900;
const PAD = 55;

const px = (lon) => PAD + ((lon - B.lonMin) / (B.lonMax - B.lonMin)) * (W - PAD * 2);
const py = (lat) => PAD + ((B.latMax - lat) / (B.latMax - B.latMin)) * (H - PAD * 2);
const r2 = (n) => Math.round(n * 100) / 100;

const toPath = (pts, sx = 1, sy = 1) =>
  "M " +
  pts
    .map(([lon, lat]) => `${r2(px(lon) * sx)} ${r2(py(lat) * sy)}`)
    .join(" L ") +
  " Z";

/* Simplified mainland outline (lon, lat), clockwise from Kashmir. */
const INDIA = [
  [77.0, 35.5], [78.6, 34.6], [79.5, 32.5], [79.0, 31.0], [81.0, 30.2],
  [83.0, 29.2], [85.0, 28.0], [88.0, 27.2], [89.6, 26.8], [92.0, 26.9],
  [95.2, 27.6], [97.2, 28.0], [97.3, 27.0], [96.4, 25.5], [95.0, 24.0],
  [94.5, 23.0], [93.4, 22.0], [92.6, 22.0], [92.4, 23.7], [91.2, 23.5],
  [91.3, 24.1], [89.8, 25.3], [88.1, 24.5], [88.9, 22.0], [87.0, 21.5],
  [85.0, 19.5], [82.0, 16.8], [80.3, 15.8], [80.2, 13.1], [79.8, 10.3],
  [77.5, 8.1], [76.5, 9.5], [75.0, 12.0], [73.8, 15.5], [72.9, 18.9],
  [72.6, 21.0], [72.2, 21.7], [70.0, 20.8], [69.0, 22.3], [70.5, 23.0],
  [68.5, 23.8], [68.2, 24.3], [70.0, 25.7], [70.6, 27.7], [72.9, 28.0],
  [74.5, 31.0], [74.6, 32.5], [75.4, 34.0],
];

const SRI_LANKA = [
  [79.9, 9.5], [81.2, 8.4], [81.9, 7.0], [81.0, 6.2], [80.0, 5.9],
  [79.7, 7.2], [79.8, 8.6],
];

/* IMD subdivisions, kept in sync with app/data/zones.ts */
const ZONES = [
  { id: "GANGA-10", lon: 83.0, lat: 25.4, r: 170000, tone: "calm" },
  { id: "ODISHA-07", lon: 85.8, lat: 20.3, r: 165000, tone: "hot" },
  { id: "KONKAN-23", lon: 73.4, lat: 18.2, r: 155000, tone: "hot" },
  { id: "DECCAN-31", lon: 76.8, lat: 15.6, r: 160000, tone: "calm" },
  { id: "ASSAM-02", lon: 91.7, lat: 26.1, r: 160000, tone: "hot" },
  { id: "KERALA-34", lon: 76.2, lat: 10.8, r: 145000, tone: "warm" },
  { id: "GUJARAT-21", lon: 70.8, lat: 22.3, r: 175000, tone: "cold" },
  { id: "PUNJAB-14", lon: 75.8, lat: 30.8, r: 155000, tone: "cold" },
  { id: "RAJ-17", lon: 71.9, lat: 26.9, r: 195000, tone: "calm" },
  { id: "MP-19", lon: 79.9, lat: 23.2, r: 180000, tone: "warm" },
  { id: "BIHAR-09", lon: 86.1, lat: 25.8, r: 155000, tone: "hot" },
  { id: "TAMIL-33", lon: 79.8, lat: 11.9, r: 155000, tone: "warm" },
  { id: "ANDHRA-28", lon: 81.1, lat: 16.5, r: 160000, tone: "warm" },
  { id: "HIMACHAL-12", lon: 77.6, lat: 31.1, r: 150000, tone: "cold" },
  { id: "BENGAL-06", lon: 87.8, lat: 22.9, r: 150000, tone: "warm" },
];

/* metres -> px on the 1200x900 canvas (1 deg lat ~= 111.32 km, ~27.33 px/deg) */
const METRES_TO_PX = 27.33 / 111320;
const zoneR = (metres) => r2(metres * METRES_TO_PX);

const TONE = {
  hot: C.risk3,
  warm: C.risk2,
  cold: C.rain,
  calm: C.accentSoft,
};

const svg = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"${extra}>${body}</svg>\n`;

const write = (name, content) => {
  writeFileSync(resolve(IMG, name), content);
  console.log("wrote public/img/" + name);
};

/* ------------------------------------------------------------------ *
 * Deterministic pseudo-random, so regenerating never shifts the art.
 * ------------------------------------------------------------------ */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * 4. bg-topo.svg — topographic contour backdrop for dense text sections.
 * ------------------------------------------------------------------ */
function bgTopo() {
  const w = 1600;
  const h = 1000;
  const rand = rng(31);
  const lines = [];

  for (let i = 0; i < 34; i++) {
    const base = 20 + (i * (h - 30)) / 34;
    const amp = 16 + rand() * 40;
    const freq = 0.0022 + rand() * 0.003;
    const phase = rand() * Math.PI * 2;
    let d = `M -20 ${r2(base)}`;
    for (let x = 0; x <= w; x += 32) {
      const y =
        base +
        Math.sin(x * freq + phase) * amp +
        Math.sin(x * freq * 2.4 + phase) * amp * 0.28;
      d += ` L ${x} ${r2(y)}`;
    }
    lines.push(
      `<path d="${d}" fill="none" stroke="#bdb5a3" stroke-width="1.5" opacity="${r2(
        0.8 + rand() * 0.2
      )}"/>`
    );
  }

  /* a couple of closed highs so it reads as a pressure field */
  [
    { cx: 380, cy: 300, rx: 190, ry: 120, rot: -14 },
    { cx: 380, cy: 300, rx: 128, ry: 78, rot: -14 },
    { cx: 380, cy: 300, rx: 70, ry: 42, rot: -14 },
    { cx: 1180, cy: 680, rx: 210, ry: 130, rot: 10 },
    { cx: 1180, cy: 680, rx: 140, ry: 84, rot: 10 },
  ].forEach((l) => {
    lines.push(
      `<ellipse cx="${l.cx}" cy="${l.cy}" rx="${l.rx}" ry="${l.ry}" transform="rotate(${l.rot} ${l.cx} ${l.cy})" fill="none" stroke="#c6bfae" stroke-width="1.3" opacity="0.85"/>`
    );
  });

  return svg(
    w,
    h,
    `<defs><linearGradient id="topoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="18%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="82%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="topoMask"><rect width="${w}" height="${h}" fill="url(#topoFade)"/></mask></defs>
    <g mask="url(#topoMask)">${lines.join("")}</g>`,
    ' aria-label="Topographic pressure contours"'
  );
}

/* ------------------------------------------------------------------ *
 * 5. bg-isobars.svg — faint pressure-contour backdrop.
 * ------------------------------------------------------------------ */
function bgIsobars() {
  const w = 1600;
  const h = 1000;
  const rand = rng(9);
  const lines = [];
  const rows = 26;
  for (let i = 0; i < rows; i++) {
    const base = 30 + (i * (h - 40)) / rows;
    const amp = 18 + rand() * 46;
    const freq = 0.0026 + rand() * 0.0028;
    const phase = rand() * Math.PI * 2;
    let d = `M -20 ${r2(base)}`;
    for (let x = 0; x <= w; x += 40) {
      const y = base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.7 + phase) * amp * 0.22;
      d += ` L ${x} ${r2(y)}`;
    }
    lines.push(`<path d="${d}" fill="none" stroke="${C.contour}" stroke-width="1.4" opacity="${0.5 + rand() * 0.35}"/>`);
  }
  /* a couple of closed highs/lows for readability */
  const loops = [
    { cx: 320, cy: 300, rx: 150, ry: 92, rot: -12 },
    { cx: 320, cy: 300, rx: 105, ry: 62, rot: -12 },
    { cx: 1180, cy: 700, rx: 175, ry: 108, rot: 8 },
    { cx: 1180, cy: 700, rx: 122, ry: 74, rot: 8 },
  ]
    .map(
      (l) =>
        `<ellipse cx="${l.cx}" cy="${l.cy}" rx="${l.rx}" ry="${l.ry}" transform="rotate(${l.rot} ${l.cx} ${l.cy})" fill="none" stroke="${C.contour}" stroke-width="1" opacity="0.7"/>`
    )
    .join("");

  return svg(
    w,
    h,
    `<defs><linearGradient id="isoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="30%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="72%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="isoMask"><rect width="${w}" height="${h}" fill="url(#isoFade)"/></mask></defs>
    <g mask="url(#isoMask)">${lines.join("")}${loops}</g>`,
    ' aria-label="Faint isobar contours"'
  );
}

/* ------------------------------------------------------------------ *
 * 3. hero-atlas.svg — printed-atlas style map of India with zones.
 * ------------------------------------------------------------------ */
function heroAtlas() {
  const landPath = toPath(INDIA);

  const cells = ZONES.filter((z) => z.tone === "hot" || z.tone === "warm")
    .map((z) => {
      const rad = zoneR(z.r) * 1.45;
      const g = `rg${z.id.replace(/[^a-z0-9]/gi, "")}`;
      return `<circle cx="${r2(px(z.lon))}" cy="${r2(py(z.lat))}" r="${rad}" fill="url(#${g})"/>`;
    })
    .join("");

  const cellDefs = ZONES.filter((z) => z.tone === "hot" || z.tone === "warm")
    .map((z) => {
      const g = `rg${z.id.replace(/[^a-z0-9]/gi, "")}`;
      return `<radialGradient id="${g}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${TONE[z.tone]}" stop-opacity="0.42"/>
        <stop offset="55%" stop-color="${TONE[z.tone]}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${TONE[z.tone]}" stop-opacity="0"/>
      </radialGradient>`;
    })
    .join("");

  const rings = ZONES.map(
    (z) =>
      `<circle cx="${r2(px(z.lon))}" cy="${r2(py(z.lat))}" r="${zoneR(z.r)}" fill="none" stroke="${C.ink2}" stroke-opacity="0.22" stroke-width="0.8" stroke-dasharray="2 4"/>`
  ).join("");

  const dots = ZONES.map(
    (z) => `<circle cx="${r2(px(z.lon))}" cy="${r2(py(z.lat))}" r="2.2" fill="${C.ink}" fill-opacity="0.55"/>`
  ).join("");

  const labels = ZONES.map((z) => {
    const x = r2(px(z.lon));
    const y = r2(py(z.lat));
    const anchor = x > 700 ? "end" : "start";
    const dx = x > 700 ? -8 : 8;
    return `<text x="${r2(x + dx)}" y="${r2(y + 3)}" text-anchor="${anchor}" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="0.5" fill="${C.ink2}" fill-opacity="0.6">${z.id.split("-")[0]}</text>`;
  }).join("");

  const graticule = (() => {
    const g = [];
    for (let lon = 70; lon <= 96; lon += 4) {
      g.push(
        `<line x1="${r2(px(lon))}" y1="${PAD}" x2="${r2(px(lon))}" y2="${H - PAD}" stroke="${C.ruleSoft}" stroke-width="0.7"/>`
      );
    }
    for (let lat = 10; lat <= 34; lat += 4) {
      g.push(
        `<line x1="${PAD}" y1="${r2(py(lat))}" x2="${W - PAD}" y2="${r2(py(lat))}" stroke="${C.ruleSoft}" stroke-width="0.7"/>`
      );
    }
    return g.join("");
  })();

  return svg(
    W,
    H,
    `<defs>
      ${cellDefs}
      <clipPath id="landClip"><path d="${landPath}"/></clipPath>
      <filter id="relief" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="41" result="n"/>
        <feColorMatrix in="n" type="matrix"
          values="0 0 0 0 0.55  0 0 0 0 0.51  0 0 0 0 0.42  0.9 0 0 0 -0.45"/>
        <feGaussianBlur stdDeviation="0.6"/>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    ${graticule}

    <path d="${landPath}" fill="${C.land}" stroke="${C.ink2}" stroke-opacity="0.45" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="${toPath(SRI_LANKA)}" fill="${C.landDim}" stroke="${C.ink2}" stroke-opacity="0.35" stroke-width="0.9"/>

    <g clip-path="url(#landClip)">
      <rect width="${W}" height="${H}" filter="url(#relief)" opacity="0.5"/>
      ${cells}
    </g>

    ${rings}
    ${dots}
    ${labels}

    <g font-family="'IBM Plex Mono',monospace" font-size="10" letter-spacing="1.4" fill="${C.muted}">
      <text x="${PAD}" y="${H - 22}">15 IMD SUBDIVISIONS · DAY 1–10 HORIZON</text>
      <text x="${W - PAD}" y="${H - 22}" text-anchor="end">SIMULATED</text>
    </g>
    <text x="${PAD}" y="${PAD - 24}" font-family="'IBM Plex Mono',monospace" font-size="10" letter-spacing="1.4" fill="${C.muted}">FIG. 1 — WATCH AREAS</text>`,
    ' aria-label="Atlas-style map of India showing the fifteen monitored meteorological subdivisions"'
  );
}

/* ------------------------------------------------------------------ *
 * 4. feature-horizon.svg — editorial lead-time chart
 * ------------------------------------------------------------------ */
function featureHorizon() {
  const w = 720;
  const h = 460;
  const bars = [0.35, 0.5, 0.72, 0.94, 0.66, 0.45, 0.3, 0.22, 0.48, 0.58];
  const left = 58;
  const right = w - 34;
  const baseY = h - 84;
  const topY = 74;
  const maxH = baseY - topY;
  const slot = (right - left) / bars.length;
  const bw = Math.min(26, slot * 0.5);

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((v) => {
      const y = baseY - v * maxH;
      return `<line x1="${left}" y1="${r2(y)}" x2="${right}" y2="${r2(y)}" stroke="${C.ruleSoft}" stroke-width="1"/>
      <text x="${left - 10}" y="${r2(y + 3)}" text-anchor="end" font-family="'IBM Plex Mono',monospace" font-size="9" fill="${C.muted}">${Math.round(v * 100)}</text>`;
    })
    .join("");

  const barsSvg = bars
    .map((v, i) => {
      const bh = Math.round(v * maxH);
      const x = left + slot * i + (slot - bw) / 2;
      const color = v > 0.7 ? C.risk3 : v > 0.4 ? C.risk2 : C.rain;
      return `<rect x="${r2(x)}" y="${r2(baseY - bh)}" width="${bw}" height="${bh}" fill="${color}" opacity="0.85" rx="1"/>
        <text x="${r2(x + bw / 2)}" y="${baseY + 18}" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="10" fill="${C.muted}">D${i + 1}</text>`;
    })
    .join("");

  const thr = baseY - 0.6 * maxH;

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    ${grid}
    ${barsSvg}
    <line x1="${left}" y1="${r2(thr)}" x2="${right}" y2="${r2(thr)}" stroke="${C.risk3}" stroke-width="1.2" stroke-dasharray="4 4"/>
    <text x="${right}" y="${r2(thr - 7)}" text-anchor="end" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="0.6" fill="${C.risk3}">REVIEW THRESHOLD 60%</text>
    <line x1="${left}" y1="${baseY}" x2="${right}" y2="${baseY}" stroke="${C.ink2}" stroke-opacity="0.5" stroke-width="1"/>
    <text x="${left}" y="${h - 40}" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="1" fill="${C.muted}">BUST PROBABILITY (%) BY LEAD DAY</text>`,
    ' aria-label="Bar chart of bust probability across ten lead days"'
  );
}

/* ------------------------------------------------------------------ *
 * 5. feature-subdivisions.svg — light atlas tile
 * ------------------------------------------------------------------ */
function featureSubdivisions() {
  const w = 720;
  const h = 460;
  const sx = w / W;
  const sy = h / H;

  const dots = ZONES.map((z) => {
    const x = r2(px(z.lon) * sx);
    const y = r2(py(z.lat) * sy);
    const color = TONE[z.tone];
    return `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" fill-opacity="0.9"/>
      <circle cx="${x}" cy="${y}" r="${r2(zoneR(z.r) * sx)}" fill="none" stroke="${color}" stroke-opacity="0.3" stroke-width="1"/>`;
  }).join("");

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    <path d="${toPath(INDIA, sx, sy)}" fill="${C.land}" stroke="${C.ink2}" stroke-opacity="0.45" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="${toPath(SRI_LANKA, sx, sy)}" fill="${C.landDim}" stroke="${C.ink2}" stroke-opacity="0.3" stroke-width="0.9"/>
    ${dots}`,
    ' aria-label="Map of India with the fifteen monitored subdivisions marked"'
  );
}

/* ------------------------------------------------------------------ *
 * 6. feature-dualmode.svg — web console beside retro console
 * ------------------------------------------------------------------ */
function featureDualMode() {
  const w = 720;
  const h = 460;
  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>

    <!-- web panel -->
    <rect x="34" y="42" width="300" height="376" fill="#ffffff" stroke="${C.rule}" stroke-width="1"/>
    <text x="56" y="86" font-family="'Source Serif 4',Georgia,serif" font-size="26" fill="${C.ink}">Web console</text>
    <text x="56" y="107" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="1.2" fill="${C.muted}">DASHBOARD / MAP / TABLE</text>
    <line x1="56" y1="124" x2="312" y2="124" stroke="${C.ruleSoft}" stroke-width="1"/>
    <rect x="56" y="142" width="256" height="96" fill="${C.paper2}" stroke="${C.ruleSoft}" stroke-width="1"/>
    <path d="M 72 214 L 116 186 L 160 202 L 204 168 L 248 182 L 296 156" fill="none" stroke="${C.accent}" stroke-width="2"/>
    <rect x="56" y="256" width="120" height="58" fill="${C.paper2}" stroke="${C.ruleSoft}" stroke-width="1"/>
    <rect x="192" y="256" width="120" height="58" fill="${C.paper2}" stroke="${C.ruleSoft}" stroke-width="1"/>
    <text x="56" y="356" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="1.1" fill="${C.muted}">DAY 1–10 SCRUBBER</text>

    <!-- retro panel -->
    <rect x="376" y="42" width="310" height="376" fill="#c3c3c3" stroke="#7a7a7a" stroke-width="1"/>
    <rect x="376" y="42" width="310" height="26" fill="#243a63"/>
    <text x="388" y="60" font-family="'IBM Plex Mono',monospace" font-size="10" fill="#ffffff">ForecastGuard_v2.exe</text>
    <rect x="390" y="80" width="282" height="20" fill="#ffffff" stroke="#7a7a7a" stroke-width="0.75"/>
    <text x="397" y="94" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#333">C:\\FORECASTGUARD\\</text>
    <rect x="390" y="110" width="282" height="140" fill="#ffffff" stroke="#7a7a7a" stroke-width="0.75"/>
    <path d="M 406 220 L 448 190 L 490 206 L 532 164 L 574 178 L 656 146" fill="none" stroke="#243a63" stroke-width="2"/>
    <rect x="390" y="260" width="282" height="76" fill="#c3c3c3" stroke="#7a7a7a" stroke-width="0.75"/>
    <rect x="398" y="270" width="120" height="13" fill="#ffffff" stroke="#7a7a7a" stroke-width="0.75"/>
    <rect x="398" y="289" width="120" height="13" fill="#ffffff" stroke="#7a7a7a" stroke-width="0.75"/>
    <rect x="398" y="308" width="120" height="13" fill="#243a63" stroke="#7a7a7a" stroke-width="0.75"/>
    <text x="390" y="356" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="1.1" fill="#3a3a3a">RETRO TELEMETRY CONSOLE</text>`,
    ' aria-label="The modern web console beside the retro telemetry console"'
  );
}

/* ------------------------------------------------------------------ *
 * 7. Monogram avatars — quiet, tonal.
 * ------------------------------------------------------------------ */
function avatar(initials, bg, fg) {
  const s = 240;
  return svg(
    s,
    s,
    `<rect width="${s}" height="${s}" fill="${bg}"/>
    <circle cx="120" cy="120" r="86" fill="none" stroke="${fg}" stroke-opacity="0.22" stroke-width="1"/>
    <circle cx="120" cy="120" r="66" fill="none" stroke="${fg}" stroke-opacity="0.16" stroke-width="1"/>
    <text x="120" y="140" text-anchor="middle" font-family="'Source Serif 4',Georgia,serif" font-size="64" fill="${fg}" fill-opacity="0.92">${initials}</text>`,
    ' aria-label="Team member monogram"'
  );
}

/* ------------------------------------------------------------------ *
 * 8. App icon
 * ------------------------------------------------------------------ */
function appIcon() {
  const s = 64;
  return svg(
    s,
    s,
    `<rect width="${s}" height="${s}" rx="8" fill="${C.paper}"/>
    <path d="M 14 42 A 20 20 0 0 1 50 42" fill="none" stroke="${C.accent}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M 32 42 L 42 20" stroke="${C.risk3}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="32" cy="42" r="3.2" fill="${C.ink}"/>`,
    ' aria-label="ForecastGuard icon"'
  );
}

/* ------------------------------------------------------------------ */

write("bg-topo.svg", bgTopo());
write("bg-isobars.svg", bgIsobars());
write("hero-atlas.svg", heroAtlas());
write("feature-horizon.svg", featureHorizon());
write("feature-subdivisions.svg", featureSubdivisions());
write("feature-dualmode.svg", featureDualMode());
write("avatar-1.svg", avatar("NV", "#e4e0d4", "#243a63"));
write("avatar-2.svg", avatar("ND", "#e8e2cf", "#856a1c"));
write("avatar-3.svg", avatar("AV", "#e6ddd6", "#962a26"));
writeFileSync(resolve(root, "app", "icon.svg"), appIcon());
console.log("wrote app/icon.svg");
