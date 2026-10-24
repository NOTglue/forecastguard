/**
 * Numeric contact sheet for candidate photographs.
 *
 *   node scripts/photo-contact.mjs .preview/photos
 *
 * For every image in the directory, prints:
 *   - dimensions, mean luminance, luminance sd, mean saturation
 *   - an ASCII luminance map (dark = ink, light = paper/highlight)
 *
 * The map is a composition proxy: it shows where the horizon sits, how much
 * clear sky a headline could occupy, and whether the frame is mostly flat.
 */
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const dir = resolve(process.argv[2] ?? ".preview/photos");
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const RAMP = " .:-=+*#%@";
const COLS = 46;

for (const f of files) {
  const img = sharp(resolve(dir, f));
  const meta = await img.metadata();
  const { data, info } = await img
    .resize({ width: COLS * 4, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels: ch } = info;
  const rows = Math.max(6, Math.round((COLS * H) / W / 2.1));
  const lum = new Float32Array(W * H);
  let sum = 0;
  let sat = 0;
  for (let p = 0, i = 0; p < W * H; p++, i += ch) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[p] = l;
    sum += l;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    sat += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const mean = sum / (W * H);
  let v = 0;
  for (let p = 0; p < lum.length; p++) v += (lum[p] - mean) ** 2;
  const sd = Math.sqrt(v / lum.length);

  console.log(
    `\n${f}  ${meta.width}x${meta.height}  ar ${(meta.width / meta.height).toFixed(2)}` +
      `  mean ${mean.toFixed(0)}  sd ${sd.toFixed(1)}  sat ${(sat / (W * H)).toFixed(2)}`
  );
  for (let ry = 0; ry < rows; ry++) {
    let line = "";
    for (let rx = 0; rx < COLS; rx++) {
      const x = Math.min(W - 1, Math.floor(((rx + 0.5) / COLS) * W));
      const y = Math.min(H - 1, Math.floor(((ry + 0.5) / rows) * H));
      const l = lum[y * W + x];
      const idx = Math.min(RAMP.length - 1, Math.max(0, Math.round(((255 - l) / 255) * (RAMP.length - 1))));
      line += RAMP[idx];
    }
    console.log("  " + line);
  }
}
