/**
 * Normalise the chosen photographs into web-sized backdrops under public/img/.
 *
 *   node scripts/import-photos.mjs
 *
 * Sources are fetched by hand (Wikimedia rate-limits scripted downloads) into
 * .preview/photos/; see public/img/CREDITS.md for the originals and licences.
 *
 * Each output is cropped to the aspect the layout actually uses, resized, and
 * very slightly desaturated so it sits inside the paper/ink palette.
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SRC = resolve(root, ".preview", "photos");
const OUT = resolve(root, "public", "img");
mkdirSync(OUT, { recursive: true });

/*
 * anchor is where the crop sits vertically: 0 keeps the top of the frame,
 * 1 keeps the bottom. Chosen so the horizon / cloud deck lands where the
 * layout puts its text.
 */
const JOBS = [
  {
    in: "anvil.jpg",
    out: "bg-hero.jpg",
    width: 2400,
    height: 1300,
    anchor: 0.5,
    saturation: 0.55,
    quality: 76,
  },
  {
    in: "anvil.jpg",
    out: "bg-strip.jpg",
    width: 1800,
    height: 420,
    anchor: 0.3,
    saturation: 0.5,
    quality: 72,
  },
  {
    in: "kerala.jpg",
    out: "bg-band.jpg",
    width: 1844,
    height: 800,
    anchor: 0.12,
    saturation: 0.72,
    quality: 76,
  },
  {
    in: "noaa.jpg",
    out: "bg-satellite.jpg",
    width: 1600,
    height: 900,
    anchor: 0.16,
    saturation: 0.68,
    quality: 68,
  },
];

for (const job of JOBS) {
  const src = resolve(SRC, job.in);
  const meta = await sharp(src).metadata();

  /* Scale so the crop window fits, then take it from the chosen anchor. */
  const scale = Math.max(job.width / meta.width, job.height / meta.height);
  const scaledW = Math.round(meta.width * scale);
  const scaledH = Math.round(meta.height * scale);
  const left = Math.round((scaledW - job.width) / 2);
  const top = Math.round((scaledH - job.height) * job.anchor);

  const out = resolve(OUT, job.out);
  const info = await sharp(src)
    .resize(scaledW, scaledH, { fit: "fill" })
    .extract({ left, top, width: job.width, height: job.height })
    .modulate({ saturation: job.saturation })
    .jpeg({ quality: job.quality, progressive: true, mozjpeg: true })
    .toFile(out);

  const { size } = await sharp(out).metadata();
  console.log(
    `${job.out.padEnd(16)} ${info.width}x${info.height}  ${Math.round((size ?? 0) / 1024)} KB`
  );
}
