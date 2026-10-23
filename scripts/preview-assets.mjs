/**
 * Rasterise the generated SVGs to PNG for visual review.
 *   node scripts/preview-assets.mjs
 */
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const IMG = resolve(root, "public", "img");
const OUT = resolve(root, ".preview");
mkdirSync(OUT, { recursive: true });

const files = readdirSync(IMG).filter((f) => f.endsWith(".svg"));
for (const f of files) {
  const buf = await sharp(resolve(IMG, f), { density: 144 })
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toBuffer();
  writeFileSync(resolve(OUT, f.replace(/\.svg$/, ".png")), buf);
  console.log("rendered", f, "->", f.replace(/\.svg$/, ".png"));
}
