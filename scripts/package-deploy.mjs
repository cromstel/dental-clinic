// Package the static export as deploy/out.zip for a manual upload.
//
// WHY THIS IS IN THE REPO
// -----------------------
// The manual deploy instructions say "upload deploy/out.zip", but until this
// script existed nothing checked in produced that file — `npm run build` only
// writes `out/`, and the GitHub workflow has its own inline packaging step. So
// the documented path pointed at an artifact no operator could create. This is
// that missing step.
//
// `deploy/` is git-ignored, which is correct: the archive is a 4.7 MB build
// output and must never be committed. Only the script is tracked.
//
// WHY A HAND-ROLLED ZIP
// ---------------------
// No dependency. `zip` is not present on every host (not on Windows, which is
// where this runs), and the build already refuses to take a new dependency for
// a step that runs once at deploy time.
//
// Entries are stored or deflated per file, whichever is smaller. The payload is
// already AVIF/WebP/fonts, which do not compress, so deflating everything would
// cost seconds and save nothing.
//
// The output uses `./path` entries, which is what the static-site-archive deploy
// endpoint expects and what makes the archive extract flat rather than into a
// nested folder.

import { deflateRawSync } from "node:zlib";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outDir = join(root, "out");
const deployDir = join(root, "deploy");
const archive = join(deployDir, "out.zip");

if (!statSync(outDir, { throwIfNoEntry: false })) {
  console.error("package-deploy: no out/ directory — run `npm run build` first.");
  process.exit(1);
}

/** CRC-32, table-built. Required in every zip local file and central header. */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

// Sorted so the archive is byte-reproducible for the same input. Directory order
// from readdir is filesystem-dependent, and a deploy artefact that differs
// between runs on identical content is impossible to reason about when verifying.
const entries = walk(outDir)
  .map((abs) => ({ abs, rel: `./${relative(outDir, abs).replace(/\\/g, "/")}` }))
  .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));

if (!entries.length) {
  console.error("package-deploy: out/ is empty — run `npm run build` first.");
  process.exit(1);
}

const locals = [];
const centrals = [];
let offset = 0;

for (const { abs, rel } of entries) {
  const name = Buffer.from(rel, "utf8");
  const data = readFileSync(abs);
  const crc = crc32(data);

  const deflated = deflateRawSync(data, { level: 6 });
  const useDeflate = deflated.length < data.length;
  const payload = useDeflate ? deflated : data;
  const method = useDeflate ? 8 : 0;

  // Local file header.
  const local = Buffer.alloc(30 + name.length);
  local.writeUInt32LE(0x04034b50, 0); // local file header signature
  local.writeUInt16LE(20, 4); // version needed to extract
  local.writeUInt16LE(0, 6); // general purpose flags
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(0, 10); // mod time — fixed, so runs are reproducible
  local.writeUInt16LE(0, 12); // mod date
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(payload.length, 18); // compressed size
  local.writeUInt32LE(data.length, 22); // uncompressed size
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28); // extra field length
  name.copy(local, 30);
  locals.push(local, payload);

  // Central directory header.
  const central = Buffer.alloc(46 + name.length);
  central.writeUInt32LE(0x02014b50, 0); // central directory signature
  central.writeUInt16LE(20, 4); // version made by
  central.writeUInt16LE(20, 6); // version needed
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(method, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(payload.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt16LE(0, 30); // extra
  central.writeUInt16LE(0, 32); // comment
  central.writeUInt16LE(0, 34); // disk number start
  central.writeUInt16LE(0, 36); // internal attributes
  central.writeUInt32LE(0, 38); // external attributes
  central.writeUInt32LE(offset, 42); // relative offset of local header
  name.copy(central, 46);
  centrals.push(central);

  offset += local.length + payload.length;
}

const centralBuf = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
end.writeUInt16LE(0, 4); // this disk
end.writeUInt16LE(0, 6); // disk with central directory
end.writeUInt16LE(entries.length, 8); // entries on this disk
end.writeUInt16LE(entries.length, 10); // total entries
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16); // offset of central directory
end.writeUInt16LE(0, 20); // comment length

const zip = Buffer.concat([...locals, centralBuf, end]);

mkdirSync(deployDir, { recursive: true });
rmSync(archive, { force: true });
writeFileSync(archive, zip);

/**
 * Assert the archive contains the files whose absence is silent and total.
 *
 * `.htaccess` — without it at the root, LiteSpeed serves `.avif` as
 * `text/plain`, browsers refuse to decode it, and every `<picture>` falls back.
 * The site still returns 200 for every route, so nothing else reports it; it
 * presents as a caching problem and is not one.
 *
 * `LICENSE` — the site's legal notice, served at /LICENSE. Nothing reports its
 * absence either: the pages render identically. It is asserted here because
 * `npm run build:next` (the documented debug command) runs only `next build` and
 * skips `scripts/stage-server-config.mjs`, so `out/` from that path has no
 * `LICENSE` at all — `public/LICENSE` was removed when the licence became a
 * repository-root file staged by the build. Checking here means the archive
 * cannot be published without it.
 *
 * Checking here rather than only in the build is deliberate: this is the last
 * step before bytes leave the machine, and it is the step someone runs after a
 * partial build.
 */
const names = entries.map((e) => e.rel);
const REQUIRED = [
  ["./.htaccess", "staged from public/.htaccess by scripts/stage-server-config.mjs"],
  ["./LICENSE", "staged from the repository-root LICENSE by scripts/stage-server-config.mjs"],
];
const missing = REQUIRED.filter(([f]) => !names.includes(f)).map(([f]) => f);
if (missing.length) {
  rmSync(archive, { force: true });
  console.error(`package-deploy: archive is missing ${missing.join(", ")} — not writing it.`);
  console.error(
    "  Both are staged into out/ by scripts/stage-server-config.mjs, which runs as part\n" +
      "  of `npm run build`. `npm run build:next` runs only `next build` and skips it —\n" +
      "  use the full build, or run `node scripts/stage-server-config.mjs` after it.",
  );
  process.exit(1);
}

console.log(`package-deploy: ${zip.length.toLocaleString()} bytes, ${entries.length} entries`);
console.log("  .htaccess and LICENSE both present at the archive root");
console.log("  upload to the website document root, then deploy with archive_path: out.zip");
