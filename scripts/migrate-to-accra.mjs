// Codemod: map the retired palette's Tailwind utilities onto the Accra tokens.
//
// The rebrand changes the palette wholesale, so every colour utility in every
// component has to move together. Doing that by hand across ~28 distinct
// utilities and 400+ call sites is where a single missed `bg-cream` would hide,
// so the mapping is applied mechanically and the build then proves nothing was
// left behind.
//
// The mapping is tonal, not literal: cream/paper are light surfaces and become
// bone; charcoal/ink are dark surfaces and become cocoa; the pastels were never
// used for meaning, only for visual variety, and become the four structural
// surfaces bone/clay/sage/cocoa. Gold becomes ochre, midnight becomes cocoa.
//
// Run:  node scripts/migrate-to-accra.mjs [--check]
//   --check  report what would change and exit non-zero if anything would

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

/** Utility prefix -> token. Prefix-preserving, so `text-cream` -> `text-bone`. */
const TOKENS = {
  cream: "bone",
  paper: "bone",
  charcoal: "cocoa",
  ink: "cocoa",
  midnight: "cocoa",
  "midnight-deep": "cocoa-soft",
  gold: "ochre",
  "gold-bright": "ochre",
  "gold-deep": "ochre",
  ivory: "bone",
  lime: "ochre",
  limedeep: "ochre",
  limeleaf: "ochre-ink",
  lavender: "clay",
  lavdeep: "clay-ink",
  peach: "clay",
  mint: "sage",
  butter: "bone",
};

/**
 * Prefixes that introduce a colour utility. Ordered longest-first where it
 * matters; the regex anchors on a word boundary so `bg-cream` matches but
 * `bg-creamish` or a hyphenated data attribute does not.
 */
const PREFIXES = [
  "bg",
  "text",
  "border",
  "from",
  "via",
  "to",
  "ring",
  "decoration",
  "fill",
  "stroke",
  "outline",
  "shadow",
  "accent",
  "caret",
  "divide",
];

const utilPattern = new RegExp(
  `\\b(${PREFIXES.join("|")})-(${Object.keys(TOKENS).join("|")})(?![a-z0-9-])`,
  "g",
);

/**
 * Files that own the palette and must not be rewritten by the codemod.
 *
 * `src/content/site.ts` used to be here because it defined the retired palette's
 * swatch names. It has been deleted, so the entry is gone: this codemod has
 * already been run and is kept only as a record of how the palette was migrated.
 * A skip list naming a file that does not exist is not a skip list.
 */
const SKIP = new Set([
  join("src", "app", "globals.css"),
  join("src", "lib", "utils.ts"),
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(tsx?|css|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// Scripts are excluded. This file names every retired token in its own mapping
// table, so scanning it would rewrite the map that drives the codemod and then
// report the map as unconverted. Only the rendered surface is in scope.
const targets = walk(join(root, "src")).filter(
  (f) => !SKIP.has(relative(root, f)),
);

const changed = [];
let totalReplacements = 0;

for (const file of targets) {
  const before = readFileSync(file, "utf8");
  let count = 0;
  const after = before.replace(utilPattern, (match, prefix, token) => {
    count++;
    return `${prefix}-${TOKENS[token]}`;
  });
  if (count > 0 && after !== before) {
    changed.push({ file: relative(root, file), count });
    totalReplacements += count;
    if (!checkOnly) writeFileSync(file, after);
  }
}

console.log(
  `${checkOnly ? "would change" : "changed"}: ${totalReplacements} replacements across ${changed.length} files`,
);
for (const { file, count } of changed.sort((a, b) => b.count - a.count)) {
  console.log(`  ${String(count).padStart(4)}  ${file}`);
}

/**
 * Report anything still referencing a retired token.
 *
 * Only meaningful after a real (non-`--check`) run: the files on disk still hold
 * the old utilities, so scanning them before writing would always report the
 * whole surface back. Under `--check` the per-file table above is the output.
 */
if (checkOnly) {
  // The header promises a non-zero exit when work is outstanding, so a CI step
  // running `--check` cannot report success while retired utilities are still in
  // the tree. The earlier version printed the table and exited 0, which is the
  // one outcome a check must never produce.
  if (changed.length > 0) {
    console.error(
      `\n${totalReplacements} retired colour reference(s) still present. ` +
        `Re-run without --check to migrate them.`,
    );
    process.exit(1);
  }
  console.log("\nno retired colour utilities remain.");
} else {
  const leftover = [];
  for (const file of targets) {
    const text = readFileSync(file, "utf8");
    const hits = [...text.matchAll(utilPattern)];
    if (hits.length) {
      leftover.push(
        `${relative(root, file)}: ${[...new Set(hits.map((h) => h[0]))].join(", ")}`,
      );
    }
  }

  if (leftover.length) {
    console.error("\nstill referencing retired tokens:");
    for (const l of leftover) console.error(`  ${l}`);
    process.exit(1);
  }

  console.log("\nno retired colour utilities remain.");
}
