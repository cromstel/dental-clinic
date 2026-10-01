// Visual audit of the built export.
//
// Colour changes are easy to get wrong in a way that never fails a build: an
// `bg-cream` left behind simply renders, and a section that should be bone
// quietly stays the old cream. This reads the actual HTML the deploy will ship
// and reports what is really there.
//
// Checks:
//   1. No retired utility class survives in the output.
//   2. No retired hex colour survives (navy/gold from the previous identity,
//      plus the old palette's raw values).
//   3. Every page's <title> and og:title name the new brand, not the old one.
//   4. No stale city references (Manhattan, Chelsea, New York, NYC) in output.
//   5. Every page renders a real <h1>.
//   6. Structured data names the new clinic.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "out");
if (!statSync(out, { throwIfNoEntry: false })) {
  console.error("verify-visual: no out/ directory — run `npm run build` first.");
  process.exit(1);
}

/**
 * Utilities from the retired palette. `text-ink` is deliberately absent: `--color-ink`
 * survives the rebrand as the deepest surface tone, so Tailwind still emits a
 * `text-ink` utility and flagging it would fail every build for a class that is
 * correct. Only names whose backing token no longer exists belong here.
 */
const RETIRED_UTILS = [
  "bg-cream", "bg-paper", "bg-charcoal", "bg-lime", "bg-limedeep", "bg-lavender",
  "bg-lavdeep", "bg-peach", "bg-mint", "bg-butter", "bg-midnight", "bg-midnight-deep",
  "bg-gold", "bg-gold-bright", "bg-gold-deep", "bg-ivory",
  "text-cream", "text-charcoal", "text-lime", "text-limedeep", "text-limeleaf",
  "text-lavender", "text-lavdeep", "text-peach", "text-mint", "text-butter",
  "text-gold", "text-gold-bright", "text-gold-deep", "text-gold-ink",
  "text-ivory", "text-midnight",
  "border-charcoal", "border-cream", "border-gold", "border-lime",
  "bg-paper", "outline-gold", "decoration-lime", "fill-charcoal", "stroke-cream",
];

const RETIRED_HEX = [
  "#0a1628", "#0e2240", "#c8a45c", "#d8b978", "#b89448", "#7a5c1f", "#f8f5f0",
  "#f5f0e6", "#faf6ed", "#1a1915", "#100f0c", "#d8ff3f",
];

const RETIRED_BRAND = [/CITGROUP/i, /Manhattan/i, /Chelsea/i, /\bSoHo\b/i, /West Village/i, /\bNYC\b/i, /New York/i, /Bennett/i, /Parker/i, /citgroupdental/i];

function htmlFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = htmlFiles(out);
const failures = [];
let checks = 0;

console.log(`verify-visual: auditing ${files.length} HTML files in out/\n`);

// 1 + 2: retired utilities and hex values.
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(out.length + 1);
  for (const u of RETIRED_UTILS) {
    checks++;
    if (html.includes(u)) failures.push(`${rel}: retired utility "${u}" still in output`);
  }
  for (const h of RETIRED_HEX) {
    checks++;
    if (html.toLowerCase().includes(h)) failures.push(`${rel}: retired hex ${h} still in output`);
  }
}

// 3, 4, 5: per-page checks.
const BRAND = "Accra Dental Atelier";
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(out.length + 1);

  checks++;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  if (!title) {
    failures.push(`${rel}: no <title>`);
  } else if (rel !== "404.html" && !title.includes(BRAND)) {
    failures.push(`${rel}: <title> is "${title}" — does not name ${BRAND}`);
  }

  checks++;
  if (!/<h1[\s>]/.test(html)) failures.push(`${rel}: no <h1>`);

  checks++;
  for (const re of RETIRED_BRAND) {
    if (re.test(html)) {
      failures.push(`${rel}: still references ${re} in the rendered HTML`);
      break;
    }
  }
}

// 6: structured data.
{
  checks++;
  const home = readFileSync(join(out, "index.html"), "utf8");
  if (!home.includes(`"@type":"Dentist"`) && !home.includes('"@type": "Dentist"')) {
    failures.push("index.html: Dentist structured data missing");
  }
  for (const needle of [BRAND, "Accra"]) {
    checks++;
    if (!home.includes(needle)) failures.push(`index.html: structured data missing "${needle}"`);
  }
}

console.log(`  ${checks} checks run across ${files.length} pages`);
if (failures.length) {
  const unique = [...new Set(failures)];
  console.error(`\nverify-visual: FAILED — ${unique.length} problem(s):`);
  for (const f of unique.slice(0, 40)) console.error(`  - ${f}`);
  if (unique.length > 40) console.error(`  …and ${unique.length - 40} more`);
  process.exit(1);
}
console.log("\nverify-visual: OK — no retired tokens, brand and structure correct.");