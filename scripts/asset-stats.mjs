/**
 * Numeric contact sheet for the generated SVGs.
 *
 *   node scripts/asset-stats.mjs public/img/bg-hero.svg [width]
 *
 * Rasterises the file and prints:
 *   - luminance min / mean / max / sd
 *   - a coarse ASCII luminance map (dark = strong ink)
 *   - the 6 most common colours
 *
 * Useful when there is no display to look at: an image that is meant to be
 * visible should have an sd well above ~8/255 and structure in the map.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const file = process.argv[2];
const width = Number(process.argv[3] ?? 720);

const svg = readFileSync(file);
const { data, info } = await sharp(svg, { density: 144 })
  .resize({ width })
  .flatten({ background: "#ffffff" })
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: ch } = info;
const lum = new Float32Array(W * H);
let min = 255;
let max = 0;
let sum = 0;

const buckets = new Map();
for (let p = 0, i = 0; p < W * H; p++, i += ch) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  lum[p] = l;
  sum += l;
  if (l < min) min = l;
  if (l > max) max = l;
  const key = `${r >> 4},${g >> 4},${b >> 4}`;
  buckets.set(key, (buckets.get(key) ?? 0) + 1);
}

const mean = sum / (W * H);
let varSum = 0;
for (let p = 0; p < lum.length; p++) varSum += (lum[p] - mean) ** 2;
const sd = Math.sqrt(varSum / lum.length);

const RAMP = " .:-=+*#%@";
const cols = 56;
const rows = Math.max(8, Math.round((cols * H) / W / 2.1));
const map = [];
for (let ry = 0; ry < rows; ry++) {
  let line = "";
  for (let rx = 0; rx < cols; rx++) {
    const x = Math.min(W - 1, Math.floor(((rx + 0.5) / cols) * W));
    const y = Math.min(H - 1, Math.floor(((ry + 0.5) / rows) * H));
    const l = lum[y * W + x];
    const idx = Math.min(RAMP.length - 1, Math.max(0, Math.round(((255 - l) / 255) * (RAMP.length - 1))));
    line += RAMP[idx];
  }
  map.push(line);
}

const top = [...buckets.entries()]
  .map(([k, v]) => {
    const [r, g, b] = k.split(",").map((x) => Number(x) * 16 + 8);
    const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    return { hex, pct: (v / (W * H)) * 100 };
  })
  .sort((a, b) => b.pct - a.pct)
  .slice(0, 6);

console.log(`\n${file}  (${W}x${H})`);
console.log(`  luminance  min ${min.toFixed(0)}  mean ${mean.toFixed(0)}  max ${max.toFixed(0)}  sd ${sd.toFixed(1)}`);
console.log(`  contrast   ${((max - min) / 255).toFixed(2)} range`);
console.log("  dominant   " + top.map((t) => `${t.hex} ${t.pct.toFixed(1)}%`).join("  "));
console.log("");
for (const line of map) console.log("  " + line);
