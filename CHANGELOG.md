# Changelog

All notable changes to CITGROUP Dental Studio.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`react-hooks` and `jsx-a11y`, enabled from measurement rather than by default.** Both plugins arrived previously only as transitive dependencies of `eslint-config-next`, so removing that package left the tree with neither. They are now direct dev dependencies with a rule set chosen by sweeping all 54 TS/TSX files first, rather than by turning on `recommended` and seeing what broke: | rule set | findings | decision | |---|---|---| | `react-hooks/rules-of-hooks` | 0 | enabled | | `react-hooks/exhaustive-deps` | 0 | enabled | | `react-hooks/set-state-in-effect` | 5 | **not enabled** — see below | | `jsx-a11y` `recommended` | 1 | enabled, after fixing the finding | A rule that has been shown to hold across the codebase is worth more than one that has merely never been run. The two enabled hooks rules report nothing today and will report the day a hook is wrong. **`set-state-in-effect` is deliberately not enabled**, and all five findings are legitimate: `useHydrated` sets state on mount (a hydration gate cannot be derived during render — that is the rule's own counter-example); `CustomCursor` reads `matchMedia`, which does not exist on the server; `Nav` closes its menu on `pathname` change, which is React's documented approach to resetting state on a prop change; and `Counter` and `SplitText` each set state once to settle under reduced motion. The rule targets *unnecessary* cascading renders, and all five are the "synchronise client-only state after mount" case effects exist for. Enabling it would mean contorting correct code to satisfy a rule that cannot tell the difference — the mirror image of silencing a rule that is telling the truth. **`jsx-a11y` `strict` is not used, and this corrects an earlier claim in this file.** An intermediate note asserted that `strict` added no rules over `recommended` and was therefore free to take. Taking it proved otherwise immediately: `strict` adds `no-noninteractive-element-interactions`, which fires on the reviews carousel. That rule is right in general and wrong here — the handlers it objects to do not make the region operable, they pause an animation that is already pausable by an explicit control and by keyboard focus. The only ways to satisfy it are to make a non-control announce itself as a control, or to drop the pause-on-hover behaviour. Both are worse than the finding, so the rule is excluded by name rather than silently.
- **`npm run lint` now covers `src/`.** This closes a limitation documented in `README.md`, `CONTRIBUTING.md` and the changelog since the rebrand: `src/` had no ESLint at all, only `tsc`. The blocker was upstream. `eslint-config-next` pulls `typescript-eslint`, which hard-throws on load when it sees TypeScript >= 7, and this project is on `typescript@7.0.2` — the native compiler, deliberately, for speed. The previous response was to narrow the config to the JavaScript build tooling and record the gap. `typescript-eslint` reaches the compiler through exactly one call, `require("typescript")`, with no option to supply a different one — and its own error message names the answer: run it against the TypeScript 6 API that ships side by side with 7. So `typescript@6.0.3` is installed under the alias `typescript-lint-api`, and `eslint.config.mjs` seeds the CommonJS module cache so that `require("typescript")` yields the v6 copy **for the lint process only**. `tsc --noEmit` is untouched and still runs on TypeScript 7. Three things were verified before building on it, because a parser that loads and reports nothing proves nothing:
- the upstream gate is version-based, so redirecting the module redirects the gate — without the shim it throws, with it, 136 rules load
- `@typescript-eslint/parser` parses this project's real TSX
- `no-explicit-any` reports a probe and a clean file is silent The seeding must precede the import, and static `import` is hoisted above module-body code, so the import of `typescript-eslint` is dynamic. Making it static would restore the throw and the config would fail to load with the same message as before — a failure that looks like "the old problem is still here".
- **8 unused bindings removed** across 5 files, found by the new coverage: `Link` and `site` in `not-found.tsx`, `useEffect` and `useState` and `site` in `ErrorBoundary.tsx`, `rating` in `StatBand.tsx`, `springExperience` and a map index `i` in `Experience.tsx`. `tsc --noEmit` under `strict` confirms nothing used was removed. The rule set is deliberately four rules plus three core ones, not `tseslint.configs.recommended`. Recommended is a large stylistic surface, and adopting it on a codebase that has never been linted produces hundreds of findings — at which point the realistic options are to fix all of them or silence most of them. Every rule kept was measured across all 54 TS/TSX files first. `no-explicit-any` found nothing and is kept precisely because a rule that passes today is what makes it useful tomorrow.
- `scripts/verify-clinician-assets.mjs`, wired into `npm run build` and CI. It asserts each clinician's four image files exist under that clinician's slug, that no orphan file is left in the directory, and — the part that matters — that no repository text file still references an asset path no clinician owns. Renaming the portraits broke `deploy.yml`, which probes one of those assets to verify the AVIF MIME type and cache headers after every deploy; without this check the next deploy would have replaced the live site and then failed its own verification. `src/content/site.ts` and `CHANGELOG.md` are excluded as historical records. Negative-tested against 8 cases.
- `site.url` as the single source of truth for the production origin, read by `metadataBase` and the enquiry form.
- `scripts/verify-hosts.mjs`, wired into `npm run build` and into CI, which fails the build when `public/robots.txt` or `public/sitemap.xml` drift from `site.url`. Those files cannot import it, so nothing else would catch a move: the site would serve fine while pointing search engines at the old host. It also asserts `site.email` is on the served host or one of its parent domains, which is the check that would have caught the dead address above.
- `verify-hosts.mjs` now sweeps every email-shaped string in the files that ship — `src/`, `public/`, and both licence notices — rather than checking `site.email` alone. Addresses also hide in form placeholders, in the JSON-LD built from `site.email`, and in the licence notice served at `/LICENSE`. Placeholders are permitted only on TLDs reserved by RFC 2606/6761. Verified against 15 cases including the suffix attack `cromstelit.com.example.net`, which a naive reserved-suffix match would have allowed.
- Repository documentation: `CONTRIBUTING.md`, `SECURITY.md`, and a rewritten README covering branch protection, visibility, and the privacy constraints.
- `design/accra-dental-clinic.html` — a standalone design artifact, plus `design/verify-artifact.mjs` with 36 static checks. Not wired into the build.

### Changed

- **Removed the hero scroll indicator** — the hand-drawn SVG arrow at the foot of the homepage hero: a hairline that drew on via `stroke-dashoffset`, a chevron head, a vertical "Scroll" editorial label, and a 2.4-second loop with its own reduced-motion branch. 61 lines, one file, nothing else changed. It was purely decorative (`aria-hidden`) and the label was the only text it carried, so nothing semantic or accessible is lost. The hero's scroll-driven parallax (`scrollYProgress`, `visualY`, `titleY`) is untouched — that is the motion that makes the hero feel alive on scroll, and it is a different mechanism from the indicator's looping draw-on animation. Verified in the rendered export: the arrow's `viewBox`, both path `d` attributes, the vertical label and its wrapper are all absent, and the hero's `<h1>` and copy are intact. `verify-aesthetic`'s icon count is unchanged at 27 because that check counts `lucide`-classed elements and this was hand-drawn SVG — the number moving would have meant the check was counting something else. The CTA arrow (`Cta`'s `arrow` prop, a `lucide` `ArrowUpRight`) is a separate component and is deliberately left in place; removing it would have changed buttons on six pages.
- **Contact phone is now `+233 24 732 2116`.** Previously `+233 30 274 0184`. The number appeared in two places — `site.phone` and a literal in `bookingCta.secondary` — so replacing one left the hero and footer showing a different number from the call button on the same page. `bookingCta` now interpolates `site.phone.display`, leaving one declaration.
- **Clinician portraits renamed to match their clinicians.** `olivia.*` and `ethan.*` were the previous practice's filenames, still rendering behind Dr. Ama Serwaa Boateng and Dr. Kwesi Mensah after the rebrand. Alt text is built from `name` and `role`, so nothing looked wrong and nothing failed. Now `ama-serwaa-boateng.*` and `kwesi-mensah.*`, all four variants each.
- `image` is derived from each clinician's `slug` rather than written by hand, so the filename cannot drift from the person again.
- Deploys publish through Hostinger's static-site archive API instead of SFTP. Endpoint paths, HTTP methods, and the path-versus-body split were verified against the published OpenAPI specification rather than guessed.
- Post-deploy checks extended: the smoke test now asserts an unknown URL returns 404, and a new step asserts the live cache policy matches `.htaccess`, so a silent regression like the one above fails the deploy.

### Removed

- **`eslint-config-next`, which was vestigial.** Nothing imported it — the config only ever imported `@eslint/js` — yet it was still declared and installed, pulling `typescript-eslint`, `eslint-plugin-react`, `jsx-a11y`, `react-hooks`, and the `fast-glob` -> `micromatch` -> `braces` chain behind it. This resolves the one advisory previously recorded as unfixable. `braces` (GHSA-vfj7-8cjw-p6xm) affects every published version including the latest, so there was never a version to upgrade to; the fix was to stop depending on it. `npm audit` now reports **0 vulnerabilities** for the whole tree, dev included, where it previously reported 5 — the same root advisory counted once per level of a chain that no longer exists.
- `.github/dependabot.yml` keeps its grouped dev-tooling update config; the comment above it referenced `eslint-config-next` and no longer does.

### Fixed

- **The reviews carousel had no way to stop.** It rotates every five seconds and keeps going, pausing only on hover and on focus — a courtesy rather than a mechanism, since a touch user has no hover and a keyboard user who tabs past the block has neither. WCAG 2.2.2 (Pause, Stop, Hide) asks for a user-activatable way to stop auto-updating content, so there is now an explicit pause/play control with `aria-pressed`. It is hidden under `prefers-reduced-motion`, because `reduce` already stops the rotation and a pause button for something not moving would be a control that does nothing.
- **Hover and focus fought over one boolean.** `onMouseLeave` and `onBlur` both wrote the same `paused` state, so whichever fired last won: moving the mouse out while a control still had focus resumed the rotation under the cursor, and blurring while the pointer was over the block stopped it. Three independent reasons to hold now combine instead of overwriting each other.
- **A div carried accessibility handlers with no role.** The pause-on-interaction behaviour is deliberate and is kept, but as a bare `div` the handlers were doing work assistive technology could not see, and the block was skipped rather than announced. It is now `role="region"` with a label. This is the finding `no-static-element-interactions` reported.
- **The address is verified.** `18 Boundary Road, Osu, Accra` has been checked against a real listing. The address itself is unchanged; only its status is. The README and changelog notes saying it had never been checked are corrected, and the check that follows asserts no unverified claim survives in the README, CONTRIBUTING, the changelog or the content module.
- **The site was rendering with a transparent page background.** Four base-layer rules in `globals.css` still referenced `--color-cream`, `--color-charcoal` and `--color-lime` — names the rebrand had renamed to `--color-bone`, `--color-cocoa` and `--color-ochre`. A `var()` naming an undefined custom property is invalid at computed-value time, so the declaration is discarded: `body` had `background: transparent` and `color: black` instead of bone and cocoa, and `::selection` had no highlight background. Measured on production before the fix — `getComputedStyle(document.body).backgroundColor` returned `rgba(0, 0, 0, 0)`, where `#f4ede3` was intended. This has been live since the rebrand. **Nothing caught it.** The build passed, lint passed, typecheck passed, `verify-contrast` passed, and `verify-aesthetic`'s existing palette check passed — the new palette *was* present and the old names *were* absent. Every guard was satisfied while the site rendered wrong.
- **`verify-aesthetic.mjs` check 8: every colour referenced in the built CSS is defined.** This is the guard for the above. References carrying a fallback are excluded, which is load-bearing rather than theoretical — Tailwind emits four internal defaults in that form. Definitions are matched at a declaration position so `var(--x)` cannot be read as a definition of `--x`. Negative-tested against the real shipped defect, not a synthetic one, plus a single undefined token and the fallback case.
- **The booking form still asked for a US phone number.** The phone field's placeholder read `+1 (___) ___-____` on a site for a clinic in Osu, Accra. A rebrand can replace every brand string and every address and still leave this behind, because it is not a brand string — nothing in a diff of brand strings points at it. Now `+233 __ ___ ____`, matching the practice's own published format.
- `Counter.tsx` formatted its figures with `toLocaleString("en-US", …)`. Now `en-GH`. The rendered output is identical — the two locales share group and decimal separators — so no visitor sees a difference. Corrected anyway, because a hardcoded foreign locale is precisely the kind of leftover that survives a rebrand unnoticed.
- `verify-visual.mjs` now asserts two things it previously did not:
- **No national format from the previous practice reaches the output** — a `+1` phone number, a US timezone, a P.O. box. Matched against `out/`, so it catches what a visitor sees rather than what a developer left in a comment.
- **No hardcoded foreign locale in the source.** This one has to read `src/`, for two reasons: a locale argument leaves no trace in the HTML (`toLocaleString("en-US", …)` runs during prerendering and the two locales render identically anyway), and a format string in a component that does not prerender never reaches `out/` at all. Comment-only lines are skipped so a comment naming the previous practice stays allowed. Six negative-test cases, including one that pins the gap the source scan exists to close.
- **`verify-hosts.mjs` was validating a file nothing imports.** It read `site.url` from `src/content/site.ts`, which the rebrand had left in place but which no module referenced. Both files happened to carry the same origin, so the check passed — and would have carried on passing after a real move, because it was comparing `public/robots.txt` and `public/sitemap.xml` against a stale copy of the origin rather than the live one. Demonstrated: changing `site.url` in the module the site actually imports left the guard reporting the old origin as "consistent" and exiting 0. It now reads `src/content/accra.ts`, and the same change correctly fails the build. **A guard that validates a file nothing uses is worse than no guard, because it is believed.**
- **`src/content/site.ts` deleted.** Dead code holding the previous practice's address and a `555` phone number, and the file the origin guard was reading. Git history preserves the previous identity, which was the original reason for keeping a parallel content file. Two README pointers aimed contributors at it.
- **The published licence notice was serving the previous practice's address.** `/LICENSE` on the live site carried `142 West 21st Street, New York, NY 10011` — a Manhattan address, for a clinic in Osu, Accra — in the site's own legal notice. It went unnoticed because there were two copies of the licence (`LICENSE` and `public/LICENSE`), they disagreed, and nothing compared them. `public/LICENSE` was also a crude string replacement of the root file, which had produced `"CITGROUP", "CITGROUP", and associated branding` where the trademark clause used to list two distinct names.
- There is now one licence, at the repository root, with CITGROUP as the legal entity and "Accra Dental Clinic" as the trading name. `scripts/stage-server-config.mjs` stages it into the export and asserts the published copy is byte-identical, that the retired address and trading name are absent, and that the current identity is present. It also fails if a `public/LICENSE` reappears. Negative-tested against 7 cases.
- The internal `[OWNER NOTE — REMOVE BEFORE PUBLISHING THIS FILE]` block was being published at `/LICENSE`. It is resolved and gone; a `PARTIES` clause records that CITGROUP is the copyright holder instead.
- The licence pointed reviewers at `src/content/site.ts` for the review-content constraint. That module was retired in the rebrand; the path is now `src/content/accra.ts`.
- `scripts/verify-hosts.mjs` swept `public/LICENSE`, which no longer exists. The walker skips absent paths silently, so the swept file count had quietly fallen from 63 to 61 with nothing reporting it.
- `js/log-injection` (severity: error) at two sites in the image pipeline. Externally-derived values are no longer interpolated into log lines.
- `SECURITY.md` described signed-commit enforcement as an account-level setting. It is a branch-protection control (`required_signatures`).
- The enquiry form stamped `-- Sent via citgroupdental.com` into every email the practice received. That domain is not the one the site is served from and does not resolve in DNS. It now reads the configured origin.
- The advertised contact address was itself undeliverable. `citgroupdental.com` has no NS, A or MX record, so every enquiry hard-bounced from the visitor's mail server. Now `hello@cromstelit.com`, which resolves to Titan MX and is the domain the site is served from. Updated in `site.ts` and in both copies of the licence notice.
- The enquiry form's email placeholder read `you@email.com`. `email.com` is a real registrable domain, so the page rendered a genuine foreign address at the visitor. Now `you@example.com`, on a domain reserved by RFC 2606 that can never be registered.
- `deploy.yml` uploaded with `lftp mirror`, which transfers directories and cannot upload the single archive the step passed it. The step had never run, because its secrets were never set, so the breakage was invisible. It also packaged the archive with an exclusion rule that stripped dotfiles, which would have removed the `.htaccess` and broken AVIF rendering site-wide.
- `deploy.yml` dropped the `needs: verify-inputs` edge, so the confirmation gate could not stop a deploy — the build ran regardless and only `build` was a precondition of `deploy`.
- The README claimed the CDN overrides `.htaccess` cache headers and that image files must be renamed to defeat caching. Both were wrong: the year-long `immutable` header came from a stale origin config file, and a purge is sufficient.
- `.gitignore` pointed at `config/htaccess`, which no longer exists. The single source of truth is `public/.htaccess`.
- **The primary call to action had a third of its height dead.** Measured on production: the header's "Book now" painted a 144x52 button, but the clickable `<a>` was 144x19 — its box was the line box, which did not grow to contain the `py-4` padding sitting on the inner span. The anchor's box fitted entirely *inside* the painted pill, leaving 15px above and 17px below it inert. A visitor aiming at the centre of the site's main button could click and get nothing. The anchor is now `inline-block`, so it shrink-wraps its child including that child's padding: 144x52, dead band 0px top and bottom. This only ever broke where the anchor sat in ordinary flow — inside a flex container the anchor is blockified and was already correct, which is why it went unnoticed on the buttons further down the page.
- **The footer's email link was a 162x19 target**, under the 24x24 that WCAG 2.2 SC 2.5.8 (Target Size, Minimum) requires. Now 162x32 via `inline-block py-1`. Padding rather than a fixed height, so it still wraps on narrow viewports and still reads as a text link rather than a button. Site-wide after both: **0 targets under 24px across all 7 pages**, 195 controls checked in a real browser.
- **Animated counters were announced digit by digit.** `Counter` rendered the animating value as bare text nodes, so the accessibility tree carried every intermediate frame — the stats band read as "0" "1" " / 0" "4", individual digits recomputed about sixty times a second, never once presenting a number a visitor could use. It now exposes the settled value once in `sr-only` and marks the animated copy `aria-hidden`, the same pattern `SplitText` already uses for the hero heading. `useReducedMotion` had always snapped to the final value, but that only helps visitors who asked for reduced motion; this helps everyone.
- **`<meta name="color-scheme" content="light">` added.** The site pins its own light surfaces, so without this a visitor whose browser is in dark mode got dark-rendered form controls and scrollbars sitting on a bone page. Added to the `viewport` export rather than as a literal tag, since Next routes Viewport fields to the right tag itself.
- `Cta`'s `lime` and `gold` variants had the same class string duplicated in both, so editing one would have silently left the other behind with nothing reporting it. They now share one constant, marked as an alias.

### Security

- `source-map-js` pinned to `^1.2.2` via an npm `overrides` entry, clearing GHSA-68fv-2mgg-jv7q (high — event-loop denial of service through indexed source-map section offsets, affecting 1.0.0–1.2.1). It arrives transitively through `postcss`, which both `@tailwindcss/postcss` and `next` depend on, and CI audits production dependencies, so the build failed on it.
- **`npm audit fix` is not usable in this repository.** **Superseded:** the dependency it wanted to downgrade has since been removed, so this is no longer reachable in practice. Retained because the reasoning still holds for any future transitive advisory: it proposed a plain upgrade for the one real finding, and a semver-major downgrade of the lint configuration for the rest. The record was `eslint-config-next@14.2.35` — a semver-major downgrade of the lint configuration, on a project running `eslint-config-next` 16 and Next 16. Running it would silence every advisory while trading two major versions of the framework's tooling for dev-only findings. Recorded here so the next person does not try it.
- ~~**One advisory remains open, and it cannot be fixed.**~~ **Resolved:** `braces` came in through `eslint-config-next`, which nothing imported and which has since been removed, so the chain no longer exists and `npm audit` reports 0 vulnerabilities tree-wide. The entry below records what was true while it was still a dependency. `braces` is vulnerable to stack exhaustion through deeply nested glob patterns (GHSA-vfj7-8cjw-p6xm, affecting `<=3.0.3`). `braces@3.0.3` is the latest published version, so there is no upgrade that clears it. `npm audit` reports this as *five* advisories — `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next` and `eslint-config-next` — but that is one root advisory propagated up four levels of a single chain: eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces. None of the four outer packages is independently vulnerable. `eslint-config-next` 16.3.8 was checked and still pins `fast-glob@3.3.1`, so a patch upgrade does not break the chain.
- ~~It is dev-only and does not block a merge.~~ **Resolved.** While it was still installed it was dev-only, and CI's blocking step `npm audit --omit=dev --audit-level=high` excluded it, reporting **0 vulnerabilities**. The full report runs separately and non-blocking, so a future upstream fix shows up there rather than as a red build. Nothing needs suppressing.
- Branch protection on `main`: 5 required status checks with `strict` on, enforcement on admins, linear history, and branch deletion and force-pushes blocked.
- The 1-approving-review requirement was **removed**. In a single-maintainer repository it cannot be satisfied — the author is the only possible approver and GitHub blocks self-approval — so it acted as a permanent deadlock rather than a control. The trade-off is recorded in `SECURITY.md`: a compromised token or a careless push now reaches `main` once CI is green, and the checks do not cover subtle or malicious logic changes.
- Removed the redundant `ci-gate` ruleset; branch protection supersedes it.
- CodeQL `security-extended` is blocking on push to `main` and on every PR.
- Dependabot security updates and automated security fixes enabled.
- Deploy credentials reduced from five SFTP secrets to one API token. The old cache-clear step reused the SFTP password to authenticate to the LiteSpeed purge endpoint; that credential is no longer doing double duty.

### Decisions

- **The social handles stay as placeholders.** `@accradentalclinic` on Instagram and TikTok was invented when the rebrand landed. The owner has reviewed the trade-off and elected to keep them, so this is no longer an open question and will not be raised as an outstanding finding again. The reasoning is unchanged and is recorded in `src/content/accra.ts`: a placeholder handle in `sameAs` is a claim of identity to search engines, and a live-looking handle that belongs to a stranger would send patients to someone else's account. Swap them if the practice registers the real ones — verify ownership on each platform first, do not infer it from the name being available.
- **The address stays as supplied.** `18 Boundary Road, Osu, Accra` is owner-supplied and has since been checked against a real listing, which confirmed it. It is published in the footer, the contact page, a map link and the structured data. Re-check it if the practice moves. Neither blocks a deploy. No site content changed, so nothing was redeployed for this entry.

### Known limitations

- **`.npmrc` sets `legacy-peer-deps=true`.** npm checks `typescript-eslint`'s declared peer range (`<6.1.0`) against the top-level `typescript@7.0.2` and refuses to install. The peer is satisfied in practice — the linter genuinely runs on 6.0.3 — but npm only sees the declared tree. Declared in `.npmrc` rather than passed as a flag, so `npm ci`, a fresh clone and a local install all behave the same; a hand-typed flag is the version of this that breaks CI quietly. The cost is stated plainly: while it is set, npm will not complain about *any* peer conflict here, not just this one. Accepted because the alternatives are downgrading the TypeScript toolchain or leaving `src/` unlinted. Delete the line once upstream widens the peer range (typescript-eslint issue #10940).
- `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` are no longer in the tree at all, since they arrived only as transitive dependencies of `eslint-config-next`. Neither is configured. Both are worth adding as direct dev dependencies with a measured rule set, in the same way as above — not enabled blind.

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
  can run. **Superseded:** deploys now publish through Hostinger's static-site
  archive API and the workflow needs a single secret, `HOSTINGER_API_TOKEN`. Kept
  as written because this section records what was true at v1.0.0, but it does not
  describe the current workflow.
- Contact details in `src/content/site.ts` include a reserved `555` phone
  number and must be replaced before launch.
- Images in `public/images/` are generated placeholders. Real patient
  photography requires documented written consent.

[Unreleased]: https://github.com/cromstel/dental-clinic/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cromstel/dental-clinic/releases/tag/v1.0.0
