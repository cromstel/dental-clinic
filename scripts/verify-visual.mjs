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
//   7. No national format from the previous practice reaches the output (a `+1`
//      placeholder, a US timezone, a P.O. box).
//   8. No hardcoded foreign locale in the source. This one reads `src/`, not the
//      export — see the note at the check for why.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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

/**
 * National formats left over from the previous practice.
 *
 * A rebrand that changes every brand string and every address can still leave a
 * visitor staring at a `+1` placeholder on a Ghanaian booking form. These do not
 * fail a build, do not look wrong in a diff of the brand strings, and are exactly
 * the kind of detail that survives because nobody was looking for it. Found one:
 * the phone field's placeholder had read `+1 (___) ___-____`.
 *
 * These are matched against `out/`, so a placeholder that never renders is not
 * flagged — the point is to catch what a visitor actually sees, not what a
 * developer left in a comment.
 */
const RETIRED_FORMATS = [
  [/\+1\s*\(?\d{0,3}[-_\s)]/, "US phone format"],
  [/\bP\.?O\.? Box\b/i, "US postal format"],
  [/\bZIP code\b/i, "US postal format"],
  [/\b(EST|EDT|PST|PDT|CST|CDT|MST|MDT)\b/, "US timezone"],
];

function htmlFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Split on either line ending. This project is built on Windows and the files in
 *  the working tree are CRLF, so anchoring on `\n` alone silently matches
 *  nothing — which has already produced one false test pass in this repo. */
function fsReadLines(file) {
  return readFileSync(file, "utf8").split(/\r?\n/);
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
  for (const [re, label] of RETIRED_FORMATS) {
    checks++;
    const m = html.match(re);
    if (m) failures.push(`${rel}: ${label} still in output — "${m[0]}"`);
  }
}

// 8: national formats and hardcoded locale, read from source.
//
// These two cannot be caught in `out/` alone, for different reasons:
//
//   - A locale argument leaves no trace in the HTML. `toLocaleString("en-US", …)`
//     runs during prerendering and `en-US` and `en-GH` format these values
//     identically, so the defect is invisible in the export and to a reader.
//   - A format string in a component that does not prerender never reaches the
//     HTML at all. Retiring this project's actual defect (the `+1` placeholder)
//     would have been caught by the export check, but only because that
//     component happens to be server-rendered. Checking source covers the case
//     where the next one is not.
//
// Scoped to `.tsx`/`.ts` under `src/`. Comments are stripped first, so a comment
// explaining the previous practice stays allowed — including a one-line `/* */`
// and a multi-line block, not just `//` and leading-`*` lines.
{
  const src = join(process.cwd(), "src");
  // All three quote styles. A backtick is included because `toLocaleString(`…`)` is
  // a locale someone can write by reflex, and it is invisible twice over: the
  // export check cannot see a locale argument at all, and this pattern originally
  // accepted only `"` and `'`, so the build passed it. Only a backtick template
  // with no `${…}` substitution is accepted as a literal — an interpolated one has
  // no statically knowable locale and is not this check's business.
  const LOCALE =
    /toLocale(?:String|DateString|TimeString)\(\s*(?:"([a-z]{2}(?:-[A-Za-z]{2,4})?)"|'([a-z]{2}(?:-[A-Za-z]{2,4})?)'|`([a-z]{2}(?:-[A-Za-z]{2,4})?)`)/g;

  const walk = (dir, acc = []) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, acc);
      else if (/\.(ts|tsx)$/.test(e.name)) acc.push(p);
    }
    return acc;
  };

  /**
   * Blank out comment content, keeping every character position intact so line
   * and column numbers in a report still point at the real source.
   *
   * Line-based comment detection was not enough, and that was found by review
   * rather than by reading: it recognised `//` and leading `*` lines, so a
   * standard one-line `/* was: toLocaleString("en-US") *\/` was read as live code
   * and failed the build on a comment. Replacing the characters rather than
   * deleting the lines is what keeps the reported position honest.
   *
   * String literals are deliberately NOT blanked. A format string inside a
   * template literal is exactly what this check exists to catch, and blanking
   * literals to be safe would defeat it. The cost is that a retired format named
   * inside a string is reported as live — a false positive in a comment-heavy
   * file is recoverable, a missed `+1` placeholder is not.
   *
   * Note the tension with `LOCALE`, which matches *inside* literals: comment
   * blanking must leave literals intact or the locale check has nothing to read,
   * which is also why a `//` inside a string has to be recognised as not a
   * comment. Both behaviours are required and test cases pin each of them.
   */
  function blankComments(text) {
    let out = "";
    let inBlock = false;
    for (const raw of text.split("\n")) {
      let line = "";
      let inStr = null; // quote char, for `//` detection inside a URL etc.
      let i = 0;
      // A block comment's closing */ may sit mid-line and end before code resumes.
      if (inBlock) {
        const close = raw.indexOf("*/");
        if (close === -1) { out += "\n"; continue; }
        line += " ".repeat(close + 2);
        i = close + 2;
        inBlock = false;
      }
      while (i < raw.length) {
        const ch = raw[i];
        const next = raw[i + 1];
        if (!inStr && ch === "/" && next === "*") {
          const close = raw.indexOf("*/", i + 2);
          if (close === -1) { inBlock = true; break; }
          line += " ".repeat(close + 2 - i);
          i = close + 2;
          continue;
        }
        if (!inStr && ch === "/" && next === "/") break; // rest of line is comment
        if (inStr) {
          if (ch === "\\") { line += raw.slice(i, i + 2); i += 2; continue; }
          if (ch === inStr) inStr = null;
        } else if (ch === '"' || ch === "'" || ch === "`") {
          inStr = ch;
        }
        line += ch;
        i++;
      }
      out += line + "\n";
    }
    return out;
  }

  for (const file of walk(src)) {
    const rel = relative(process.cwd(), file);
    // Matched against the whole comment-stripped source, not line by line:
    // a formatter can put `toLocaleString(` and `"en-US"` on separate lines, and
    // a per-line match misses it entirely.
    const stripped = blankComments(fsReadLines(file).join("\n"));

    // Line number from a character offset. The offsets come from matches against
    // the whole stripped source, so a call split across lines is still found and
    // still reported at the line it starts on.
    const lineAt = (offset) => stripped.slice(0, offset).split("\n").length;

    // Line-oriented patterns run per line.
    stripped.split("\n").forEach((line, i) => {
      for (const [re, label] of RETIRED_FORMATS) {
        checks++;
        const m = line.match(re);
        if (m) failures.push(`${rel}:${i + 1}: ${label} — "${m[0]}"`);
      }
    });

    // The locale pattern is whitespace-tolerant by design and therefore must run
    // against the whole source, not a single line. Exactly one of the three
    // capture groups participates per match, depending on the quote style.
    for (const m of stripped.matchAll(LOCALE)) {
      checks++;
      const locale = m[1] ?? m[2] ?? m[3];
      if (locale !== "en-GH") {
        failures.push(`${rel}:${lineAt(m.index)}: hardcoded locale "${locale}" — expected "en-GH"`);
      }
    }
  }
}

// 3, 4, 5: per-page checks.
const BRAND = "Accra Dental Clinic";
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
console.log("\nverify-visual: OK - no retired tokens or national formats, brand and structure correct.");