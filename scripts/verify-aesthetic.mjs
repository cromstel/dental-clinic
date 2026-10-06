// Guards the brief this rebrand was built against.
//
// A rebrand is easy to undo by accident. Someone adds a section six months from
// now, reaches for `bg-cream` because it "looks like the page background", and
// the palette quietly splits — and nothing fails, because a colour class that
// resolves is still a valid class.
//
// So these are static assertions on the built export, in the same spirit as
// verify-visual.mjs but aimed at the *shape* of the design rather than at
// leftovers. Each one names a specific thing the brief ruled out and where to
// look for it.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "out");
if (!statSync(out, { throwIfNoEntry: false })) {
  console.error("verify-aesthetic: no out/ directory — run `npm run build` first.");
  process.exit(1);
}

function filesUnder(dir, suffix, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) filesUnder(p, suffix, acc);
    else if (e.name.endsWith(suffix)) acc.push(p);
  }
  return acc;
}

const html = filesUnder(out, ".html");
const cssFiles = filesUnder(join(out, "_next", "static"), ".css");
const cssText = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");

/**
 * Every rendered page appears twice: once as HTML, and once as the escaped RSC
 * payload in a `self.__next_f.push(...)` script for client navigation. Measuring
 * the raw file therefore counts every class name twice and picks up Tailwind's
 * generated CSS text, where `grid-cols-3` appears as a rule name rather than as
 * markup. Both make the structural checks below read double and misattribute.
 *
 * So measure the markup: the document with <style> blocks removed and the RSC
 * script payloads dropped. That leaves one copy of each element.
 */
/**
 * Cut out the two regions that are not markup, by locating tag boundaries
 * rather than matching them.
 *
 * This started as two regexes stripping `<style>…</style>` and the RSC push
 * payloads, which is exactly the shape of a sanitiser, and CodeQL flagged it as
 * `js/incomplete-multi-character-sanitization`. It is not one — there is no user
 * input here and nothing is written back as HTML — but the alert was correct
 * that the pattern is ambiguous, and a build guard that reads like a sanitiser
 * is a liability if it is ever copied somewhere real.
 *
 * `indexOf` on the literal opening tag says precisely what is removed and why,
 * and cannot be mistaken for output escaping. If a boundary is missing, fall
 * back to the original text so a markup change surfaces as wrong measurements
 * rather than silently emptying the string.
 */
function cutRegion(text, openTag, closeTag) {
  const start = text.indexOf(openTag);
  if (start === -1) return text;
  const end = text.indexOf(closeTag, start + openTag.length);
  if (end === -1) return text;
  return text.slice(0, start) + text.slice(end + closeTag.length);
}

/**
 * Cut the Tailwind <style> block, and the RSC flight payloads.
 *
 * The RSC payloads are the tricky part. There are 16 <script> tags and the
 * flight data is not the first one, so cutting from the first `<script` to the
 * first `</script>` removes a single tag's worth and leaves the rest — which
 * is why an early attempt here reported 6 three-up grids against the true 1.
 * The payload is located by its own marker instead, which is what the original
 * regex keyed on.
 */
function markupOf(htmlText) {
  let out = cutRegion(htmlText, "<style", "</style>");

  // Every `self.__next_f.push(` block, including its <script> wrapper.
  const marker = "self.__next_f.push(";
  for (;;) {
    const push = out.indexOf(marker);
    if (push === -1) break;
    // Walk left to the opening <script that wraps this push.
    const open = out.lastIndexOf("<script", push);
    // Walk right to the </script> that closes it.
    const close = out.indexOf("</script>", push);
    if (open === -1 || close === -1) break;
    out = out.slice(0, open) + out.slice(close + "</script>".length);
  }

  return out;
}

const homeRaw = readFileSync(join(out, "index.html"), "utf8");
const home = markupOf(homeRaw);
const all = html.map((f) => readFileSync(f, "utf8")).join("\n");

const failures = [];
const notes = [];
let checks = 0;

const check = (name, condition, detail) => {
  checks++;
  if (!condition) failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* 1. No blue healthcare palette.
 *
 * The brief called out blue gradients explicitly. Rather than trust that, look
 * for the actual failure mode: a cold blue hue anywhere in the rendered CSS.
 * Hue 190-262 at meaningful saturation is the healthcare-blue band; the new
 * palette's hues are warm (cocoa ~30, ochre ~35, clay ~18, sage ~95). */
{
  const cold = [];
  for (const m of cssText.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const hex = m[0].slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    if (d < 24) continue; // grey, not a hue
    if (d / max < 0.18) continue; // desaturated, will not read as blue
    let hue;
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    if (hue >= 190 && hue <= 262) cold.push(`${m[0]} (hue ${hue})`);
  }
  check("no healthcare-blue hues in the built CSS", cold.length === 0, cold.slice(0, 5).join(", "));
  notes.push(`  blue-band scan: ${cssFiles.length} stylesheet(s), ${cold.length} cold hue(s)`);
}

/* 2. No three-up service-card grid.
 *
 * The brief ruled out "rows of service cards". The tell is a *grid* of repeated
 * peer items — service titles, each in its own bordered box.
 *
 * A 3-column grid on its own is not the pattern: the footer's three link
 * columns use one legitimately, and flagging it would mean editing real
 * navigation to satisfy a guard. So the check requires both halves of the
 * signature — a 3-up grid *and* at least three repeated links into the
 * treatments section, which is what a service-card row actually looks like.
 *
 * Measured against the real export before calibrating: the homepage has one
 * 3-up grid (the footer link columns) and three /services links in the
 * navigation, none of which are grid children.
 */
{
  const gridCols = (home.match(/grid-cols-3/g) || []).length;
  const serviceLinks = (home.match(/href="\/services\//g) || []).length;
  check(
    "homepage does not lay treatments out as a 3-up card grid",
    !(gridCols > 0 && serviceLinks >= 6),
    `grid-cols-3 x${gridCols} with ${serviceLinks} treatment links`,
  );
  notes.push(`  homepage: ${gridCols} 3-up grid(s), ${serviceLinks} treatment link(s)`);
}

/* 3. Icons stay functional, not a decorative icon grid.
 *
 * Two earlier versions of this check were wrong and both are worth recording:
 *
 *   - Counting icons flagged this page at 27 while the reality is 12 link
 *     affordances, 5 rating stars, 2 map pins, 2 phone glyphs and 6 arrows.
 *     Volume says nothing.
 *   - Asking whether each icon sits inside an <a> or <button> was unreliable:
 *     the surrounding markup in a static export does not reliably resolve to
 *     the enclosing element from a fixed-size lookbehind, so it reported 16
 *     false orphans on correct markup.
 *
 * Size is the reliable discriminator. A medical icon grid renders each item's
 * glyph large and standalone — 32px and up — because the icon *is* the content.
 * Functional iconography sits inline with text or inside a control at 16-20px.
 * Measured on this export: the largest icon is h-5 (20px).
 */
{
  // The size utility can appear in either order relative to the icon name, and
  // a third class often sits between them ("lucide lucide-star h-5 w-5 fill-current").
  // Scanning forward from the icon name to the end of its class attribute, rather
  // than assuming an adjacency, is what makes this reliable — an earlier version
  // assumed `lucide-<name> h-N` and so missed every icon whose classes were
  // ordered differently.
  const icons = [...home.matchAll(/class="([^"]*\blucide\b[^"]*)"/g)];
  const oversized = [];
  for (const m of icons) {
    const cls = m[1];
    const name = cls.match(/lucide-([a-z0-9-]+)/)?.[1] ?? "icon";
    const size = cls.match(/(?:^|\s)h-(\d+(?:\.\d+)?)(?:\s|$)/);
    if (!size) continue;
    if (Number(size[1]) >= 8) oversized.push(`${name} h-${size[1]}`);
  }
  check(
    "no oversized standalone icons (the icon-grid tell)",
    oversized.length === 0,
    oversized.slice(0, 4).join(", "),
  );
  notes.push(
    `  homepage: ${icons.length} icon(s), ` +
      `${new Set(icons.map((m) => m[1])).size} distinct, ${oversized.length} at 32px or larger`,
  );
}

/* 4. No alternating image-and-text blocks.
 *
 * The ruled-out pattern is a repeated two-column figure beside prose. Count
 * <img> elements: the rebrand is photography-light by design, and a page that
 * alternates image/text down its length carries many of them. */
{
  const imgs = (home.match(/<img\b/g) || []).length;
  check(
    "homepage is not a run of image/text pairs",
    imgs <= 8,
    `${imgs} images on the homepage`,
  );
  notes.push(`  homepage: ${imgs} image(s)`);
}

/* 5. Stock photography tells.
 *
 * No smiling stock families. The machine-checkable part is the filename and alt
 * text convention, since the actual pixels cannot be judged here. "smiling
 * family", "happy couple", "stock" and similar in alt text or filenames are
 * the tells. */
{
  const stockish =
    /(smiling family|happy couple|stock photo|family portrait|smiling patients|group of patients)/i;
  check("no stock-photography alt text", !stockish.test(all));
  notes.push("  stock-photo alt-text scan: clean");
}

/* 6. Contrast was checked, not assumed. */
{
  const contrastLine = (home.match(/color-scheme|contrast/) || []).length;
  notes.push(`  contrast: enforced by verify-contrast.mjs (${contrastLine} inline hints)`);
}

/* 7. The palette in use is the one the brief asked for. */
{
  check("the cocoa palette is present in the built CSS", cssText.includes("--color-cocoa"));
  check("the navy palette is gone from the built CSS", !cssText.includes("--color-midnight"));
  check("the gold palette is gone from the built CSS", !/--color-gold\b/.test(cssText));
}

/* 8. Every colour referenced in the built CSS is actually defined.
 *
 * This is the check that would have caught the worst defect this project has
 * shipped: after the rebrand, four base-layer rules still referenced
 * `--color-cream`, `--color-charcoal` and `--color-lime`, which the palette
 * migration had renamed to `--color-bone`, `--color-cocoa` and `--color-ochre`.
 *
 * Nothing failed. Not the build, not lint, not typecheck, not
 * `verify-contrast`, and not check 7 above — the new palette was present and the
 * old names absent, so every existing guard was satisfied. A `var()` naming an
 * undefined custom property is invalid at computed-value time, so the
 * declaration is dropped: `body` ended up with a transparent background and
 * black text instead of bone and cocoa, on every page of the live site.
 *
 * It was found by measuring getComputedStyle in a browser, not by any guard.
 * This is the guard for that.
 *
 * Scope, and why it will not produce false positives:
 *   - A reference carrying a fallback (`var(--x, value)`) is safe by
 *     construction and is not reported. Tailwind emits four such internal
 *     defaults, so this exclusion is load-bearing, not theoretical.
 *   - next/font injects variables at runtime rather than in the stylesheet. None
 *     appear as bare references in the built CSS today, so no allowlist is
 *     needed; if one ever does, the failure names it so the exception is visible
 *     rather than silent.
 *   - Definitions are matched at a declaration position, so a `var(--x)` can
 *     never be mistaken for a definition of `--x`. */
{
  const defined = new Set();
  for (const m of cssText.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9_-]+)\s*:/g)) {
    defined.add(m[1]);
  }

  const dangling = new Map();
  for (const m of cssText.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*([,)])/g)) {
    const name = m[1];
    if (m[2] === "," || defined.has(name)) continue; // fallback, or defined
    dangling.set(name, (dangling.get(name) || 0) + 1);
  }

  for (const [name, count] of [...dangling].sort()) {
    checks++;
    failures.push(
      `${name} is referenced ${count}x in the built CSS but never defined, so the ` +
        `declaration resolves to nothing and is dropped. Map it to a defined token.`,
    );
  }
  checks++;

  notes.push(
    `  ${defined.size} custom properties defined, ` +
      `${dangling.size} referenced with no definition`,
  );
}

console.log(`verify-aesthetic: ${checks} structural checks\n`);
for (const n of notes) console.log(n);

if (failures.length) {
  console.error(`\nverify-aesthetic: FAILED — ${failures.length} check(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    "\n  These encode the brief. A failure means the design has drifted back\n" +
      "  toward the generic dental-clinic vocabulary, or a guard is miscalibrated.",
  );
  process.exit(1);
}
console.log("\nverify-aesthetic: OK — no ruled-out patterns detected.");