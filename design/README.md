# Accra Dental Atelier

Standalone design artifact for a premium Greater Accra wellness clinic.
Self-contained HTML, no build step, no dependencies.

## What this is

A design proposal, not a page. It lives outside `src/` and `public/`
deliberately, so the static export cannot pick it up — `out/` is byte-identical
with and without it. CI does not lint it and `verify-export.mjs` does not check
it.

Open `accra-dental-atelier.html` directly in a browser.

## Direction

Rejects the standard dental-clinic vocabulary on purpose: no blue healthcare
gradients, no stock photography, no grid of service cards, no medical icon
rows, no alternating image/text blocks, no white-and-blue banding.

Instead: a dark, warm, gallery-like surface (cocoa-black with ochre and clay)
treated like a private members' club rather than a clinic. Structure is
editorial — a services *index* that expands, a scroll-drawn dental arch,
oversized display type, a hand-drawn wordmark. Photography is deliberately
absent and replaced with drawn and typographic elements, which is both cheaper
and less generic than stock imagery.

Type is Fraunces with its `WONK` and `opsz` axes driven for the display
moments, Archivo for body.

## Contrast

Clay has two opposite jobs in this layout and no single value can do both: as a
background under bone text it must be dark, as text on the bone band it must be
light. It is therefore split into `--clay` (band background, 6.34:1 against
bone) and `--clay-ink` (text on bone, 4.98:1). The original single value measured
4.29:1 in both directions and failed AA twice.

## Verification

```bash
node verify-artifact.mjs
```

36 static checks: structure, heading order, unique ids, `aria-controls`
resolution, button wiring, SVG hiding, reduced-motion coverage, WCAG contrast on
the token pairs the stylesheet actually renders, banned aesthetic tells, and a
recursive check that the artifact is absent from `public/`, `src/` and `out/`.

Every contrast pair is tied to a selector that exists in the stylesheet — an
earlier version tested a pairing the page never rendered, which let a real
failure through.

