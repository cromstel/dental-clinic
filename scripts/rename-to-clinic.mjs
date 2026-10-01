// Rename the brand from "Accra Dental Atelier" to "Accra Dental Clinic".
//
// Driven as a script rather than by hand because the name appears in 12 tracked
// files plus a filename, in four surface forms — title case, an all-caps
// wordmark, a lowercase social handle, and a kebab-case filename. Editing those
// one at a time is exactly where a single miss hides.
//
// Idempotent: running twice is a no-op the second time.

import { readFileSync, writeFileSync, readdirSync, statSync, renameSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

const TEXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".md", ".json", ".txt", ".html", ".svg", "",
]);
const SKIP = new Set(["node_modules", ".next", "out", "deploy", ".git"]);

/**
 * Ordered longest-first so `Accra Dental Atelier` is consumed before any shorter
 * pattern can match part of it.
 *
 * The all-caps entry is separate because the wordmark is a different literal, and
 * the handle is separate because `@accradentalatelier` and the URL slug share it
 * but not the spacing. Both were placeholders I invented when there was no real
 * handle to use; they follow the new name so the site is at least internally
 * consistent, and are still flagged as needing real values.
 */
const REPLACEMENTS = [
  ["ACCRA DENTAL ATELIER", "ACCRA DENTAL CLINIC"],
  ["Accra Dental Atelier", "Accra Dental Clinic"],
  ["accra-dental-atelier", "accra-dental-clinic"],
  ["accradentalatelier", "accradentalclinic"],
  // Bare lowercase, for prose that uses the word on its own.
  ["atelier", "clinic"],
];

/**
 * `SKIP` skips build and VCS directories, but the `startsWith(".")` test that
 * normally accompanies it is deliberately absent.
 *
 * It hid `.htaccess` — the one dotfile that ships to production, and the file a
 * non-developer is most likely to open when debugging cache or MIME behaviour.
 * The rename reported itself clean while the archive still shipped the old name
 * in that file's header, which is how the packaging verification caught it.
 *
 * `SKIP` already lists every directory that should not be scanned, so descending
 * on dot-directories is safe. If one needs excluding, add it to `SKIP` by name.
 */
function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (TEXT.has(extname(e.name))) acc.push(p);
  }
  return acc;
}

/**
 * This script is excluded from its own scan. It names every old form in its
 * replacement table, so including it would rewrite the map that drives the
 * rename and then report the map as unconverted — the same trap
 * migrate-to-accra.mjs walks into. Its contents are the tool, not the site.
 */
const SELF = relative(root, fileURLToPath(import.meta.url));

const dirs = ["src", "scripts", ".github", "design", "public"]
  .map((d) => join(root, d))
  .filter((d) => statSync(d, { throwIfNoEntry: false }));
const files = dirs.flatMap((d) => walk(d)).filter((f) => relative(root, f) !== SELF);
for (const f of ["README.md", "CHANGELOG.md", "SECURITY.md", "CONTRIBUTING.md", "LICENSE"]) {
  if (statSync(join(root, f), { throwIfNoEntry: false })) files.push(join(root, f));
}

const changed = [];
let total = 0;

for (const file of files) {
  const before = readFileSync(file, "utf8");
  let after = before;
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    const parts = after.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      after = parts.join(to);
    }
  }
  if (count > 0 && after !== before) {
    total += count;
    changed.push({ file: relative(root, file), count });
    if (!checkOnly) writeFileSync(file, after, "utf8");
  }
}

/* Filenames. Only the design artifact carries the name; nothing in src/ does. */
const RENAMES = [["design/accra-dental-atelier.html", "design/accra-dental-clinic.html"]];
for (const [from, to] of RENAMES) {
  const src = join(root, from);
  const dst = join(root, to);
  if (statSync(src, { throwIfNoEntry: false })) {
    changed.push({ file: `${from} -> ${to}`, count: 1, rename: true });
    if (!checkOnly) renameSync(src, dst);
  }
}

changed.sort((a, b) => b.count - a.count);
console.log(`${checkOnly ? "would rename" : "renamed"}: ${total} occurrences in ${changed.length} places`);
for (const { file, count } of changed) console.log(`  ${String(count).padStart(3)}  ${file}`);

if (!checkOnly) {
  // Re-scan the tree. A miss here is a patient-facing artefact still carrying
  // the old name, which is the one outcome the rename exists to prevent.
  const leftover = [];
  for (const file of files) {
    // Read directly rather than stat-then-read. The existence check was a
    // TOCTOU: a file removed between the two calls makes `readFileSync` throw,
    // and the guard would abort on an unrelated ENOENT instead of reporting the
    // stale name it exists to find. One call, one failure mode. (CodeQL flagged
    // this as `js/file-system-race`.)
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") continue; // vanished mid-run; nothing to scan
      throw err;
    }
    const hits = text.match(/atelier/gi);
    if (hits) leftover.push(`${relative(root, file)}: ${hits.length}`);
  }
  for (const [from] of RENAMES) {
    if (statSync(join(root, from), { throwIfNoEntry: false })) leftover.push(`${from} still exists`);
  }
  if (leftover.length) {
    console.error("\nold name still present:");
    for (const l of leftover) console.error(`  ${l}`);
    process.exit(1);
  }
  console.log("\nno occurrence of the old name remains.");
}