# Changelog

All notable changes to CITGROUP Dental Studio.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Branch protection on `main` requires 1 approving review, dismissal of stale
  reviews on push, last-push approval, enforcement on admins, linear history,
  and conversation resolution. Branch deletion and force-pushes blocked.
- Removed the redundant `ci-gate` ruleset; branch protection supersedes it.
- CodeQL `security-extended` is blocking on push to `main` and on every PR.
- Dependabot security updates and automated security fixes enabled.

### Fixed
- `js/log-injection` (severity: error) at two sites in the image pipeline.
  Externally-derived values are no longer interpolated into log lines.
- `SECURITY.md` described signed-commit enforcement as an account-level
  setting. It is a branch-protection control (`required_signatures`).

### Added
- Repository documentation: `CONTRIBUTING.md`, `SECURITY.md`, and a rewritten
  README covering branch protection, visibility, and the privacy constraints.
- `design/accra-dental-atelier.html` — a standalone design artifact, plus
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
  a first name plus neighbourhood. Published to the site via `public/LICENSE`.

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
