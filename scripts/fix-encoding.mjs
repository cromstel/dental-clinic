// Repair UTF-8 that was decoded as latin1/cp1252 and written back.
//
// One round of the wrong decode maps each original character to a short
// sequence. A middle dot (bytes C2 B7) becomes U+00C2 followed by U+00B7 —
// which renders as "·" — and an em dash (bytes E2 80 94) becomes U+00E2,
// U+20AC, U+201D. Decoding that text as latin1 re-derives the original bytes,
// and decoding *those* as UTF-8 restores the character.
//
// So the repair is that round trip, not a lookup table. It cannot guess, and it
// leaves correct text alone: valid UTF-8 survives a latin1 round trip unchanged.
//
// Detection is signature-based, not "contains a non-ASCII character". This
// project legitimately uses em dashes, middle dots and arrows, so a general
// non-ASCII scan flags real content. What identifies corruption is the
// leading C1/latin1-supplement character — U+00C2 and U+00E2 only ever
// appear here as the residue of a multi-byte sequence read one code page too
// few. A bare "·" is fine; "·" is not.
//
// Only whole runs are rewritten, and each rewrite is accepted only when it
// yields valid UTF-8, contains no U+FFFD, introduces no new suspicious run, and
// is strictly shorter than what it replaced.
//
// Idempotent: a second run finds nothing.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const TEXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".md", ".json", ".txt", ".html", ".svg", "",
]);
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "deploy", ".git"]);

/**
 * Residue of a multi-byte UTF-8 sequence read as a single-byte code page:
 *   U+00C2 — lead byte of a 2-byte sequence, e.g. ·  é  °
 *   U+00E2 — lead byte of a 3-byte sequence, e.g. —  '  "  …
 *
 * Written as escapes so this file does not itself contain the characters it
 * looks for; verify-encoding.mjs scans scripts/ too and would otherwise flag
 * this pattern as a finding forever.
 *
 * No correctly-encoded text in this project contains either, because a real
 * middle dot is U+00B7 and a real em dash is U+2014.
 */
const CORRUPT = new RegExp(`[\u00c2\u00e2]`);

/**
 * Reverse the cp1252 mis-decode for one character.
 *
 * The corruption was produced by reading UTF-8 bytes as **cp1252**, not latin1.
 * The two agree below U+0080 and at U+00A0+, and differ across U+0080–U+009F,
 * where cp1252 maps a byte to a printable character and latin1 maps it to a C1
 * control. That is the whole reason an em dash comes back as three characters
 * whose last one is U+201D rather than U+0094:
 *
 *     em dash  E2 80 94  ->  U+00E2, U+20AC, U+201D
 *
 * Encoding that text back with Buffer.from(run, "latin1") is therefore wrong:
 * latin1 masks the code point to a byte, so U+201D becomes 0x1D instead of
 * 0x94, the byte sequence stops being valid UTF-8, and the repair silently
 * declines. An earlier version did exactly that and left every em dash alone.
 *
 * So the byte for each character has to come from the cp1252 table.
 */
const CP1252_HIGH = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
  [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
  [0x017e, 0x9e], [0x0178, 0x9f],
]);

/** The original byte a mis-decoded character came from. */
function originalByte(ch) {
  const cp = ch.codePointAt(0);
  if (CP1252_HIGH.has(cp)) return CP1252_HIGH.get(cp);
  if (cp <= 0xff) return cp;
  return null; // outside cp1252, so not part of a mis-decode
}

/**
 * Try to repair the run that starts at `start`.
 *
 * Candidate widths are tried longest-first and the first that decodes wins.
 * Width cannot be inferred from a character class, because the third character
 * of a 3-byte mis-decode sits above U+00FF (U+201D for an em dash). So both
 * widths are attempted and only a valid, strictly shorter decode is accepted.
 */
function repairRun(text, start) {
  for (const width of [3, 2]) {
    if (start + width > text.length) continue;
    const run = text.slice(start, start + width);
    const bytes = [];
    let ok = true;
    for (const ch of run) {
      const b = originalByte(ch);
      if (b === null) {
        ok = false;
        break;
      }
      bytes.push(b);
    }
    if (!ok) continue;

    let decoded;
    try {
      decoded = new TextDecoder("utf-8", { fatal: true }).decode(
        Buffer.from(bytes),
      );
    } catch {
      continue; // wrong width for this position
    }
    if (decoded.includes("�")) continue;
    if (decoded.length >= run.length) continue; // a repair always collapses
    if (CORRUPT.test(decoded)) continue;
    return { text: decoded, next: start + width };
  }
  return null;
}

function repairText(text) {
  let out = "";
  let i = 0;
  let runs = 0;
  while (i < text.length) {
    if (CORRUPT.test(text[i])) {
      const fixed = repairRun(text, i);
      if (fixed) {
        out += fixed.text;
        runs++;
        i = fixed.next;
        continue;
      }
    }
    out += text[i];
    i++;
  }
  return { out, runs };
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (TEXT.has(extname(entry.name))) out.push(full);
  }
  return out;
}

const ROOTS = ["src", "scripts", "design", ".github"]
  .map((d) => join(root, d))
  .filter((d) => {
    try {
      return statSync(d).isDirectory();
    } catch {
      return false;
    }
  });
for (const f of ["README.md", "CHANGELOG.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md"]) {
  try {
    statSync(join(root, f));
    ROOTS.push(join(root, f));
  } catch {
    /* absent */
  }
}

const files = [];
for (const r of ROOTS) {
  if (statSync(r).isDirectory()) walk(r, files);
  else files.push(r);
}

const changed = [];
for (const file of files) {
  const before = readFileSync(file, "utf8");
  if (!CORRUPT.test(before)) continue;
  const { out, runs } = repairText(before);
  if (out !== before) {
    changed.push({ file: relative(root, file), runs });
    if (!checkOnly) writeFileSync(file, out, "utf8");
  }
}

console.log(`${checkOnly ? "would repair" : "repaired"}: ${changed.length} file(s)`);
for (const { file, runs } of changed.sort((a, b) => b.runs - a.runs)) {
  console.log(`  ${String(runs).padStart(4)} runs  ${file}`);
}

if (changed.length === 0) console.log("\nnothing to repair.");
else if (checkOnly) console.log("\nre-run without --check to apply.");