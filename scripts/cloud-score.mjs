/**
 * Score candidate photographs as full-bleed backdrops.
 *
 *   node scripts/cloud-score.mjs .preview/photos
 *
 * A good backdrop needs structure across the whole frame (so it reads at any
 * scroll position), no blown-out region for text to disappear into, and a
 * narrow, low-chroma tonal range so it sits inside the paper palette.
 *
 * Prints, per file:
 *   mean / sd / saturation
 *   per-quarter luminance sd (the weakest quarter is the limiting one)
 *   clipping: fraction of pixels above 246 and below 12
 */
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const dir = resolve(process.argv[2] ?? ".preview/photos");
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();

const rows = [];
for (const f of files) {
  const { data, info } = await sharp(resolve(dir, f))
    .resize({ width: 480 })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const lum = new Float32Array(W * H);
  let sum = 0;
  let sat = 0;
  let hi = 0;
  let lo = 0;
  for (let p = 0, i = 0; p < W * H; p++, i += ch) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[p] = l;
    sum += l;
    if (l > 246) hi++;
    if (l < 12) lo++;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    sat += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const n = W * H;
  const mean = sum / n;

  const quarters = [0, 1, 2, 3].map((q) => {
    const y0 = Math.floor((q * H) / 4);
    const y1 = Math.floor(((q + 1) * H) / 4);
    let s = 0;
    let c = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) {
        s += lum[y * W + x];
        c++;
      }
    }
    const m = s / c;
    let v = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) v += (lum[y * W + x] - m) ** 2;
    }
    return { m, sd: Math.sqrt(v / c) };
  });

  let v = 0;
  for (let p = 0; p < n; p++) v += (lum[p] - mean) ** 2;
  const sd = Math.sqrt(v / n);
  const minBandSd = Math.min(...quarters.map((q) => q.sd));

  rows.push({
    f,
    mean,
    sd,
    minBandSd,
    sat: sat / n,
    hi: hi / n,
    lo: lo / n,
    quarterMeans: quarters.map((q) => q.m.toFixed(0)).join(" / "),
  });
}

rows.sort((a, b) => b.minBandSd - a.minBandSd);
console.log(
  "file".padEnd(16) +
    "mean".padStart(6) +
    "sd".padStart(7) +
    "minQ".padStart(7) +
    "sat".padStart(7) +
    "blown%".padStart(8) +
    "black%".padStart(8) +
    "   quarter means"
);
for (const r of rows) {
  console.log(
    r.f.padEnd(16) +
      r.mean.toFixed(0).padStart(6) +
      r.sd.toFixed(1).padStart(7) +
      r.minBandSd.toFixed(1).padStart(7) +
      r.sat.toFixed(2).padStart(7) +
      (r.hi * 100).toFixed(1).padStart(8) +
      (r.lo * 100).toFixed(1).padStart(8) +
      "   " +
      r.quarterMeans
  );
}
