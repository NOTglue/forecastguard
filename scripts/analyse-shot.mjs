/**
 * Analyse a page screenshot: palette spread, luminance, saturation.
 * Used as a proxy for "does this look like a restrained print-style
 * dashboard rather than a neon AI landing page?"
 *
 *   node scripts/analyse-shot.mjs <file.png> [label]
 */
import sharp from "sharp";

const file = process.argv[2];
const label = process.argv[3] ?? file;

const { data, info } = await sharp(file)
  .resize({ width: 720, withoutEnlargement: true })
  .raw()
  .toBuffer({ resolveWithObject: true });

const n = info.width * info.height;
const ch = info.channels;

const buckets = new Map();
let sumL = 0;
let sumS = 0;
let highSat = 0;
let dark = 0;
let light = 0;

for (let i = 0; i < data.length; i += ch) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  const key = `${r >> 4},${g >> 4},${b >> 4}`;
  buckets.set(key, (buckets.get(key) ?? 0) + 1);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const s = max === 0 ? 0 : (max - min) / max;

  sumL += l;
  sumS += s;
  if (s > 0.55 && l > 0.15 && l < 0.95) highSat++;
  if (l < 0.28) dark++;
  if (l > 0.9) light++;
}

const top = [...buckets.entries()]
  .map(([k, v]) => {
    const [r, g, b] = k.split(",").map((x) => Number(x) * 16 + 8);
    return { hex: `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`, pct: (v / n) * 100 };
  })
  .sort((a, b) => b.pct - a.pct)
  .slice(0, 6);

console.log(`\n${label}  (${info.width}x${info.height})`);
console.log("  mean luminance  :", (sumL / n).toFixed(3), sumL / n > 0.75 ? "(light)" : "(dark)");
console.log("  mean saturation :", (sumS / n).toFixed(3));
console.log("  high-sat pixels :", ((highSat / n) * 100).toFixed(2) + "%");
console.log("  ink pixels      :", ((dark / n) * 100).toFixed(2) + "%");
console.log("  paper pixels    :", ((light / n) * 100).toFixed(2) + "%");
console.log("  dominant colours:");
for (const t of top) console.log(`    ${t.hex}  ${t.pct.toFixed(1)}%`);
