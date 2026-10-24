/**
 * ForecastGuard — static image asset generator.
 *
 * Renders every illustration and background texture used by the app into
 * public/img as plain SVG. Everything is generated (rather than hand-written
 * or fetched from a CDN) so the demo works fully offline and every visual
 * stays reproducible: change a coordinate here, re-run, asset updates.
 *
 * The current visual system is "PIXELSTORM": a retro pixel-art weather
 * terminal. The India maps are rasterised here into a coarse block grid, so
 * the hero figure is genuine pixel art rather than a scaled vector.
 *
 *   node scripts/generate-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const IMG = resolve(root, "public", "img");
mkdirSync(IMG, { recursive: true });

/* ------------------------------------------------------------------ *
 * Palette — paper, ink and phosphor.
 * ------------------------------------------------------------------ */
const C = {
  paper: "#f3ead7",
  paper2: "#e9dfc9",
  surface: "#fbf6e9",
  land: "#d8c9a8",
  landDim: "#cfc0a0",
  ink: "#17201d",
  ink2: "#33403a",
  muted: "#6e7a71",
  rule: "#b9ab8f",
  ruleSoft: "#d8cbb2",
  contour: "#b3a78c",
  accent: "#0c6b5c",
  accentSoft: "#4a9d8b",
  rain: "#2b7f8f",
  risk0: "#1d6f47",
  risk1: "#8a5a09",
  risk2: "#b44410",
  risk3: "#a9221d",
  /* dark screens */
  screen: "#0b1719",
  screen2: "#101f22",
  screenLine: "#1f3a38",
  mint: "#7dfcbf",
  mintDim: "#4fbf93",
  signal: "#ffc857",
  coral: "#ff6b6b",
  sky: "#66d9ef",
};

/* ------------------------------------------------------------------ *
 * Projection: equirectangular, fine for national-scale geometry.
 * ------------------------------------------------------------------ */
const B = { lonMin: 67, lonMax: 99, latMin: 6, latMax: 36 };

const r2 = (n) => Math.round(n * 100) / 100;

function projector(w, h, pad) {
  return {
    px: (lon) => pad + ((lon - B.lonMin) / (B.lonMax - B.lonMin)) * (w - pad * 2),
    py: (lat) => pad + ((B.latMax - lat) / (B.latMax - B.latMin)) * (h - pad * 2),
  };
}

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

const hash2 = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* Ray-casting point-in-polygon, polygon in pixel space. */
function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/* ------------------------------------------------------------------ *
 * Pixel map: rasterise the India outline onto a coarse block grid.
 * ------------------------------------------------------------------ */
function pixelMap({
  w,
  h,
  pad = 26,
  cell = 20,
  dark = false,
  radar = false,
  footer = "",
}) {
  const { px: mx, py: my } = projector(w, h, pad);
  const poly = INDIA.map(([lon, lat]) => [mx(lon), my(lat)]);
  const landAt = (x, y) => inPoly(x, y, poly);

  const cols = Math.ceil((w - pad * 2) / cell);
  const rows = Math.ceil((h - pad * 2) / cell);
  const ox = Math.round((w - cols * cell) / 2);
  const oy = Math.round((h - rows * cell) / 2);

  const bg = dark ? C.screen : C.paper;
  const gridLine = dark ? "rgba(125,252,191,.10)" : "rgba(23,32,29,.09)";
  const landA = dark ? "#173a3a" : "#ddcfae";
  const landB = dark ? "#1b4545" : "#d4c4a1";
  const coast = dark ? C.mint : C.accent;
  const out = [];

  /* ocean grid */
  out.push(`<rect width="${w}" height="${h}" fill="${bg}"/>`);
  const step = cell * 3;
  for (let x = 0; x <= w; x += step) {
    out.push(
      `<rect x="${x}" y="0" width="1" height="${h}" fill="${gridLine}"/>`
    );
  }
  for (let y = 0; y <= h; y += step) {
    out.push(
      `<rect x="0" y="${y}" width="${w}" height="1" fill="${gridLine}"/>`
    );
  }

  /* radar rings behind the landmass */
  if (radar) {
    const cx = mx(88.2);
    const cy = my(18.6);
    for (let i = 1; i <= 7; i++) {
      out.push(
        `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${cell * i * 1.7}" fill="none" stroke="${
          dark ? "rgba(125,252,191,.18)" : "rgba(12,107,92,.16)"
        }" stroke-width="1" stroke-dasharray="2 6"/>`
      );
    }
    const rr = cell * 11;
    out.push(
      `<path d="M ${r2(cx)} ${r2(cy)} L ${r2(cx + rr * Math.cos(-0.5))} ${r2(
        cy + rr * Math.sin(-0.5)
      )} A ${r2(rr)} ${r2(rr)} 0 0 1 ${r2(cx + rr * Math.cos(0.25))} ${r2(
        cy + rr * Math.sin(0.25)
      )} Z" fill="${dark ? C.mint : C.accent}" opacity="0.08"/>`
    );
    out.push(
      `<rect x="${r2(cx) - 2}" y="${r2(cy) - 2}" width="4" height="4" fill="${
        dark ? C.coral : C.risk3
      }"/>`
    );
  }

  /* land blocks */
  const b = cell - 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cell;
      const y = oy + r * cell;
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      if (!landAt(cx, cy)) continue;

      const isCoast =
        !landAt(cx - cell, cy) ||
        !landAt(cx + cell, cy) ||
        !landAt(cx, cy - cell) ||
        !landAt(cx, cy + cell);

      const n = hash2(c, r);
      const fill = isCoast ? coast : n > 0.5 ? landA : landB;
      const opacity = isCoast ? 0.9 : 1;
      out.push(
        `<rect x="${r2(x + 1)}" y="${r2(y + 1)}" width="${b}" height="${b}" fill="${fill}" opacity="${opacity}"/>`
      );

      /* dithered interior detail */
      if (!isCoast && hash2(c + 71, r + 19) > 0.86) {
        out.push(
          `<rect x="${r2(x + 1)}" y="${r2(y + 1)}" width="${Math.max(
            3,
            b / 3
          )}" height="${Math.max(3, b / 3)}" fill="${
            dark ? C.mintDim : C.accent
          }" opacity="0.28"/>`
        );
      }
    }
  }

  /* zone markers */
  ZONES.forEach((z) => {
    const zx = mx(z.lon);
    const zy = my(z.lat);
    const size = dark ? cell * 1.3 : cell * 1.15;
    const color = TONE[z.tone];
    out.push(
      `<rect x="${r2(zx - size / 2)}" y="${r2(zy - size / 2)}" width="${r2(
        size
      )}" height="${r2(size)}" fill="${color}" stroke="${
        dark ? C.screen : C.ink
      }" stroke-width="2"/>`
    );
    if (dark) {
      out.push(
        `<rect x="${r2(zx - 1.5)}" y="${r2(zy - 1.5)}" width="3" height="3" fill="${
          C.screen
        }" opacity="0.65"/>`
      );
    }
  });

  /* corner brackets */
  const bracket = (x, y, dx, dy) => {
    const s = 16;
    return `<path d="M ${x} ${y + dy * s} L ${x} ${y} L ${x + dx * s} ${y}" fill="none" stroke="${
      dark ? "rgba(125,252,191,.55)" : "rgba(23,32,29,.55)"
    }" stroke-width="2"/>`;
  };
  out.push(bracket(pad, pad, 1, 1));
  out.push(bracket(w - pad, pad, -1, 1));
  out.push(bracket(pad, h - pad, 1, -1));
  out.push(bracket(w - pad, h - pad, -1, -1));

  /* screen annotations */
  const label = dark ? C.mintDim : C.muted;
  const strong = dark ? C.mint : C.ink2;
  if (w >= 900) {
    out.push(
      `<text x="${pad + 4}" y="${pad + 20}" font-family="monospace" font-size="11" letter-spacing="2" fill="${strong}">RADAR-9 // WX WATCH</text>`,
      `<text x="${w - pad - 4}" y="${pad + 20}" text-anchor="end" font-family="monospace" font-size="11" letter-spacing="2" fill="${label}">${
        radar ? "SWEEP 09s" : "DAY 1-10"
      }</text>`,
      `<text x="${pad + 4}" y="${h - pad - 10}" font-family="monospace" font-size="10" letter-spacing="1.6" fill="${label}">15 IMD SUBDIVISIONS</text>`,
      `<text x="${w - pad - 4}" y="${h - pad - 10}" text-anchor="end" font-family="monospace" font-size="10" letter-spacing="1.6" fill="${label}">SIMULATED FEED</text>`
    );
  }
  if (footer) {
    out.push(
      `<text x="${pad}" y="${h - 12}" font-family="monospace" font-size="10" letter-spacing="1.4" fill="${label}">${footer}</text>`
    );
  }

  return svg(
    w,
    h,
    out.join(""),
    ' shape-rendering="crispEdges" aria-label="Pixel-art map of India showing the fifteen monitored meteorological subdivisions"'
  );
}

/* ------------------------------------------------------------------ *
 * bg-topo.svg — stepped contour backdrop for dense text sections.
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
    let d = "";
    for (let x = -20; x <= w; x += 24) {
      const y =
        Math.round(
          (base +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 2.4 + phase) * amp * 0.28) /
            8
        ) * 8;
      d += `${d ? " L" : "M"} ${x} ${y}`;
    }
    lines.push(
      `<path d="${d}" fill="none" stroke="${C.contour}" stroke-width="2" opacity="${r2(
        0.55 + rand() * 0.35
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
      `<ellipse cx="${l.cx}" cy="${l.cy}" rx="${l.rx}" ry="${l.ry}" transform="rotate(${l.rot} ${l.cx} ${l.cy})" fill="none" stroke="${C.rule}" stroke-width="2" opacity="0.8" stroke-dasharray="2 4"/>`
    );
  });

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    <defs><linearGradient id="topoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="18%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="82%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="topoMask"><rect width="${w}" height="${h}" fill="url(#topoFade)"/></mask></defs>
    <g mask="url(#topoMask)">${lines.join("")}</g>`,
    ' shape-rendering="crispEdges" aria-label="Pixel-stepped pressure contours"'
  );
}

/* ------------------------------------------------------------------ *
 * bg-isobars.svg — faint stepped isobar backdrop.
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
    let d = "";
    for (let x = -20; x <= w; x += 32) {
      const y =
        Math.round(
          (base +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 2.7 + phase) * amp * 0.22) /
            8
        ) * 8;
      d += `${d ? " L" : "M"} ${x} ${y}`;
    }
    lines.push(
      `<path d="${d}" fill="none" stroke="${C.contour}" stroke-width="2" opacity="${r2(
        0.45 + rand() * 0.3
      )}"/>`
    );
  }
  const loops = [
    { cx: 320, cy: 300, rx: 150, ry: 92, rot: -12 },
    { cx: 320, cy: 300, rx: 105, ry: 62, rot: -12 },
    { cx: 1180, cy: 700, rx: 175, ry: 108, rot: 8 },
    { cx: 1180, cy: 700, rx: 122, ry: 74, rot: 8 },
  ]
    .map(
      (l) =>
        `<ellipse cx="${l.cx}" cy="${l.cy}" rx="${l.rx}" ry="${l.ry}" transform="rotate(${l.rot} ${l.cx} ${l.cy})" fill="none" stroke="${C.rule}" stroke-width="2" opacity="0.7" stroke-dasharray="3 5"/>`
    )
    .join("");

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    <defs><linearGradient id="isoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="30%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="72%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="isoMask"><rect width="${w}" height="${h}" fill="url(#isoFade)"/></mask></defs>
    <g mask="url(#isoMask)">${lines.join("")}${loops}</g>`,
    ' shape-rendering="crispEdges" aria-label="Faint pixel-stepped isobar contours"'
  );
}

/* ------------------------------------------------------------------ *
 * bg-rain.svg — blocky precipitation field for the reading-key section.
 * ------------------------------------------------------------------ */
function bgRain() {
  const w = 1600;
  const h = 1000;
  const rand = rng(77);
  const block = 16;
  const spots = [];

  for (let i = 0; i < 54; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const color = [C.risk3, C.risk2, C.rain, C.risk1][i % 4];
    const n = 3 + Math.floor(rand() * 5);
    for (let k = 0; k < n; k++) {
      for (let j = 0; j < n; j++) {
        if (rand() < 0.42) continue;
        const x = Math.round((cx + k * block) / block) * block;
        const y = Math.round((cy + j * block) / block) * block;
        spots.push(
          `<rect x="${x}" y="${y}" width="${block - 2}" height="${block - 2}" fill="${color}" opacity="${r2(
            0.08 + rand() * 0.16
          )}"/>`
        );
      }
    }
  }

  const grid = [];
  for (let x = 0; x <= w; x += 32) {
    grid.push(`<rect x="${x}" y="0" width="1" height="${h}" fill="rgba(23,32,29,.07)"/>`);
  }
  for (let y = 0; y <= h; y += 32) {
    grid.push(`<rect x="0" y="${y}" width="${w}" height="1" fill="rgba(23,32,29,.07)"/>`);
  }

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>${grid.join("")}${spots.join("")}`,
    ' shape-rendering="crispEdges" aria-label="Blocky rainfall cells on a pixel grid"'
  );
}

/* ------------------------------------------------------------------ *
 * bg-satellite.svg — pixel swirl for the capability section.
 * ------------------------------------------------------------------ */
function bgSatellite() {
  const w = 1600;
  const h = 1000;
  const rand = rng(123);
  const blocks = [];

  const swirl = (cx, cy, turns, scale, color, opacity) => {
    for (let t = 0; t < turns; t += 0.06) {
      const r = 12 + t * scale;
      const x = cx + Math.cos(t * 2.1) * r;
      const y = cy + Math.sin(t * 2.1) * r * 0.58;
      const bx = Math.round(x / 12) * 12;
      const by = Math.round(y / 12) * 12;
      blocks.push(
        `<rect x="${bx}" y="${by}" width="8" height="8" fill="${color}" opacity="${r2(
          opacity * (0.6 + rand() * 0.4)
        )}"/>`
      );
    }
  };

  swirl(1120, 470, 3.8, 26, C.accent, 0.2);
  swirl(1120, 470, 3.2, 18, C.ink2, 0.12);
  swirl(260, 780, 2.6, 22, C.rain, 0.14);

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>${blocks.join("")}`,
    ' shape-rendering="crispEdges" aria-label="Pixel-art satellite swirl"'
  );
}

/* ------------------------------------------------------------------ *
 * bg-strip.svg — blocky cloud band for the dashboard control bar.
 * ------------------------------------------------------------------ */
function bgStrip() {
  const w = 1600;
  const h = 600;
  const rand = rng(45);
  const blocks = [];
  const cell = 20;

  for (let i = 0; i < 110; i++) {
    const x = Math.round((rand() * w) / cell) * cell;
    const y = Math.round((rand() * h) / cell) * cell;
    const color = rand() > 0.72 ? C.accent : C.ink2;
    blocks.push(
      `<rect x="${x}" y="${y}" width="${cell - 3}" height="${cell - 3}" fill="${color}" opacity="${r2(
        0.03 + rand() * 0.08
      )}"/>`
    );
  }

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper2}"/>
    <g opacity="0.9">${blocks.join("")}</g>`,
    ' shape-rendering="crispEdges" aria-label="Blocky cloud field"'
  );
}

/* ------------------------------------------------------------------ *
 * hero-pixel.svg — dark radar plate, the hero image.
 * ------------------------------------------------------------------ */
function heroPixel() {
  return pixelMap({
    w: 1000,
    h: 760,
    pad: 34,
    cell: 20,
    dark: true,
    radar: true,
  });
}

/* ------------------------------------------------------------------ *
 * hero-atlas.svg — light pixel plate (kept for print/OG reuse).
 * ------------------------------------------------------------------ */
function heroAtlas() {
  return pixelMap({
    w: 1200,
    h: 900,
    pad: 44,
    cell: 24,
    dark: false,
    radar: false,
    footer: "FIG. 1 — WATCH AREAS / DAY 1-10 HORIZON",
  });
}

/* ------------------------------------------------------------------ *
 * feature-horizon.svg — pixel lead-time chart.
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
  const bw = Math.min(30, slot * 0.56);

  const grid = [];
  for (let x = left; x <= right; x += 24) {
    grid.push(`<rect x="${x}" y="${topY}" width="1" height="${baseY - topY}" fill="rgba(23,32,29,.09)"/>`);
  }
  [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
    const y = baseY - v * maxH;
    grid.push(
      `<rect x="${left}" y="${r2(y)}" width="${right - left}" height="1" fill="rgba(23,32,29,.1)"/>`,
      `<text x="${left - 10}" y="${r2(y + 3)}" text-anchor="end" font-family="monospace" font-size="9" fill="${C.muted}">${Math.round(
        v * 100
      )}</text>`
    );
  });

  const barsSvg = bars
    .map((v, i) => {
      const bh = Math.round(v * maxH);
      const x = left + slot * i + (slot - bw) / 2;
      const color = v > 0.7 ? C.risk3 : v > 0.4 ? C.risk2 : C.rain;
      return `<rect x="${r2(x + 4)}" y="${r2(baseY - bh + 4)}" width="${bw}" height="${bh}" fill="${C.ink}" opacity="0.16"/>
        <rect x="${r2(x)}" y="${r2(baseY - bh)}" width="${bw}" height="${bh}" fill="${color}" stroke="${C.ink}" stroke-width="2"/>
        <rect x="${r2(x)}" y="${r2(baseY - bh)}" width="${bw}" height="4" fill="${C.paper}" opacity="0.3"/>
        <text x="${r2(x + bw / 2)}" y="${baseY + 18}" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.muted}">D${i + 1}</text>`;
    })
    .join("");

  const thr = baseY - 0.6 * maxH;

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    ${grid.join("")}
    ${barsSvg}
    <rect x="${left}" y="${r2(thr)}" width="${right - left}" height="2" fill="${C.risk3}"/>
    <text x="${right}" y="${r2(thr - 8)}" text-anchor="end" font-family="monospace" font-size="9" letter-spacing="0.6" fill="${C.risk3}">REVIEW THRESHOLD 60%</text>
    <rect x="${left}" y="${baseY}" width="${right - left}" height="2" fill="${C.ink}"/>
    <text x="${left}" y="${h - 40}" font-family="monospace" font-size="9" letter-spacing="1" fill="${C.muted}">BUST PROBABILITY (%) BY LEAD DAY</text>`,
    ' shape-rendering="crispEdges" aria-label="Pixel bar chart of bust probability across ten lead days"'
  );
}

/* ------------------------------------------------------------------ *
 * feature-subdivisions.svg — light pixel map tile.
 * ------------------------------------------------------------------ */
function featureSubdivisions() {
  return pixelMap({
    w: 720,
    h: 460,
    pad: 18,
    cell: 14,
    dark: false,
    radar: false,
  });
}

/* ------------------------------------------------------------------ *
 * feature-dualmode.svg — field terminal beside the CRT ops console.
 * ------------------------------------------------------------------ */
function featureDualMode() {
  const w = 720;
  const h = 460;

  const scan = [];
  for (let y = 94; y < 398; y += 4) {
    scan.push(`<rect x="388" y="${y}" width="288" height="1" fill="#000" opacity="0.22"/>`);
  }

  const chart = "M 410 230 L 448 198 L 486 214 L 524 176 L 562 192 L 640 156";

  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${C.paper}"/>
    <rect width="${w}" height="${h}" fill="${C.paper2}" opacity="0.4"/>
    ${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 24}" y="0" width="1" height="${h}" fill="rgba(23,32,29,.06)"/>`).join("")}

    <!-- field terminal -->
    <rect x="28" y="40" width="310" height="380" fill="${C.surface}" stroke="${C.ink}" stroke-width="3"/>
    <rect x="34" y="46" width="298" height="380" fill="none" stroke="${C.ink}" stroke-width="0" opacity="0"/>
    <rect x="28" y="40" width="310" height="28" fill="${C.ink}"/>
    <text x="40" y="59" font-family="monospace" font-size="10" letter-spacing="1.4" fill="${C.paper}">FIELD TERMINAL // 01</text>
    <text x="318" y="59" text-anchor="end" font-family="monospace" font-size="10" fill="${C.paper}">[_][X]</text>
    <text x="52" y="104" font-family="monospace" font-size="20" font-weight="bold" fill="${C.ink}">DASHBOARD</text>
    <text x="52" y="122" font-family="monospace" font-size="9" letter-spacing="1.2" fill="${C.muted}">MAP / TABLE / HORIZON</text>
    <rect x="52" y="136" width="262" height="1" fill="${C.rule}"/>
    <rect x="52" y="150" width="262" height="104" fill="${C.paper2}" stroke="${C.rule}" stroke-width="1"/>
    <path d="${chart}" transform="translate(0,10)" fill="none" stroke="${C.accent}" stroke-width="3" shape-rendering="crispEdges"/>
    <rect x="52" y="268" width="126" height="62" fill="${C.paper2}" stroke="${C.rule}" stroke-width="1"/>
    <rect x="188" y="268" width="126" height="62" fill="${C.paper2}" stroke="${C.rule}" stroke-width="1"/>
    <rect x="60" y="278" width="58" height="8" fill="${C.risk2}"/>
    <rect x="60" y="292" width="88" height="4" fill="${C.muted}" opacity="0.5"/>
    <rect x="196" y="278" width="44" height="8" fill="${C.risk0}"/>
    <rect x="196" y="292" width="78" height="4" fill="${C.muted}" opacity="0.5"/>
    <text x="52" y="356" font-family="monospace" font-size="9" letter-spacing="1.1" fill="${C.muted}">DAY 1-10 SCRUBBER</text>
    <rect x="52" y="368" width="262" height="16" fill="${C.ink}"/>
    <rect x="52" y="368" width="94" height="16" fill="${C.risk3}"/>

    <!-- CRT ops console -->
    <rect x="376" y="40" width="316" height="380" fill="${C.screen}" stroke="${C.ink}" stroke-width="3"/>
    <rect x="376" y="40" width="316" height="28" fill="${C.screen2}"/>
    <rect x="376" y="66" width="316" height="2" fill="${C.mintDim}"/>
    <text x="388" y="59" font-family="monospace" font-size="10" letter-spacing="1.4" fill="${C.mint}">OPS-9 // CRT CONSOLE</text>
    <text x="678" y="59" text-anchor="end" font-family="monospace" font-size="10" fill="${C.coral}">REC</text>
    <rect x="392" y="82" width="284" height="18" fill="${C.screen2}" stroke="${C.screenLine}" stroke-width="1"/>
    <text x="399" y="95" font-family="monospace" font-size="9" fill="${C.mintDim}">&gt; SELECT ZONE _</text>
    <rect x="392" y="112" width="284" height="150" fill="${C.screen2}" stroke="${C.screenLine}" stroke-width="1"/>
    <path d="M 406 232 L 444 196 L 482 212 L 520 170 L 558 186 L 646 150" fill="none" stroke="${C.mint}" stroke-width="3" shape-rendering="crispEdges"/>
    <rect x="392" y="274" width="284" height="82" fill="${C.screen2}" stroke="${C.screenLine}" stroke-width="1"/>
    <rect x="402" y="284" width="120" height="12" fill="${C.mint}" opacity="0.18"/>
    <rect x="402" y="302" width="120" height="12" fill="${C.mint}" opacity="0.1"/>
    <rect x="402" y="320" width="120" height="12" fill="${C.signal}" opacity="0.3"/>
    <text x="536" y="292" font-family="monospace" font-size="10" fill="${C.mint}">D4  76%</text>
    <text x="536" y="308" font-family="monospace" font-size="10" fill="${C.signal}">D5  62%</text>
    <text x="536" y="324" font-family="monospace" font-size="10" fill="${C.coral}">D6  45%</text>
    <text x="392" y="378" font-family="monospace" font-size="9" letter-spacing="1.1" fill="${C.mintDim}">AMBER PHOSPHOR / WALL DISPLAY MODE</text>
    ${scan.join("")}`,
    ' shape-rendering="crispEdges" aria-label="The pixel field terminal beside the dark CRT ops console"'
  );
}

/* ------------------------------------------------------------------ *
 * Monogram avatars — pixel blocks.
 * ------------------------------------------------------------------ */
function avatar(initials, bg, fg) {
  const s = 240;
  const cell = 20;
  const blocks = [];
  for (let y = 0; y < s; y += cell) {
    for (let x = 0; x < s; x += cell) {
      if ((x / cell + y / cell) % 2 === 0) {
        blocks.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${fg}" opacity="0.07"/>`);
      }
    }
  }
  return svg(
    s,
    s,
    `<rect width="${s}" height="${s}" fill="${bg}"/>${blocks.join("")}
    <rect x="4" y="4" width="${s - 8}" height="${s - 8}" fill="none" stroke="${C.ink}" stroke-width="4"/>
    <text x="120" y="150" text-anchor="middle" font-family="monospace" font-size="92" font-weight="bold" fill="${fg}">${initials}</text>
    <rect x="20" y="20" width="16" height="16" fill="${fg}"/>
    <rect x="204" y="204" width="16" height="16" fill="${fg}"/>`,
    ' shape-rendering="crispEdges" aria-label="Team member pixel monogram"'
  );
}

/* ------------------------------------------------------------------ *
 * App icon
 * ------------------------------------------------------------------ */
function appIcon() {
  const s = 64;
  return svg(
    s,
    s,
    `<rect width="${s}" height="${s}" fill="${C.paper}"/>
    <rect x="4" y="4" width="56" height="56" fill="none" stroke="${C.ink}" stroke-width="4"/>
    <path d="M 12 44 A 20 20 0 0 1 52 44" fill="none" stroke="${C.accent}" stroke-width="5" shape-rendering="crispEdges"/>
    <path d="M 20 44 A 12 12 0 0 1 44 44" fill="none" stroke="${C.accent}" stroke-width="4" shape-rendering="crispEdges"/>
    <rect x="30" y="18" width="4" height="26" fill="${C.risk3}"/>
    <rect x="30" y="16" width="12" height="4" fill="${C.risk3}"/>
    <rect x="30" y="40" width="8" height="8" fill="${C.ink}"/>`,
    ' shape-rendering="crispEdges" aria-label="ForecastGuard icon"'
  );
}

/* ------------------------------------------------------------------ */

write("bg-topo.svg", bgTopo());
write("bg-isobars.svg", bgIsobars());
write("bg-rain.svg", bgRain());
write("bg-satellite.svg", bgSatellite());
write("bg-strip.svg", bgStrip());
write("hero-pixel.svg", heroPixel());
write("hero-atlas.svg", heroAtlas());
write("feature-horizon.svg", featureHorizon());
write("feature-subdivisions.svg", featureSubdivisions());
write("feature-dualmode.svg", featureDualMode());
write("avatar-1.svg", avatar("NV", C.surface, C.accent));
write("avatar-2.svg", avatar("ND", C.paper2, C.risk1));
write("avatar-3.svg", avatar("AV", C.surface, C.risk3));
writeFileSync(resolve(root, "app", "icon.svg"), appIcon());
console.log("wrote app/icon.svg");

/* ------------------------------------------------------------------ *
 * Pixelated photographic backdrops.
 *
 * The original monsoon photographs stay in the layout. They are resampled
 * through a coarse nearest-neighbour grid (then colour-reduced) so the
 * pixels are baked into the asset rather than relying on a CSS filter.
 * Display size is fixed at 1440px with 8–10px blocks; the UI's
 * image-rendering: pixelated keeps those blocks crisp when scaled.
 * ------------------------------------------------------------------ */
const PHOTO_BACKDROPS = [
  { src: "bg-hero.jpg", out: "bg-hero-pix.jpg", width: 1440, block: 8 },
  { src: "bg-band.jpg", out: "bg-band-pix.jpg", width: 1440, block: 8 },
  { src: "bg-satellite.jpg", out: "bg-satellite-pix.jpg", width: 1440, block: 8 },
  { src: "bg-strip.jpg", out: "bg-strip-pix.jpg", width: 1440, block: 7 },
];

for (const photo of PHOTO_BACKDROPS) {
  const input = resolve(IMG, photo.src);
  const meta = await sharp(input).metadata();
  const ratio = (meta.height ?? 1) / (meta.width ?? 1);
  const width = photo.width;
  const height = Math.round(width * ratio);

  await sharp(input)
    .resize(Math.max(8, Math.round(width / photo.block)), Math.max(8, Math.round(height / photo.block)), {
      kernel: "nearest",
    })
    .resize(width, height, { kernel: "nearest" })
    .modulate({ saturation: 0.9 })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toFile(resolve(IMG, photo.out));

  console.log(`wrote public/img/${photo.out} (${width}x${height}, ${photo.block}px blocks)`);
}

