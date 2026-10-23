/**
 * Row-wise luminance statistics for a page screenshot.
 *
 *   node scripts/row-stats.mjs <file.png> [bandHeight=120]
 *
 * Prints mean and standard deviation of luminance for horizontal bands,
 * so background texture can be verified numerically when there is no
 * display to look at. Flat paper reads ~0.5 sd; visible artwork reads >6.
 */
import sharp from "sharp";

const file = process.argv[2];
const band = Number(process.argv[3] ?? 120);
const x0 = Number(process.argv[4] ?? 0);
const x1 = process.argv[5] ?? "";

const { data, info } = await sharp(file)
  .flatten({ background: "#ffffff" })
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: ch } = info;
const xi0 = Math.max(0, Math.min(W, x0));
const xi1 = Math.min(W, x1 === "" ? W : Number(x1));
const lum = new Float32Array(W * H);
for (let p = 0, i = 0; p < W * H; p++, i += ch) {
  lum[p] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
}

for (let y0 = 0; y0 < H; y0 += band) {
  const y1 = Math.min(H, y0 + band);
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = xi0; x < xi1; x++) {
      sum += lum[y * W + x];
      n++;
    }
  }
  const mean = sum / n;
  let v = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = xi0; x < xi1; x++) v += (lum[y * W + x] - mean) ** 2;
  }
  const sd = Math.sqrt(v / n);
  const bar = "#".repeat(Math.min(40, Math.round(sd * 2)));
  console.log(
    `${String(y0).padStart(5)}-${String(y1).padStart(5)}  mean ${mean.toFixed(0).padStart(3)}  sd ${sd
      .toFixed(1)
      .padStart(5)}  ${bar}`
  );
}
