/*
  Static verification for design/accra-dental-atelier.html.

  Checks the things a browser would otherwise be needed for: that the file is
  well-formed enough to parse, that every aria-controls points at a real id,
  that heading order never skips a level, that no `id` is duplicated, that
  contrast tokens in the CSS clear WCAG, and that the file is not reachable
  from the static export.

  Run: node design/verify-artifact.mjs
  Exits non-zero on any failure so it can be wired into a pre-commit hook if
  the artifact is ever promoted from proposal to shipped page.
*/

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, "accra-dental-atelier.html");
const html = readFileSync(file, "utf8");

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
const note = (m) => notes.push(m);

/* ── 1. Structure ─────────────────────────────────────────────────────── */
const checks = [
  ["has doctype", /^<!DOCTYPE html>/i.test(html)],
  ["has lang attribute", /<html[^>]+lang="en"/i.test(html)],
  ["has viewport meta", /name="viewport"/i.test(html)],
  ["has title", /<title>[\s\S]{10,}<\/title>/i.test(html)],
  ["has meta description", /name="description"[\s\S]{20,}?\/>/i.test(html)],
  ["closes html", /<\/html>\s*$/i.test(html.trim())],
  ["has skip link", /class="skip"/i.test(html)],
  ["has single main landmark", (html.match(/<main\b/gi) || []).length === 1],
  ["exactly one h1", (html.match(/<h1\b/gi) || []).length === 1],
  ["footer present", /<footer\b/i.test(html)],
];
for (const [label, ok] of checks) (ok ? note : fail)(`structure: ${label}`);

/* ── 2. Heading order: first must be h1, then never skip a level ─────── */
const headings = Array.from(html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)).map((m) => ({
  level: Number(m[1]),
  text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 48),
}));
// The transition check alone has a hole: it starts prev at 0, so a document
// whose FIRST heading is an h3 reports no jump. Assert the opening level too.
if (!headings.length) {
  fail("a11y: no headings found");
} else if (headings[0].level !== 1) {
  fail(`a11y: first heading is h${headings[0].level} ("${headings[0].text}"), expected h1`);
}
let prev = 0;
for (const h of headings) {
  if (prev && h.level > prev + 1) {
    fail(`a11y: heading jumps h${prev} -> h${h.level} ("${h.text}")`);
  }
  prev = h.level;
}
note(`a11y: ${headings.length} headings, first is h${headings[0]?.level ?? 0}, no level skipped`);

/* ── 3. IDs unique, and every aria-controls / labelledby resolves ────── */
const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g)).map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) fail(`a11y: duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
else note(`a11y: ${ids.length} ids, all unique`);

for (const attr of ["aria-controls", "aria-labelledby"]) {
  const refs = Array.from(html.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))).flatMap((m) =>
    m[1].split(/\s+/)
  );
  for (const ref of refs) {
    if (!ids.includes(ref)) fail(`a11y: ${attr}="${ref}" has no matching id`);
  }
  note(`a11y: ${refs.length} ${attr} reference(s) all resolve`);
}

/* ── 4. Expandable rows are real buttons with correct state ───────────── */
const btns = Array.from(html.matchAll(/<button[^>]*class="index__btn"[^>]*>/g)).map((m) => m[0]);
if (btns.length !== 6) fail(`a11y: expected 6 index buttons, found ${btns.length}`);
for (const b of btns) {
  if (!/aria-expanded="false"/.test(b)) fail(`a11y: index button missing aria-expanded="false"`);
  if (!/aria-controls="/.test(b)) fail(`a11y: index button missing aria-controls`);
  if (!/type="button"/.test(b)) fail(`a11y: index button missing type="button"`);
}
note(`a11y: ${btns.length} index buttons wired as aria-disclosed`);

/* ── 5. Decorative SVG is hidden from AT ──────────────────────────────── */
const svgs = Array.from(html.matchAll(/<svg\b[\s\S]*?>/g)).map((m) => m[0]);
const unhideable = svgs.filter((s) => !/aria-hidden="true"/.test(s));
if (unhideable.length) fail(`a11y: ${unhideable.length} <svg> not aria-hidden`);
else note(`a11y: all ${svgs.length} svg elements are aria-hidden`);

/* ── 6. Reduced-motion block present and complete ─────────────────────── */
const rm = html.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n {2}\}/);
if (!rm) {
  fail("a11y: no prefers-reduced-motion block");
} else {
  for (const needed of [".reveal", ".marquee__track", ".hero .stagger > *", "scroll-behavior"]) {
    if (!rm[1].includes(needed)) fail(`a11y: reduced-motion block missing ${needed}`);
  }
  note("a11y: reduced-motion block covers reveal, marquee, hero stagger, scroll");
}

/* ── 7. Contrast of the declared token pairs ──────────────────────────── */
const hexes = {};
for (const m of html.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)) hexes[m[1]] = m[2];
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Pairs the design actually uses for text on its intended background.
// These must be pairs that genuinely appear in the CSS — an earlier version
// tested bone-dim on --clay, which the page never rendered, while the pair it
// did render (bone on the band) was failing. Every entry below is a real
// selector in the stylesheet.
const pairs = [
  ["bone", "cocoa", 4.5, "body text on the cocoa surface"],
  ["bone-dim", "cocoa", 4.5, "secondary text on cocoa"],
  ["bone-dim", "cocoa-card", 4.5, "secondary text on the raised card surface"],
  ["ochre", "cocoa", 4.5, "eyebrows and figure numbers on cocoa"],
  ["ochre", "cocoa-soft", 4.5, "eyebrows on the approach band"],
  ["ink", "bone", 4.5, "type on the bone band"],
  ["clay-ink", "bone", 4.5, "eyebrow + emphasis on the bone band"],
  ["bone", "clay", 4.5, "body copy on the clay booking band"],
  ["bone-on-clay", "clay", 4.5, "list labels on the clay band"],
  ["ochre", "clay", 3.0, "emphasis in the booking title (display, large)"],
  ["ochre-ink", "ochre", 4.5, "button label on the ochre fill"],
];
for (const [fg, bg, min, what] of pairs) {
  if (!hexes[fg] || !hexes[bg]) {
    fail(`contrast: token --${fg} or --${bg} not found`);
    continue;
  }
  const r = ratio(hexes[fg], hexes[bg]);
  const ok = r >= min;
  (ok ? note : fail)(
    `contrast: ${what} — ${fg} on ${bg} = ${r.toFixed(2)}:1 (needs ${min})`
  );
}

/* ── 8. Banned aesthetic tells ─────────────────────────────────────────── */
const banned = [
  [/#1e88e5|blue-\d{3}|--color-blue/i, "blue healthcare palette"],
  [/linear-gradient\([^)]*#\d{0,2}8{0,2}\b(?:b|e|d)\b/i, "suspicious blue gradient"],  // Word boundaries matter: a bare /Inter/ matches "IntersectionObserver".
  // Only flag these as an actual font-family declaration.
  [
    /font-family\s*:[^;}]*\b(Inter|Roboto|Arial|Helvetica)\b/i,
    "generic sans stack in a font-family declaration",
  ],
  [/Space Grotesk/i, "over-used display face"],
  [/grid-cols-3|repeat\(\s*3\s*,/, "three-up card grid"],
  [/\bicon-grid|fa-|\bsvg-icon\b/i, "icon grid"],
  [/lorem ipsum/i, "placeholder copy left in"],
];
for (const [re, what] of banned) {
  if (re.test(html)) fail(`aesthetic: ${what} detected`);
  else note(`aesthetic: no ${what}`);
}

/* ── 9. The artifact must not be reachable from the static export ────────
   Checked as a RECURSIVE search, not just at the root of each folder. A copy at
   public/design/accra-dental-atelier.html passes a root-only check, but Next
   copies all of public/ into out/ verbatim, so nested paths ship too. */
function findUnder(dir, filename, depth = 0) {
  if (depth > 6) return [];
  let hits = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isFile() && e.name === filename) hits.push(full);
    else if (e.isDirectory() && e.name !== "node_modules") {
      hits = hits.concat(findUnder(full, filename, depth + 1));
    }
  }
  return hits;
}

let leaked = false;
for (const p of ["public", "src", "out"]) {
  const hits = findUnder(join(here, "..", p), "accra-dental-atelier.html");
  if (hits.length) {
    leaked = true;
    hits.forEach((h) => fail(`packaging: artifact present at ${h} and would ship`));
  }
}
if (!leaked) {
  note("packaging: recursive search of public/, src/, out/ — artifact cannot ship");
}

/* ── Report ───────────────────────────────────────────────────────────── */
console.log("verify-artifact — accra-dental-atelier.html\n");
for (const n of notes) console.log("  PASS  " + n);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log("  FAIL  " + f);
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`\nAll ${notes.length} checks passed.`);
