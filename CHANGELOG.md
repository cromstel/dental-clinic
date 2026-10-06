# Changelog

All notable changes to CITGROUP Dental Studio.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **The site was rendering with a transparent page background.** Four base-layer
  rules in `globals.css` still referenced `--color-cream`, `--color-charcoal` and
  `--color-lime` — names the rebrand had renamed to `--color-bone`,
  `--color-cocoa` and `--color-ochre`. A `var()` naming an undefined custom
  property is invalid at computed-value time, so the declaration is discarded:
  `body` had `background: transparent` and `color: black` instead of bone and
  cocoa, and `::selection` had no highlight background. Measured on production
  before the fix — `getComputedStyle(document.body).backgroundColor` returned
  `rgba(0, 0, 0, 0)`, where `#f4ede3` was intended. This has been live since the
  rebrand.
  **Nothing caught it.** The build passed, lint passed, typecheck passed,
  `verify-contrast` passed, and `verify-aesthetic`'s existing palette check passed
  — the new palette *was* present and the old names *were* absent. Every guard was
  satisfied while the site rendered wrong.
- **`verify-aesthetic.mjs` check 8: every colour referenced in the built CSS is
  defined.** This is the guard for the above. References carrying a fallback are
  excluded, which is load-bearing rather than theoretical — Tailwind emits four
  internal defaults in that form. Definitions are matched at a declaration
  position so `var(--x)` cannot be read as a definition of `--x`. Negative-tested
  against the real shipped defect, not a synthetic one, plus a single undefined
  token and the fallback case.

### Security
- `source-map-js` pinned to `^1.2.2` via an npm `overrides` entry, clearing
  GHSA-68fv-2mgg-jv7q (high — event-loop denial of service through indexed
  source-map section offsets, affecting 1.0.0–1.2.1). It arrives transitively
  through `postcss`, which both `@tailwindcss/postcss` and `next` depend on, and
  CI audits production dependencies, so the build failed on it.
- **`npm audit fix` is not usable in this repository.** For the one advisory
  above it proposes a plain upgrade, but for the five below it proposes
  installing `eslint-config-next@14.2.35` — a semver-major downgrade of the lint
  configuration, on a project running `eslint-config-next` 16 and Next 16.
  Running it would silence every advisory while trading two major versions of
  the framework's tooling for dev-only findings. Recorded here so the next
  person does not try it.
- **One advisory remains open, and it cannot be fixed.** `braces` is vulnerable
  to stack exhaustion through deeply nested glob patterns (GHSA-vfj7-8cjw-p6xm,
  affecting `<=3.0.3`). `braces@3.0.3` is the latest published version, so there
  is no upgrade that clears it. `npm audit` reports this as *five* advisories —
  `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next` and
  `eslint-config-next` — but that is one root advisory propagated up four levels
  of a single chain:

      eslint-config-next -> @next/eslint-plugin-next -> fast-glob
                         -> micromatch -> braces

  None of the four outer packages is independently vulnerable. `eslint-config-next`
  16.3.8 was checked and still pins `fast-glob@3.3.1`, so a patch upgrade does not
  break the chain.
- It is dev-only and does not block a merge: CI's blocking step is
  `npm audit --omit=dev --audit-level=high`, which excludes `eslint-config-next`
  entirely and reports **0 vulnerabilities**. The full report runs separately and
  non-blocking, so a future upstream fix shows up there rather than as a red
  build. Nothing needs suppressing.

### Decisions
- **The social handles stay as placeholders.** `@accradentalclinic` on Instagram
  and TikTok was invented when the rebrand landed. The owner has reviewed the
  trade-off and elected to keep them, so this is no longer an open question and
  will not be raised as an outstanding finding again. The reasoning is unchanged
  and is recorded in `src/content/accra.ts`: a placeholder handle in `sameAs` is
  a claim of identity to search engines, and a live-looking handle that belongs
  to a stranger would send patients to someone else's account. Swap them if the
  practice registers the real ones — verify ownership on each platform first,
  do not infer it from the name being available.
- **The address stays as supplied.** `18 Boundary Road, Osu, Accra` is
  owner-supplied and has never been checked against a listing or a map listing's
  coordinates. It is published in the footer, the contact page, a map link and
  the structured data. Confirmed as correct by the owner; treat it as verified by
  the practice rather than by an independent source, and re-check it if the
  practice moves.

Neither blocks a deploy. No site content changed, so nothing was redeployed for
this entry.

### Security
- Branch protection on `main`: 5 required status checks with `strict` on,
  enforcement on admins, linear history, and branch deletion and force-pushes
  blocked.
- The 1-approving-review requirement was **removed**. In a single-maintainer
  repository it cannot be satisfied — the author is the only possible approver
  and GitHub blocks self-approval — so it acted as a permanent deadlock rather
  than a control. The trade-off is recorded in `SECURITY.md`: a compromised
  token or a careless push now reaches `main` once CI is green, and the checks
  do not cover subtle or malicious logic changes.
- Removed the redundant `ci-gate` ruleset; branch protection supersedes it.
- CodeQL `security-extended` is blocking on push to `main` and on every PR.
- Dependabot security updates and automated security fixes enabled.
- Deploy credentials reduced from five SFTP secrets to one API token. The old
  cache-clear step reused the SFTP password to authenticate to the LiteSpeed
  purge endpoint; that credential is no longer doing double duty.

### Fixed
- **The booking form still asked for a US phone number.** The phone field's
  placeholder read `+1 (___) ___-____` on a site for a clinic in Osu, Accra. A
  rebrand can replace every brand string and every address and still leave this
  behind, because it is not a brand string — nothing in a diff of brand strings
  points at it. Now `+233 __ ___ ____`, matching the practice's own published
  format.
- `Counter.tsx` formatted its figures with `toLocaleString("en-US", …)`. Now
  `en-GH`. The rendered output is identical — the two locales share group and
  decimal separators — so no visitor sees a difference. Corrected anyway,
  because a hardcoded foreign locale is precisely the kind of leftover that
  survives a rebrand unnoticed.
- `verify-visual.mjs` now asserts two things it previously did not:
  - **No national format from the previous practice reaches the output** — a
    `+1` phone number, a US timezone, a P.O. box. Matched against `out/`, so it
    catches what a visitor sees rather than what a developer left in a comment.
  - **No hardcoded foreign locale in the source.** This one has to read `src/`,
    for two reasons: a locale argument leaves no trace in the HTML
    (`toLocaleString("en-US", …)` runs during prerendering and the two locales
    render identically anyway), and a format string in a component that does not
    prerender never reaches `out/` at all. Comment-only lines are skipped so a
    comment naming the previous practice stays allowed.
  Six negative-test cases, including one that pins the gap the source scan
  exists to close.
- **`verify-hosts.mjs` was validating a file nothing imports.** It read `site.url`
  from `src/content/site.ts`, which the rebrand had left in place but which no
  module referenced. Both files happened to carry the same origin, so the check
  passed — and would have carried on passing after a real move, because it was
  comparing `public/robots.txt` and `public/sitemap.xml` against a stale copy of
  the origin rather than the live one. Demonstrated: changing `site.url` in the
  module the site actually imports left the guard reporting the old origin as
  "consistent" and exiting 0. It now reads `src/content/accra.ts`, and the same
  change correctly fails the build. **A guard that validates a file nothing uses
  is worse than no guard, because it is believed.**
- **`src/content/site.ts` deleted.** Dead code holding the previous practice's
  address and a `555` phone number, and the file the origin guard was reading.
  Git history preserves the previous identity, which was the original reason for
  keeping a parallel content file. Two README pointers aimed contributors at it.
- **The published licence notice was serving the previous practice's address.**
  `/LICENSE` on the live site carried `142 West 21st Street, New York, NY 10011`
  — a Manhattan address, for a clinic in Osu, Accra — in the site's own legal
  notice. It went unnoticed because there were two copies of the licence
  (`LICENSE` and `public/LICENSE`), they disagreed, and nothing compared them.
  `public/LICENSE` was also a crude string replacement of the root file, which
  had produced `"CITGROUP", "CITGROUP", and associated branding` where the
  trademark clause used to list two distinct names.
- There is now one licence, at the repository root, with CITGROUP as the legal
  entity and "Accra Dental Clinic" as the trading name.
  `scripts/stage-server-config.mjs` stages it into the export and asserts the
  published copy is byte-identical, that the retired address and trading name
  are absent, and that the current identity is present. It also fails if a
  `public/LICENSE` reappears. Negative-tested against 7 cases.
- The internal `[OWNER NOTE — REMOVE BEFORE PUBLISHING THIS FILE]` block was
  being published at `/LICENSE`. It is resolved and gone; a `PARTIES` clause
  records that CITGROUP is the copyright holder instead.
- The licence pointed reviewers at `src/content/site.ts` for the review-content
  constraint. That module was retired in the rebrand; the path is now
  `src/content/accra.ts`.
- `scripts/verify-hosts.mjs` swept `public/LICENSE`, which no longer exists. The
  walker skips absent paths silently, so the swept file count had quietly fallen
  from 63 to 61 with nothing reporting it.
- `js/log-injection` (severity: error) at two sites in the image pipeline.
  Externally-derived values are no longer interpolated into log lines.
- `SECURITY.md` described signed-commit enforcement as an account-level
  setting. It is a branch-protection control (`required_signatures`).
- The enquiry form stamped `-- Sent via citgroupdental.com` into every email
  the practice received. That domain is not the one the site is served from
  and does not resolve in DNS. It now reads the configured origin.
- The advertised contact address was itself undeliverable. `citgroupdental.com`
  has no NS, A or MX record, so every enquiry hard-bounced from the visitor's
  mail server. Now `hello@cromstelit.com`, which resolves to Titan MX and is the
  domain the site is served from. Updated in `site.ts` and in both copies of the
  licence notice.
- The enquiry form's email placeholder read `you@email.com`. `email.com` is a
  real registrable domain, so the page rendered a genuine foreign address at the
  visitor. Now `you@example.com`, on a domain reserved by RFC 2606 that can
  never be registered.
- `deploy.yml` uploaded with `lftp mirror`, which transfers directories and
  cannot upload the single archive the step passed it. The step had never run,
  because its secrets were never set, so the breakage was invisible. It also
  packaged the archive with an exclusion rule that stripped dotfiles, which
  would have removed the `.htaccess` and broken AVIF rendering site-wide.
- `deploy.yml` dropped the `needs: verify-inputs` edge, so the confirmation
  gate could not stop a deploy — the build ran regardless and only `build` was
  a precondition of `deploy`.
- The README claimed the CDN overrides `.htaccess` cache headers and that image
  files must be renamed to defeat caching. Both were wrong: the year-long
  `immutable` header came from a stale origin config file, and a purge is
  sufficient.
- `.gitignore` pointed at `config/htaccess`, which no longer exists. The single
  source of truth is `public/.htaccess`.

### Changed
- **Removed the hero scroll indicator** — the hand-drawn SVG arrow at the foot of
  the homepage hero: a hairline that drew on via `stroke-dashoffset`, a chevron
  head, a vertical "Scroll" editorial label, and a 2.4-second loop with its own
  reduced-motion branch. 61 lines, one file, nothing else changed.

  It was purely decorative (`aria-hidden`) and the label was the only text it
  carried, so nothing semantic or accessible is lost. The hero's scroll-driven
  parallax (`scrollYProgress`, `visualY`, `titleY`) is untouched — that is the
  motion that makes the hero feel alive on scroll, and it is a different
  mechanism from the indicator's looping draw-on animation.

  Verified in the rendered export: the arrow's `viewBox`, both path `d`
  attributes, the vertical label and its wrapper are all absent, and the hero's
  `<h1>` and copy are intact. `verify-aesthetic`'s icon count is unchanged at 27
  because that check counts `lucide`-classed elements and this was hand-drawn SVG
  — the number moving would have meant the check was counting something else.

  The CTA arrow (`Cta`'s `arrow` prop, a `lucide` `ArrowUpRight`) is a separate
  component and is deliberately left in place; removing it would have changed
  buttons on six pages.
- **Contact phone is now `+233 24 732 2116`.** Previously `+233 30 274 0184`.
  The number appeared in two places — `site.phone` and a literal in
  `bookingCta.secondary` — so replacing one left the hero and footer showing a
  different number from the call button on the same page. `bookingCta` now
  interpolates `site.phone.display`, leaving one declaration.
- **Clinician portraits renamed to match their clinicians.** `olivia.*` and
  `ethan.*` were the previous practice's filenames, still rendering behind
  Dr. Ama Serwaa Boateng and Dr. Kwesi Mensah after the rebrand. Alt text is
  built from `name` and `role`, so nothing looked wrong and nothing failed.
  Now `ama-serwaa-boateng.*` and `kwesi-mensah.*`, all four variants each.
- `image` is derived from each clinician's `slug` rather than written by hand,
  so the filename cannot drift from the person again.
- Deploys publish through Hostinger's static-site archive API instead of SFTP.
  Endpoint paths, HTTP methods, and the path-versus-body split were verified
  against the published OpenAPI specification rather than guessed.
- Post-deploy checks extended: the smoke test now asserts an unknown URL
  returns 404, and a new step asserts the live cache policy matches
  `.htaccess`, so a silent regression like the one above fails the deploy.

### Added
- `scripts/verify-clinician-assets.mjs`, wired into `npm run build` and CI. It
  asserts each clinician's four image files exist under that clinician's slug,
  that no orphan file is left in the directory, and — the part that matters —
  that no repository text file still references an asset path no clinician owns.
  Renaming the portraits broke `deploy.yml`, which probes one of those assets to
  verify the AVIF MIME type and cache headers after every deploy; without this
  check the next deploy would have replaced the live site and then failed its own
  verification. `src/content/site.ts` and `CHANGELOG.md` are excluded as
  historical records. Negative-tested against 8 cases.
- `site.url` as the single source of truth for the production origin, read by
  `metadataBase` and the enquiry form.
- `scripts/verify-hosts.mjs`, wired into `npm run build` and into CI, which
  fails the build when `public/robots.txt` or `public/sitemap.xml` drift from
  `site.url`. Those files cannot import it, so nothing else would catch a move:
  the site would serve fine while pointing search engines at the old host.
  It also asserts `site.email` is on the served host or one of its parent
  domains, which is the check that would have caught the dead address above.
- `verify-hosts.mjs` now sweeps every email-shaped string in the files that
  ship — `src/`, `public/`, and both licence notices — rather than checking
  `site.email` alone. Addresses also hide in form placeholders, in the JSON-LD
  built from `site.email`, and in the licence notice served at `/LICENSE`.
  Placeholders are permitted only on TLDs reserved by RFC 2606/6761. Verified
  against 15 cases including the suffix attack `cromstelit.com.example.net`,
  which a naive reserved-suffix match would have allowed.
- Repository documentation: `CONTRIBUTING.md`, `SECURITY.md`, and a rewritten
  README covering branch protection, visibility, and the privacy constraints.
- `design/accra-dental-clinic.html` — a standalone design artifact, plus
  `design/verify-artifact.mjs` with 36 static checks. Not wired into the build.

## [1.0.0] — 2026-09-28

The first released state. Everything below describes the site as it exists at
this tag, not the order it was written in — the repository was built and
documented before this tag existed, so there is no meaningful earlier history to
distinguish.

### Site
- Seven routes: `/`, `/about`, `/contact`, `/dentists`, `/faq`, `/invisalign`,
  `/services`. `trailingSlash: true`.
- Luxury editorial hero — midnight navy and gold tokens, asymmetric grid,
  staggered reveals, drawn tooth mark and arch.
- Fully static: `output: "export"`. No database, no API route, no Server
  Action, no Node runtime in production. The enquiry form is `mailto:`-based
  and collects nothing server-side.
- Self-hosted fonts via `next/font/local`: Clash Display, Instrument Serif,
  Inter. No render-blocking third-party stylesheet.
- AVIF and WebP with `srcset`/`sizes`; `images.unoptimized: true`.

### Accessibility
- Lighthouse 13.5.0 against a local build: **Accessibility 100, Best
  Practices 100, SEO 100 on all seven routes**, plus the 404 page at
  accessibility 100 / best practices 100. CLS 0.
- Navigation was invisible on the navy hero (`text-charcoal` on midnight =
  1.03:1). Now ivory/gold.
- The focus ring was 1.06:1 on the hero. No single colour clears 3:1 against
  both the cream body and the midnight hero, so it is now a two-tone indicator
  and was verified with real Tab presses.
- `Intro`'s decorative words were `display: none` below 1024px, so mobile users
  never saw them. Now `::before` pseudo-elements.
- FAQ index numbers were `text-charcoal/35` (2.17:1). Now `/70` (6.11:1).
- Fixed a React #418 hydration error in the reduced-motion path via a
  `useHydrated` gate.

### Build pipeline
- `scripts/rsc-payload-fix.mjs` — normalizes RSC prefetch payload filenames.
  Next 16 writes `<route>/__next.<route>/__PAGE__.txt` but the client router
  fetches the dot form; unfixed, every cross-route prefetch 404s and soft
  navigation degrades to full page loads.
- `scripts/stage-server-config.mjs` — copies `config/htaccess` to
  `out/.htaccess`. Without it Hostinger serves `.avif` as `text/plain` and the
  AVIF `<picture>` sources fail to decode.
- `scripts/verify-export.mjs` — fails the build on missing route HTML, missing
  RSC payloads, robots.txt or sitemap.xml entries, an unstaged `.htaccess`, or
  source leakage into `out/`.
- `scripts/simulate-ci.sh` — runs the CI assertions locally under Git Bash.
- Fixed a duplicate-function bug in `scripts/download-and-convert-images.js`:
  `downloadImage` and `convertToAvif` were each declared twice, 52 lines of
  dead code.

### CI
- `ci.yml` — lint, typecheck, build, dependency audit, and a guards job
  asserting `.nvmrc`, `config/htaccess` and the build-script wiring stay
  committed.
- `deploy.yml` — SFTP deploy, `workflow_dispatch` only, requiring the literal
  string `DEPLOY`, with a post-upload smoke test and an assertion that AVIF
  still serves as `image/avif`.
- `codeql.yml` — weekly, on push, on PR, and manual.
- `dependabot.yml` — weekly grouped bumps, daily unbatched security fixes,
  weekly actions updates. Majors for `typescript`, `next`, `react` and
  `react-dom` are ignored on purpose.
- `npm run lint` was a no-op: `next lint` was removed in Next 16 and
  `eslint-config-next` cannot load because `typescript-eslint@8.70.1` throws on
  TypeScript 7. Lint now covers the JavaScript build tooling; `src/` is
  covered by `tsc --noEmit`.

### SEO
- `sitemap.xml` and `robots.txt` tracked in `public/` and verified in
  `out/`, so a redeploy cannot silently drop them.
- `metadataBase` corrected to the production host, so canonicals and
  `og:url` agree with the sitemap.

### Legal
- `LICENSE` — proprietary, all rights reserved, with a PATIENT DATA AND
  PRIVACY section recording the three constraints this site is bound by: no
  server-side data collection, no cookies or analytics, and reviews limited to
  a first name plus neighbourhood. Published to the site as `/LICENSE`, staged from the repository-root `LICENSE`.

### Known limitations
- The 224 KB `3_kpja-cz731b.js` chunk is React 19 plus the Next client
  runtime, not application code. Splitting it with `next/dynamic` was measured
  and made things worse (7 more requests, +9 KB), so it is not the lever the
  original audit suggested.
- `npm run lint` does not cover TypeScript. See `eslint.config.mjs` for why
  and how to re-enable it.
- `deploy.yml` needs the five `HOSTINGER_SFTP_*` repository secrets before it
  can run.
- Contact details in `src/content/site.ts` include a reserved `555` phone
  number and must be replaced before launch.
- Images in `public/images/` are generated placeholders. Real patient
  photography requires documented written consent.

[Unreleased]: https://github.com/cromstel/dental-clinic/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cromstel/dental-clinic/releases/tag/v1.0.0
