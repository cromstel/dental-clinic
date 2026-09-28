/*
  ACCRA DENTAL ATELIER — standalone design artifact.

  Self-contained reference for a premium Greater Accra wellness clinic. Not wired
  into the Next.js app: it lives outside `src/` and `public/` deliberately, so it
  cannot be picked up by the static export and shipped to production. CI
  (`ci.yml` / `codeql.yml`) does not lint it, and `verify-export.mjs` does not
  check it. It is a design proposal, not a page.

  Open `design/accra-dental-atelier.html` directly in a browser.

  ── Direction ──────────────────────────────────────────────────────────────
  Rejects the standard dental-clinic vocabulary on purpose: no blue healthcare
  gradients, no stock photography, no grid of service cards, no medical icon
  rows, no alternating image/text blocks, no white-and-blue banding.

  Instead: a dark, warm, gallery-like surface (near-black cocoa with ochre and
  clay) treated like a private members' club rather than a clinic. Structure is
  editorial — a services *index* that expands, a scroll-drawn dental arch,
  oversized display type, a hand-drawn wordmark. Photography is deliberately
  absent and replaced with drawn and typographic elements, which is both cheaper
  and less generic than stock imagery.
*/
