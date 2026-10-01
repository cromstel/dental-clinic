// Post-build contrast gate.
//
// Asserts every colour pairing the stylesheet actually renders clears WCAG 2.1
// AA. The point is that the palette has to be *checked*, not eyeballed: the
// clay band already failed AA twice before this existed, because clay reads as
// a light warm tone against bone and as a dark one against cocoa, so no single
// value serves both jobs.
//
// Every pair below names the token for the foreground, the token for the
// background, and the components that render it. An earlier check tested a
// pairing no component used, which passed forever while a real failure sat in
// the page — so a pair that nothing renders is treated as a mistake here too.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

/* ---------------------------------------------------------------- colour math */

const srgb = (channel) => {
  const v = channel / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const raw = hex.trim().replace("#", "");
  const n = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (!/^[0-9a-f]{6}$/i.test(n)) return null;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a === null || b === null) return null;
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/* ------------------------------------------------------------------- tokens */

const cssPath = join(root, "src", "app", "globals.css");
if (!existsSync(cssPath)) {
  console.error("verify-contrast: src/app/globals.css not found.");
  process.exit(1);
}
const css = readFileSync(cssPath, "utf8");

const tokens = new Map();
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  tokens.set(m[1], m[2]);
}

if (tokens.size === 0) {
  console.error("verify-contrast: no --color-* tokens found in globals.css.");
  process.exit(1);
}

/* --------------------------------------------------------------------- pairs */

/**
 * `min` follows the WCAG threshold for the text size the pair is used at:
 * 4.5 for body copy, 3 for large display type (>=24px, or >=18.66px bold).
 */
const PAIRS = [
  ["bone", "cocoa", 4.5, "body copy on the base surface", "all sections"],
  ["bone", "cocoa-soft", 4.5, "body copy on a raised surface", "Footer, Nav scrim"],
  ["bone", "cocoa-card", 4.5, "body copy on a card", "FaqAccordion, Reviews"],
  ["bone-dim", "cocoa", 4.5, "secondary copy on cocoa", "Intro, Experience"],
  ["bone-dim", "cocoa-soft", 4.5, "secondary copy on a raised surface", "Footer"],
  ["bone-on-clay", "clay", 4.5, "copy on the clay band", "BookingCta, ServicesList"],
  ["ochre", "cocoa", 4.5, "accent text on cocoa", "Nav, Cta outline, Hero"],
  ["ochre", "cocoa-soft", 4.5, "accent text on raised", "Footer links"],
  ["ochre", "cocoa-card", 4.5, "accent text on a card", "FaqAccordion question"],
  ["ochre-ink", "ochre", 4.5, "button label on the ochre block", "Cta primary, Hero"],
  ["clay-ink", "bone", 4.5, "clay as text on the bone band", "ServicesList, DoctorsList"],
  ["sage-ink", "bone", 4.5, "sage-ink text on bone", "Experience"],
  ["bone", "sage-ink", 4.5, "bone text on a sage-ink block", "Experience"],
  // Sage-light exists because --color-sage is mid-tone and clears neither text
  // family for body copy. These two are the pair that replaces it.
  ["cocoa", "sage-light", 4.5, "body copy on a sage-light band", "InvisalignFeatures, PageHero, Experience"],
  // Chip text, one per surface the components actually use.
  ["bone-on-clay", "clay", 4.5, "chip glyph on the clay band", "PageHero, InvisalignFeatures"],
  ["ochre-ink", "ochre", 4.5, "chip label on the ochre band", "PageHero, InvisalignFeatures"],
  ["bone", "clay", 4.5, "display word on the clay band", "Experience"],
  ["bone", "sage", 3, "display word on the sage band (24px+)", "Experience"],
  ["cocoa", "bone", 4.5, "ink text on the bone surface", "ServicesList, MarqueeBand"],
  ["bone", "ink", 4.5, "bone text on the deepest surface", "ScrollToTop, FocusRing"],
  ["ochre", "ink", 3, "large accent type on ink", "Experience numerals"],
];

const failures = [];
console.log("verify-contrast: checking rendered pairings\n");
console.log(
  `  ${"foreground".padEnd(16)}${"background".padEnd(14)}${"ratio".padStart(7)}  ${"min".padStart(4)}   result`,
);
console.log(`  ${"-".repeat(66)}`);

for (const [fg, bg, min, why, where] of PAIRS) {
  const f = tokens.get(fg);
  const b = tokens.get(bg);
  if (!f || !b) {
    failures.push(`missing token: ${!f ? `--color-${fg}` : `--color-${bg}`}`);
    console.log(
      `  ${(fg || "(none)").padEnd(16)}${(bg || "(none)").padEnd(14)}${"--".padStart(7)}        MISSING TOKEN`,
    );
    continue;
  }
  const ratio = contrast(f, b);
  // An unparseable token must be reported, not rendered. `contrast` returns null
  // for a length it cannot read — 4- and 8-digit hex, which the token regex
  // accepts — and calling .toFixed on that throws, so the gate exits with a
  // stack trace and no report at all. A gate that crashes is worse than one that
  // fails, because the stack trace says nothing about what to fix.
  const ok = ratio !== null && ratio >= min;
  if (ratio === null) {
    failures.push(
      `${fg} or ${bg} is not a readable colour (${f} on ${b}) — ` +
        `expected 3 or 6 hex digits. Fix the token in globals.css.`,
    );
  } else if (!ok) {
    failures.push(
      `${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1 — ${why} (${where})`,
    );
  }
  console.log(
    `  ${fg.padEnd(16)}${bg.padEnd(14)}${(ratio?.toFixed(2) ?? "?").padStart(7)}  ${String(min).padStart(4)}   ${ok ? "PASS" : "FAIL"}  ${why}`,
  );
}

/**
 * Guard the inversion trap directly. Clay is the token that reads light against
 * bone and dark against cocoa, so it is the one most likely to be reused as
 * text on the wrong surface. Assert the known-bad combinations stay rejected,
 * so a later "cleanup" that unifies them cannot land silently.
 */
// Only combinations that genuinely fail AA belong here. Clay on bone measures
// 6.34:1 and passes, so it is not a trap to guard — it was in an earlier draft
// of this list on the assumption that the split meant clay was unusable as
// text, and the check correctly complained that the palette had changed when in
// fact the assumption was wrong. Listing a passing pair here would mean the gate
// fails for a palette that is fine.
const FORBIDDEN = [
  ["ochre", "bone", 4.5, "accent on the bone surface"],
  ["clay", "cocoa", 4.5, "clay on cocoa — too close to the surface"],
  ["sage", "bone", 4.5, "sage as text on bone — use sage-ink"],
  ["bone", "ochre", 4.5, "bone on the ochre block — use ochre-ink"],
  ["bone-on-clay", "clay-soft", 4.5, "band tone reused on the raised surface"],
  // The trap that shipped: --color-sage looks like a light band but is mid-tone,
  // so cocoa on it is 4.32:1 — under AA by a margin no eye would notice, which
  // is exactly why it has to be measured rather than judged.
  ["cocoa", "sage", 4.5, "body copy on sage — use sage-light"],
  ["bone", "sage", 4.5, "body copy on sage — use sage-light"],
];

console.log(`\n  known-bad combinations that must stay rejected\n`);
for (const [fg, bg, min, why] of FORBIDDEN) {
  const f = tokens.get(fg);
  const b = tokens.get(bg);
  if (!f || !b) continue;
  const ratio = contrast(f, b);
  // These are expected to FAIL AA. That is the point: if one ever passes, the
  // token was changed and the guidance in globals.css needs revisiting.
  //
  // `ratio < min` treats null as 0, which would silently label an unreadable
  // token "still bad" and hide a real defect behind a green line.
  if (ratio === null) {
    failures.push(`${fg} or ${bg} is not a readable colour (${f} on ${b})`);
    console.log(
      `  ${fg.padEnd(16)}${bg.padEnd(14)}${"?".padStart(7)}        UNREADABLE TOKEN  ${why}`,
    );
    continue;
  }
  const stillBad = ratio < min;
  if (!stillBad) {
    failures.push(
      `${fg} on ${bg} now measures ${ratio.toFixed(2)}:1 and clears AA — the palette changed, revisit the FORBIDDEN list and the note in globals.css`,
    );
  }
  console.log(
    `  ${fg.padEnd(16)}${bg.padEnd(14)}${ratio.toFixed(2).padStart(7)}        ${stillBad ? "still bad (ok)" : "NOW PASSES — review"}  ${why}`,
  );
}

console.log("");
if (failures.length) {
  console.error(`verify-contrast: FAILED — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("  Adjust the token values in src/app/globals.css, or split a token");
  console.error("  the way clay was split into clay / clay-ink.");
  process.exit(1);
}

console.log(`verify-contrast: OK — ${PAIRS.length} rendered pairings clear AA.`);
