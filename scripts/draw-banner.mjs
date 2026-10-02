// Draw the repository banner as SVG.
//
// WHY SVG AND NOT A GENERATED IMAGE
// ---------------------------------
// Image generation was unavailable (all three providers failed), but a vector is
// the better artefact regardless: resolution-independent, a few KB in git
// rather than a megabyte, and the palette applied literally from `globals.css`
// so it cannot drift from the site.
//
// SVG *filters* are avoided. GitHub proxies images through camo and a filter is
// not guaranteed to survive that path. Plain shapes, strokes, gradients and
// patterns render everywhere.
//
// NO TEXT. GitHub renders a banner as an <img>, which cannot load an external
// stylesheet, so the site's webfonts are unavailable and a system-serif
// fallback looks accidental. The README's H1 sits directly above the image.
//
// TWO EARLIER ATTEMPTS, AND WHY BOTH FAILED
// ----------------------------------------
// 1. Literal teeth — rounded rects positioned along an elliptical arc, each
//    rotated to the tangent. Correct in isolation, unreadable in practice: the
//    rects are tall, the tangent rotates them up to ~51 degrees, and they
//    overlap into a scribble.
// 2. First arcade pass — the ground line ran past the right edge of the canvas
//    and the key light read as a brown smudge across the upper left.
//
// Geometry that is individually right is not a design. Both were caught by
// rendering to PNG and looking, not by reading the numbers.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const W = 1280;
const H = 640; // 2:1, the GitHub README target

/* Palette, from the tokens in src/app/globals.css. */
const COCOA = "#14100d";
const BONE = "#f4ede3";
const OCHRE = "#e0a02c";
const CLAY = "#8f3d1c";

/**
 * One round-headed arch, the shape of the site hero's outline and of the arcade
 * windows it evokes. Stroked, not filled, so several nested read as depth
 * rather than as bands of colour.
 */
function arch(cx, baseY, halfWidth, height) {
  const r = halfWidth;
  const springline = baseY - height + r;
  return [
    `M ${(cx - r).toFixed(1)} ${baseY}`,
    `V ${springline.toFixed(1)}`,
    `A ${r} ${r} 0 0 1 ${(cx + r).toFixed(1)} ${springline.toFixed(1)}`,
    `V ${baseY}`,
  ].join(" ");
}

/* Composition. Everything is sized to stay inside the canvas with a margin:
   the widest arch reaches cx + 278 = 1180, and the ground line ends at 1218,
   both clear of the 1280 edge. */
const cx = 902;
const baseY = 438;
const GROUND_HALF = 316;

const ARCHES = [
  { hw: 278, h: 344, o: 0.18, w: 1 },
  { hw: 232, h: 296, o: 0.26, w: 1 },
  { hw: 186, h: 248, o: 0.36, w: 1.25 },
  { hw: 140, h: 196, o: 0.52, w: 1.25 },
  { hw: 94, h: 142, o: 0.74, w: 1.5 },
  { hw: 50, h: 86, o: 0.92, w: 1.5 },
];

const archPaths = ARCHES.map(
  (a) => `    <path d="${arch(cx, baseY, a.hw, a.h)}" stroke-opacity="${a.o}" stroke-width="${a.w}" />`,
).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Accra Dental Clinic">
  <defs>
    <!-- Key light from the upper left, as in the site hero. Kept faint: at 0.16
         it read as a brown smudge rather than as light. -->
    <radialGradient id="glow" cx="0.2" cy="0.18" r="0.85">
      <stop offset="0%" stop-color="${OCHRE}" stop-opacity="0.1" />
      <stop offset="52%" stop-color="${OCHRE}" stop-opacity="0.025" />
      <stop offset="100%" stop-color="${OCHRE}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${CLAY}" stop-opacity="0" />
      <stop offset="100%" stop-color="${CLAY}" stop-opacity="0.1" />
    </linearGradient>
    <!-- Fine dot field. A pattern, not a filter, so camo cannot strip it. -->
    <pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="0.55" fill="${BONE}" fill-opacity="0.045" />
      <circle cx="5" cy="4.5" r="0.4" fill="${BONE}" fill-opacity="0.03" />
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${COCOA}" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />
  <rect width="${W}" height="${H}" fill="url(#grain)" />
  <rect width="${W}" height="${H}" fill="url(#haze)" />

  <!-- Ground line the arcade stands on. -->
  <rect x="${cx - GROUND_HALF}" y="${baseY}" width="${GROUND_HALF * 2}" height="1.25" fill="${OCHRE}" fill-opacity="0.32" />

  <!-- The arcade. -->
  <g fill="none" stroke="${OCHRE}" stroke-linecap="round">
${archPaths}
  </g>

  <!-- Left: one rule and one mark. The README carries the words, so the image
       only has to hold the left third open — anything more reads as clutter. -->
  <rect x="104" y="196" width="2" height="242" fill="${OCHRE}" fill-opacity="0.5" />
  <circle cx="105" cy="172" r="5.5" fill="${OCHRE}" fill-opacity="0.85" />

  <!-- Clay hairline at the very bottom: the one warm interruption, kept to a
       rule. An earlier version used a 74px clay block and read as a hazard
       stripe rather than as part of the palette. -->
  <rect x="0" y="${H - 5}" width="${W}" height="5" fill="${CLAY}" fill-opacity="0.85" />
</svg>
`;

const out = join(process.cwd(), ".github", "assets", "banner.svg");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg, "utf8");

// Fail loudly rather than shipping an arc that leaves the canvas: this is the
// exact class of defect the second attempt had.
const rightmost = cx + ARCHES[0].hw;
const groundRight = cx + GROUND_HALF;
if (rightmost > W - 40) {
  console.error(`banner: widest arch reaches x=${rightmost}, canvas is ${W} — would crop.`);
  process.exit(1);
}
if (groundRight > W - 20) {
  console.error(`banner: ground line reaches x=${groundRight}, canvas is ${W} — would crop.`);
  process.exit(1);
}

console.log(`banner: wrote ${out}`);
console.log(`  ${W}x${H} (2:1), ${svg.length.toLocaleString()} bytes`);
console.log(`  widest arch x=${rightmost}, ground line x=${groundRight} — both inside ${W}`);
