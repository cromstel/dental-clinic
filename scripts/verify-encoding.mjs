// Find text that was written as UTF-8 bytes but read back as cp1252 — the
// classic "U+00E2€”" for an em dash, "U+00C2·" for a middle dot.
//
// Why this exists. Every occurrence below is one of these:
//
//   E2 80 94  (em dash)  read as cp1252  ->  U+00E2  U+20AC  U+201D
//   C2 B7    (·)         read as cp1252  ->  U+00C2  U+00B7
//   E2 80 99  (’)         read as cp1252  ->  U+00E2  U+20AC  U+02DC
//
// So the *lead* character is always U+00C2 for a 2-byte original and U+00E2
// (U+00E2) for a 3-byte one. Neither ever appears in correctly-encoded text here:
// a real middle dot is U+00B7, a real em dash is U+2014, a real apostrophe is
// U+2019 or plain ASCII '.
//
// Matching on "contains a non-ASCII character" is therefore useless — this
// codebase legitimately uses em dashes, middle dots, en dashes and arrows in
// both prose and copy, and a scanner that flags those would fail on almost
// every line. The discriminator is the lead character, so that is what is
// matched.
//
// Read as UTF-8 explicitly. The default codec on Windows reproduces the
// corruption instead of revealing it.
//
// Reports file, line and the surrounding text so the fix is obvious.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const root = process.cwd();
const TEXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".md", ".json", ".txt", ".html", ".svg", "",
]);
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "deploy", ".git"]);

/**
 * The two signatures of a cp1252 mis-decode, written as escapes so this file
 * cannot itself contain the characters it looks for:
 *
 *   U+00C2 + a code point in U+00A0..U+00FF   lead of a 2-byte sequence
 *   U+00E2 + a code point in U+0080..U+20AC   lead of a 3-byte sequence
 *
 * e.g. a middle dot and an em dash respectively. The examples are spelled out
 * with escapes in the table below rather than written literally, because this
 * file is itself scanned and a raw glyph here would be a permanent finding.
 *
 * A bare U+00B7 middle dot or U+2014 em dash is correct text and must not be
 * flagged — this codebase uses both heavily, so the check keys on the lead
 * character only.
 */
const LEAD_RE = /[\u00c2\u00e2]/;

/**
 * Whole residues, so the report can name the character that was meant. The lead
 * character alone is ambiguous: U+00C2 could begin any of several sequences.
 */
const RESIDUE = new Map([
  ["\u00e2\u20ac\u201d", "em dash"],
  ["\u00e2\u20ac\u2013", "en dash"],
  ["\u00e2\u20ac\u2026", "ellipsis"],
  ["\u00e2\u20ac\u02dc", "right single quote"],
  ["\u00e2\u20ac\u201c", "left double quote"],
  ["\u00e2\u20ac\u2122", "trademark sign"],
  ["\u00c2\u00b7", "middle dot"],
  ["\u00c2\u00b0", "degree sign"],
  ["\u00c2\u00a9", "copyright sign"],
  ["\u00c3\u00a9", "e with acute"],
  ["\u00c3\u00bc", "u with umlaut"],
  ["\u00c3\u00b6", "o with umlaut"],
  ["\u00c3\u00a4", "a with umlaut"],
  ["\u00c3\u00b1", "n with tilde"],
]);

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

const findings = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!LEAD_RE.test(line)) continue;
    const hits = [];
    for (const [residue, intended] of RESIDUE) {
      if (line.includes(residue)) hits.push(intended);
    }
    findings.push({
      file: relative(root, file),
      line: i + 1,
      hits: [...new Set(hits)],
      text: line.trim(),
    });
  }
}

if (!findings.length) {
  console.log(`verify-encoding: OK — ${files.length} text files, no mis-decoded text.`);
  process.exit(0);
}

console.error(`verify-encoding: FAILED — ${findings.length} line(s) with mis-decoded text:\n`);
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}
for (const [file, list] of byFile) {
  console.error(`  ${file}`);
  for (const f of list.slice(0, 5)) {
    const preview = f.text.length > 80 ? f.text.slice(0, 80) + "…" : f.text;
    console.error(`    L${f.line}  ${preview}`);
    if (f.hits.length) console.error(`           intended: ${f.hits.slice(0, 4).join(", ")}`);
  }
  if (list.length > 5) console.error(`    …and ${list.length - 5} more line(s)`);
}
console.error(
  "\n  UTF-8 bytes were decoded as cp1252 and written back. Run\n" +
    "  `node scripts/fix-encoding.mjs` to repair them.",
);
process.exit(1);