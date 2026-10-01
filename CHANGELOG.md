# Changelog

All notable changes to CITGROUP Dental Studio.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Deploys publish through Hostinger's static-site archive API instead of SFTP.
  Endpoint paths, HTTP methods, and the path-versus-body split were verified
  against the published OpenAPI specification rather than guessed.
- Post-deploy checks extended: the smoke test now asserts an unknown URL
  returns 404, and a new step asserts the live cache policy matches
  `.htaccess`, so a silent regression like the one above fails the deploy.

### Added
- `site.url` as the single source of truth for the production origin, read by
  `metadataBase` and the enquiry form.
- `scripts/verify-hosts.mjs`, wired into `npm run build` and into CI, which
  fails the build when `public/robots.txt` or `public/sitemap.xml` drift from
  `site.url`. Those files cannot import it, so nothing else would catch a move:
  the site would serve fine while pointing search engines at the old host.
  It also asserts `site.email` is on the served host or one of its parent
  domains, which is the check that would have caught the dead address above.
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
