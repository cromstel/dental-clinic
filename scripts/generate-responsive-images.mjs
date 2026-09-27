/**
 * Generates responsive image variants (AVIF + a single WebP fallback) for all
 * site images.
 *
 * For each image it produces:
 *   {name}.avif            - re-encoded original (quality 71, effort 9)
 *   {name}-{w}w.avif       - AVIF at width {w} (full srcset)
 *   {name}-{min}w.webp     - ONE WebP at the smallest width, so Safari < 16.4
 *                            (which cannot decode AVIF) still gets an image.
 *                            Deliberately not a full WebP srcset: it saves disk
 *                            and old-Safari traffic is negligible; a single
 *                            400w file degrades gracefully.
 *
 * AVIF q71/effort9 measured ~7% smaller than q72 with no visible change.
 * Usage: node scripts/generate-responsive-images.mjs
 */
import { readdir, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ENCODE_AVIF = { quality: 71, effort: 9 };
const ENCODE_WEBP = { quality: 76 };

/** Widths to generate per directory (each usage passes a matching subset). */
const SOURCES = [
  { dir: "public/images/services", widths: [400, 800, 1200] },
  { dir: "public/images/doctors", widths: [400, 800] },
  { dir: "public/images/transform", widths: [400, 800, 1200, 1600] },
];

async function generateVariants(filePath, widths) {
  const meta = await sharp(filePath).metadata();
  const base = path.basename(filePath, path.extname(filePath));
  const dir = path.dirname(filePath);

  // 1. Re-encode the original to AVIF (tmp file, then rename over the source).
  const tmp = path.join(dir, `${base}.tmp.avif`);
  await sharp(filePath).avif(ENCODE_AVIF).toFile(tmp);
  await rename(tmp, filePath);

  // 2. Generate width variants in AVIF. Never upscale.
  const done = [];
  for (const w of widths) {
    if (w > meta.width) continue;
    const h = Math.round((meta.height / meta.width) * w);
    await sharp(filePath)
      .resize({ width: w, height: h })
      .avif(ENCODE_AVIF)
      .toFile(path.join(dir, `${base}-${w}w.avif`));
    done.push(w);
  }

  // 3. Single WebP at the smallest variant width (old-browser fallback).
  let webp = false;
  if (done.length) {
    const w = Math.min(...done);
    await sharp(filePath)
      .resize({ width: w, height: Math.round((meta.height / meta.width) * w) })
      .webp(ENCODE_WEBP)
      .toFile(path.join(dir, `${base}-${w}w.webp`));
    webp = true;
  }
  return { base, done, webp };
}

async function main() {
  let total = 0;
  for (const { dir, widths } of SOURCES) {
    const files = (await readdir(dir)).filter(
      (f) => f.endsWith(".avif") && !/-\d+w\.avif$/.test(f) && !f.includes(".tmp.")
    );
    for (const f of files) {
      const filePath = path.join(dir, f);
      const { base, done, webp } = await generateVariants(filePath, widths);
      total += done.length + 1 + (webp ? 1 : 0);
      console.log(`✓ ${dir}/${base}.avif -> ${done.map((w) => `${w}w`).join(", ")}${webp ? " + webp fallback" : ""} (${done.length + (webp ? 2 : 1)} files)`);
    }
  }
  console.log(`\nDone. Generated ${total} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});