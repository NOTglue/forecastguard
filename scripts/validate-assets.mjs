/**
 * Validate the generated SVG assets:
 *   - parses as XML
 *   - rasterises without error
 *   - is not blank (has real content)
 *   - the hero atlas actually contains a recognisable silhouette
 *
 *   node scripts/validate-assets.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const IMG = resolve(root, "public", "img");

let failures = 0;

for (const f of readdirSync(IMG).filter((x) => x.endsWith(".svg"))) {
  const src = readFileSync(resolve(IMG, f), "utf8");
  const problems = [];

  if (!src.startsWith("<svg")) problems.push("missing <svg> root");
  if (!src.trimEnd().endsWith("</svg>")) problems.push("unterminated </svg>");
  if ((src.match(/<svg/g) || []).length !== 1) problems.push("multiple <svg> roots");

  const { data, info } = await sharp(Buffer.from(src), { density: 144 })
    .resize({ width: 600, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  const seen = new Set();
  let opaque = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = info.channels === 4 ? data[i + 3] : 255;
    if (a > 8) opaque++;
    seen.add((r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3));
  }
  const distinct = seen.size;
  const coverage = opaque / px;

  // bg-* assets are deliberate line/texture overlays, so a low coverage is
  // expected; everything else should fill its frame.
  const minCoverage = f.startsWith("bg-") ? 0.03 : 0.2;

  if (distinct < 8) problems.push(`too few distinct colours (${distinct})`);
  if (coverage < minCoverage) problems.push(`mostly transparent (coverage ${(coverage * 100).toFixed(1)}%)`);

  if (problems.length) failures++;
  console.log(
    `${(problems.length ? "FAIL" : "ok").padEnd(5)} ${f.padEnd(28)} ${info.width}x${info.height}  colours=${String(distinct).padStart(4)}  coverage=${(coverage * 100).toFixed(1)}%` +
      (problems.length ? `\n        -> ${problems.join("; ")}` : "")
  );
}

/* Photographic backdrops: must exist, be wide enough, and carry real detail. */
for (const f of readdirSync(IMG).filter((x) => /\.jpe?g$/i.test(x)).sort()) {
  const meta = await sharp(resolve(IMG, f)).metadata();
  const { data, info } = await sharp(resolve(IMG, f))
    .resize({ width: 320 })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0;
  const n = info.width * info.height;
  const lum = [];
  for (let i = 0; i < data.length; i += info.channels) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    lum.push(l);
    sum += l;
  }
  const mean = sum / n;
  const sd = Math.sqrt(lum.reduce((a, l) => a + (l - mean) ** 2, 0) / n);

  const problems = [];
  if ((meta.width ?? 0) < 1200) problems.push(`too narrow for a full-bleed backdrop (${meta.width}px)`);
  if (sd < 10) problems.push(`almost flat (luminance sd ${sd.toFixed(1)})`);
  if (problems.length) failures++;

  console.log(
    `${(problems.length ? "FAIL" : "ok").padEnd(5)} ${f.padEnd(28)} ${meta.width}x${meta.height}  sd=${sd.toFixed(1)}` +
      (problems.length ? `\n        -> ${problems.join("; ")}` : "")
  );
}

/* The hero must contain a closed land path with a plausible point count. */
const hero = readFileSync(resolve(IMG, "hero-atlas.svg"), "utf8");
const landPath = hero.match(/<path d="M[^"]*?L[^"]*?Z" fill="#e4e0d4"/);
if (!landPath) {
  console.log("FAIL  hero-atlas.svg             land silhouette path not found");
  failures++;
} else {
  const pts = (landPath[0].match(/L/g) || []).length;
  console.log(`ok    hero-atlas.svg             land silhouette: ${pts} vertices`);
  if (pts < 30) {
    console.log("        -> silhouette too coarse");
    failures++;
  }
}

console.log(failures ? `\n${failures} problem(s) found.` : "\nAll assets valid.");
process.exit(failures ? 1 : 0);
