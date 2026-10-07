![Accra Dental Clinic](.github/assets/banner.svg)

# Accra Dental Clinic

Premium dental clinic website for a private practice in Osu, Accra — fully static, exportable Next.js 16 build with motion-rich UI.

Live at **https://dental-clinic.cromstelit.com** — a fully static Next.js export served from Hostinger shared hosting. No Node runtime, no database, no server. The site is a brochure plus a `mailto:` enquiry form; everything else is build-time.

## Tech Stack
- **Framework:** Next.js 16.3.6 (App Router, `output: "export"`, Turbopack)
- **Language:** TypeScript 7.0.2
- **Styling:** Tailwind CSS v4 + custom design tokens
- **Animation:** `motion/react` (Framer Motion), reduced-motion gating on every animated component
- **Fonts:** Self-hosted Clash Display + Instrument Serif + Inter via `next/font/local`
- **Images:** Local placeholders only (`public/images/…`), `images.unoptimized: true`
- **No runtime:** No DB, auth, API routes, Server Actions, Node server — pure static HTML/CSS/JS

## Scripts
```bash
npm run dev        # dev server at localhost:5711
npm run build      # static export to /out, then 3 post-build gates (see below)
npm run build:next # just `next build`, no post-build steps (debugging only)
npm run start      # serve the build — note: output is "export", so prefer any static server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (build tooling only — see note)
```

`npm run start` exists for parity but is not how this site is served. With `output: "export"` there is no Node server in production; use any static server over `out/`.

### What `npm run build` actually does
`next build` alone does not produce a deployable site. Three post-build steps run in sequence, and each one exists because its failure mode has shipped silently before:

1. **`scripts/rsc-payload-fix.mjs`** — normalizes per-route RSC prefetch payload filenames. Next 16 writes `<route>/__next.<route>/__PAGE__.txt` (slash form) but the client router fetches `<route>/__next.<route>.__PAGE__.txt` (dot form). Unfixed, every cross-route prefetch 404s and soft navigation degrades to full page loads. No compiler error.
2. **`scripts/stage-server-config.mjs`** — asserts `out/.htaccess` exists and still carries its `AddType` rules. The file is copied from `public/.htaccess` by Next itself; there is no staging step and no second source of truth. Without it Hostinger serves `.avif` as `text/plain`, which breaks every `<picture>` source. **Load-bearing — do not delete `public/.htaccess`.**
3. **`scripts/verify-export.mjs`** — fails the build if any route HTML, RSC payload, `robots.txt`, or `sitemap.xml` entry is missing, if stale payload directories remain, if `.htaccess` was not staged, or if source/deps leaked into `out/`. This is the gate that makes CI trustworthy.

`scripts/simulate-ci.sh` runs the same assertions locally under Git Bash before you push.

### A note on linting
`npm run lint` covers `src/` as well as the build tooling. `next lint` was removed in Next 16, so this runs ESLint directly against a flat config in `eslint.config.mjs`.

TypeScript is linted by pointing `typescript-eslint` at the **TypeScript 6 API**, installed under the alias `typescript-lint-api`, while `tsc --noEmit` keeps running on TypeScript 7. `typescript-eslint` reaches the compiler only through `require("typescript")` and throws on load when it sees TS >= 7, so `eslint.config.mjs` seeds the module cache for the lint process. The top of that file documents it, and `.npmrc` explains why installs need `legacy-peer-deps`.

`tsc --noEmit` remains the authority on types — it is not replaced by any of this. The two checks overlap deliberately: ESLint here is a short, measured rule set rather than `tseslint.configs.recommended`, because adopting the recommended set on a codebase that had never been linted produces hundreds of findings, and the realistic options then are to fix all of them or silence most of them.

## Structure
```
src/
  app/                    # App Router pages (/, /services, /invisalign, /dentists, /about, /faq, /contact)
  assets/fonts/           # Clash Display, Instrument Serif, Inter (self-hosted woff2)
  components/
    layout/               # Nav, Footer, FloatingCta, ProgressBar, ScrollToTop, ErrorBoundary
    motion/               # SplitText, Reveal, Magnetic, Marquee, Counter, ToothVisual-adjacent
                          #   CustomCursor, MotionProvider
    sections/
      shared/             # PageHero (reusable subpage hero)
      home/               # Hero, MarqueeBand, Intro, Experience, Reviews, BookingCta, LocationTieout
      services/           # ServicesList, SmileTransformation, WhiteningBand, InsuranceBand
      invisalign/         # AlignerVisual, InvisalignFeatures
      dentists/           # DoctorsList
      about/              # PatientJourney, Manifesto, StatBand
      faq/                # FaqAccordion
      contact/            # ContactForm (mailto), ContactDetails
    ui/                   # Cta, OptimizedImage, SmileGraphic, StepBadge, TextOutline, ToothVisual
  content/
    accra.ts              # ALL business copy + config (single source of truth)
    types.ts              # TS interfaces
  lib/
    utils.ts              # cn, toMailto, formatPhoneLink, swatch/swatchText
    motion.ts             # shared motion variants / easings
    useHydrated.ts        # SSR-safe hydration gate (see Accessibility note)
public/
  images/                 # AVIF + WebP placeholders (services, doctors, transformations)
  favicon.svg
  robots.txt              # Sitemap pointer — keep in sync with the routes above
  sitemap.xml             # 7 canonical URLs
  LICENSE                 # published alongside the site
  .htaccess               # HOST CONFIG — copied into out/ by the build, ships in the archive
deploy/                    # gitignored — generated deploy artifacts only
scripts/
  rsc-payload-fix.mjs     # normalizes RSC prefetch filenames (see Scripts)
  stage-server-config.mjs # asserts out/.htaccess and its MIME rules
  verify-export.mjs       # fails the build if the export is not deployable
  simulate-ci.sh          # run the CI assertions locally
  simulate-release-package.sh  # exercises the release tarball packaging locally
  download-and-convert-images.js  # one-off asset pipeline (Unsplash -> AVIF)
  generate-responsive-images.mjs
.github/
  workflows/              # ci, deploy, codeql
  dependabot.yml
```

`deploy/` is gitignored: it holds only generated deploy artifacts (`out.zip` and
its README). Everything needed to *produce* a deploy is tracked.

## Content Source
All copy, services, doctors, hours, transformation stats, FAQs, contact info live in **`src/content/accra.ts`**. Edit there — pages consume it directly, and `scripts/verify-hosts.mjs` reads `site.url` and `site.email` from it to check `public/robots.txt` and `public/sitemap.xml` have not drifted.

## Placeholders
These are **not** production assets. Replace before launch.

- Transformation images (`public/images/transform/`) are labelled as illustrative in `accra.ts` and the pair is explicitly placeholder. Before/after clinical photography may only be published with documented written patient consent specifying scope of use.
- Doctor photos (`public/images/doctors/*.avif`) and service cards are generated placeholders.
- Contact details in `src/content/accra.ts` are owner-supplied: the phone is `+233 24 732 2116` and `hello@cromstelit.com` is confirmed receiving mail. `metadataBase` and the published canonical host are `dental-clinic.cromstelit.com`. **To move the domain, change all four together** — `site.url` in `src/content/accra.ts`, `metadataBase` in `src/app/layout.tsx`, `public/robots.txt`, and `public/sitemap.xml`. `scripts/verify-hosts.mjs` reads `site.url` from the content module and fails the build if the sitemap or robots disagree with it, so leaving `site.url` behind will reject your correctly-updated static files.
- The Instagram and TikTok handles in `socials` are **placeholders**, not registered accounts. They are published as `sameAs` in the JSON-LD, so a placeholder is also a claim of identity to search engines. Verify ownership on both platforms before replacing them; do not infer ownership from the name being available.
- The address `18 Boundary Road, Osu, Accra` is owner-supplied, confirmed by the owner, and has not been independently checked against a listing or map coordinates. Published in the footer, contact page, map link and structured data. Re-check it if the practice moves.
- The social handles (`@accradentalclinic`) are deliberate placeholders, confirmed by the owner, and are published as `sameAs` in the structured data. They are a settled decision rather than an outstanding gap — see the `## Decisions` section of `CHANGELOG.md` for the reasoning and for what to verify before replacing them.
- **CITGROUP is the legal entity** and the copyright holder. "Accra Dental Clinic" is the trading name it operates the site under. `LICENSE` is the single source: it lives at the repository root, and `scripts/stage-server-config.mjs` stages it into the export as `/LICENSE` and asserts the copy is byte-identical. There is deliberately no `public/LICENSE` — two copies is what let them disagree.

## Deployment
`out/` is a complete, self-contained static site, including `.htaccess` (copied by the build from `public/`) and `LICENSE`. Deploy the **contents** of `out/` to any static host, or wrap it as an archive with `npm run package:deploy` and deploy that. `trailingSlash: true` means the host must serve `about/index.html` at `/about/`.

See [Where the site lives](#where-the-site-lives) and [Manual deploy](#manual-deploy-filezilla--any-ftp-or-sftp-client) for the production path and the FTP details.

The `.htaccess` is Hostinger/LiteSpeed-specific and is the one file that is easy to lose in a partial upload. It is tracked at **`public/.htaccess`**, and because it lives in `public/` Next copies it into `out/`, so a plain `out/` upload always includes it. If AVIF images render broken or fall back to WebP, that file is missing from the server.

It matters because:

- `AddType image/avif .avif` / `image/webp` are **load-bearing** — without them Hostinger serves `.avif` as `text/plain`, the AVIF `<picture>` sources fail to decode, and the browser falls back.
- The one-year `immutable` cache is scoped to `/_next/static/**` (`.js`, `.css`, `.woff2`). Those filenames are content-hash fingerprinted, so they can never go stale.
- `/images/*` is **deliberately excluded** from that policy. Those are authored filenames with no content hash (`kwesi-mensah-800w.avif`), so pinning them would keep replaced photography cached for a year. They get a 7-day TTL with `stale-while-revalidate` instead.
- HTML is set to `max-age=0, must-revalidate`, and the RSC `.txt` payloads / sitemap / robots to a 5-minute `stale-while-revalidate` window, so a redeploy is picked up quickly while the CDN still absorbs repeat traffic.

> The CDN does **not** override `.htaccess`. If an asset returns a cache policy you did not write, the origin is serving a different config file — check that `public/.htaccess` is what actually reached the server. Renaming image files to defeat caching is not necessary; replacing an image under the same filename and purging the cache is enough.

> If you ever find `public/.htaccess` missing, do **not** recreate it from memory — it previously existed only in a local temp folder and was lost. `git log` has it.

### Where the site lives

```
/home/u255640043/domains/cromstelit.com/public_html/dental-clinic
```

| | |
|---|---|
| FTP / SFTP host | `ftp.us.hostinger.com` (port 21; use explicit FTPS if offered) |
| Username | `u255640043` — the hPanel account, **not** the domain |
| Document root | the path above, i.e. `public_html/` **plus** the `dental-clinic/` subdirectory |

> **`public_html/dental-clinic/`, not `public_html/`.** This is a subdomain, so
> its document root is one level below the parent domain's. `cromstelit.com`
> itself serves a different site (CromStel IT Solutions); uploading here would
> put the clinic's files in that site's root and leave the subdomain serving
> stale content. The API resolves the site root correctly, so the automated path
> is unaffected — this only matters when uploading by hand.

### Manual deploy (FileZilla / any FTP or SFTP client)

**Easiest and safest: upload one archive and let the deploy step extract it.**

1. `npm run build`
2. `npm run package:deploy` — writes `deploy/out.zip` (156 entries). This is a
   separate step: `npm run build` only produces `out/`, so the archive does not
   exist until you ask for it.
3. FTP-upload **`deploy/out.zip`** into the document root above, as a single file.
   Do **not** extract it yourself — the deploy call unpacks it, and unpacking by
   hand risks a nested `out/` subdirectory.
4. Confirm the size on the server matches the local file exactly, then run the
   static-site-archive deploy with `archive_path: "out.zip"`. It replaces the
   site root from the archive, which means deleted files are removed from
   production and the `.zip` does not survive into the site root — so there is no
   cleanup step, and nothing stale is left behind.
5. Purge the cache (hPanel → Performance, or the cache endpoint).

If you must upload the files individually instead, upload the **contents** of
`out/` (not the `out` folder itself) into the document root. Expect this shape:

```
dental-clinic/
  .htaccess          <- copied into out/ by the build from public/.htaccess
  index.html   404.html   favicon.svg   robots.txt   sitemap.xml
  LICENSE             <- published alongside the site
  _next/              <- compiled JS/CSS/fonts
  about/ contact/ dentists/ faq/ invisalign/ services/
  images/  _not-found/
  *.txt               <- RSC prefetch payloads (required, leave as-is)
```

Two things that silently go wrong when mirroring file by file:

- **`.htaccess` is a dotfile** and many clients skip it. Without it LiteSpeed
  serves `.avif` as `text/plain`, browsers refuse to decode it, and every
  `<picture>` falls back. It presents as a caching problem and is not one.
- **Transfer mode must be Binary.** ASCII corrupts AVIF and WebP.

Append `?x=<n>` to a URL when you need to see a change immediately — the CDN
serves fresh files as `DYNAMIC`.

Verify afterwards: all 7 routes 200, unknown URL shows the 404 page, `/robots.txt`
and `/sitemap.xml` 200, and `/images/doctors/kwesi-mensah-800w.avif` returns
`Content-Type: image/avif` — if it returns `text/plain`, `.htaccess` did not
upload. That single check catches both a missing dotfile and a broken one.

If a URL keeps serving old content after a correct upload, that is the CDN, not
the origin. Purge and re-check with a fresh cache-buster before suspecting the
deploy.

### Automated deploys
`.github/workflows/deploy.yml` publishes to Hostinger. It is **`workflow_dispatch` only, not push-triggered** — a deploy replaces production and the `.htaccess` is load-bearing, so it is a deliberate human action. Run it from the Actions tab and type `DEPLOY` to confirm.

It requires one repository secret (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|---|---|
| `HOSTINGER_API_TOKEN` | hPanel → Account → API. Needs website + files access. |

The account username and domain are not secrets; they sit in the workflow's `env` block.

The workflow packages `out/` as `out.zip`, uploads it with Hostinger's TUS resumable upload, then calls the static-site-archive endpoint, which **replaces the site root** from the archive. That means files deleted from the build are also removed from production, and the uploaded `.zip` does not survive into the site root. One archive avoids hundreds of small round-trips, which is where partial uploads come from.

After upload it waits for the site to answer 200 (the root is briefly unavailable while the archive is swapped in), then runs a post-deploy smoke test — all seven routes, the RSC payloads, `robots.txt`, `sitemap.xml`, and a 404 check — with cache-busters so the origin is tested rather than the CDN edge. It then asserts:

- `/images/doctors/kwesi-mensah-800w.avif` returns `Content-Type: image/avif` — the direct detector of a missing or broken `.htaccess`
- `/images/*` carries `max-age=604800` and HTML carries `max-age=0`, guarding the regression described above

Deploys run against a `production` environment and are serialised by a concurrency group, so two can never race.

### Manual deploy without the workflow
`npm run build` produces `out/`; `npm run package:deploy` wraps it as
`deploy/out.zip`. Upload that single archive to the document root above and
deploy it with `archive_path: "out.zip"` — one transfer, and the deploy unpacks
it. If you upload the files individually instead, upload the **contents** of
`out/` to the document root, not the `out` folder itself. The build has already
asserted `.htaccess` is present with its AVIF rules intact, and the packaging
step asserts it again inside the archive — without it every `<picture>` falls
back, so the packaging step refuses to write an archive that lacks it rather
than producing one that looks fine and breaks in production.

If the TUS create returns `401` while the same credentials read fine, **suspect the
client before the account.** This was misdiagnosed for a while as "Hostinger is
refusing writes" — it was not; the account was fine and writes succeed. What was
observed: `curl` and `node` run locally both authenticated for reads (`GET` on
`/rest/…/` → `200`) and were refused for writes (`POST` on `/api/tus/` → `401`),
while a `fetch` from a different runtime issued the same request and got `201`,
with the file verifiable in the site root afterwards. So a `401` on write is not
evidence of a permission problem. Check whether a different client can write,
and confirm the write landed by listing the site root, before escalating to
Hostinger support.

## CI
`.github/workflows/ci.yml` runs on every push and PR to `main`, as five parallel jobs: **lint**, **typecheck**, **build** (including `verify-export.mjs` and `verify-hosts.mjs`), **audit**, and a **guards** job that asserts `.nvmrc`, `public/.htaccess`, and the build-script wiring are actually committed.

Node version is pinned in `.nvmrc` (currently 22). Use it locally too (`nvm use`) so a build that passes CI does not fail on your machine. Next 16 requires Node >= 20.9.

`audit` fails on high/critical advisories in production dependencies.

`.github/workflows/codeql.yml` runs CodeQL on push to `main`, on every PR, weekly, and on manual dispatch, using the `security-extended` suite. Findings are **blocking** — `fail-on-error: true` semantics apply via the job, so a new alert fails the run and the results appear in the Security tab. Zero open alerts at time of writing.

### Branch protection
`main` is protected by the automated gates:

- **Required status checks:** Lint, Typecheck, Build static export, Dependency audit, Workflow sanity (with `strict`, so a branch must be up to date first)
- **Enforced on admins** — a maintainer cannot bypass it
- **Linear history**, no force-push, no branch deletion
- **No human approval required** — a PR merges once the five checks are green. A one-approval rule was removed because a solo maintainer cannot satisfy it: the author is the only possible approver, and GitHub blocks self-approval, so it blocked every PR indefinitely. CodeRabbit still reviews each PR; nothing blocks on it. See `SECURITY.md` for what this trades away.
- **Signed commits not required** — the control exists in branch protection but is off until every contributor has signing configured.

Direct pushes to `main` are rejected. Branch → PR is the only path — see `CONTRIBUTING.md`.

### Repository visibility
The repository is **public**, deliberately: branch protection and code scanning are plan-gated on private repositories. `LICENSE` is proprietary/all-rights-reserved, but a licence asserts rights rather than enforcing them, so the source is readable and clonable. There is no patient data in the repo. See `SECURITY.md` for the full threat model and what is not protected.

### Dependency updates
`.github/dependabot.yml` opens PRs on three schedules: weekly grouped bumps for production and dev tooling, **daily ungrouped** security fixes, and weekly `github-actions` updates. Grouped PRs are never auto-merged — CI is the gate.

Major bumps for `typescript`, `next`, `react`, and `react-dom` are ignored on purpose; each needs a human (see the linting note above for the TypeScript constraint).

### Running CI locally
`scripts/simulate-ci.sh` executes the guards job's assertions and the deploy job's tarball check under Git Bash, so a change that would fail CI fails locally first:

```bash
bash scripts/simulate-ci.sh
```

It verifies `.nvmrc`, `public/.htaccess`, `public/robots.txt` and `public/sitemap.xml` are present; that the three post-build scripts are wired into `npm run build`; that `out/` has at least 100 files; and that `.htaccess` ends up inside the deploy tarball. The equivalent of the full gate suite is `npm run lint && npm run typecheck && npm run build && npm audit --omit=dev --audit-level=high`.

## Accessibility
Lighthouse 13.5.0 against a local `out/` (unthrottled desktop): **Accessibility 100, Best Practices 100, SEO 100 on all seven routes**, plus the 404 page at a11y 100 / BP 100. CLS 0.

Two defects fixed during that pass are worth not reintroducing:
- Decorative display words in `Intro` were `display: none` below 1024px, so mobile users never saw them and they failed the desktop run. They are now `::before` pseudo-elements — axe cannot evaluate pseudo content, and WCAG 1.4.3 exempts pure decoration.
- FAQ index numbers sat at `text-charcoal/35` (2.17:1). Now `/70` (6.11:1).

Accessibility is a merge gate, not an aspiration: the `audit` and `guards` jobs exist to stop the silent regressions, and any new colour pair should be checked against the table in **Design tokens** before it ships.

## Design tokens
The midnight/gold hero palette lives in `@theme` in `src/app/globals.css` — never hardcode these in components.

| Token | Value | Use |
|-------|-------|-----|
| `--color-midnight` | `#0a1628` | Hero / dark-section background |
| `--color-midnight-deep` | `#0e2240` | Hero radial-gradient depth |
| `--color-gold` | `#c8a45c` | Gold accent, gold CTA fill |
| `--color-gold-bright` | `#d8b978` | Reserved: higher-contrast gold |
| `--color-gold-deep` | `#b89448` | Gold CTA hover |
| `--color-gold-ink` | `#7a5c1f` | **The only gold tone safe on cream/paper** |
| `--color-ivory` | `#f8f5f0` | Body text on midnight |
| `--color-focus-halo` | `#ffffff` | Light band of the focus ring |

Declared with `@theme static` so the variables are always emitted, even before a utility references them. The editorial serif pair is `--font-editorial` (Instrument Serif, Cormorant Garamond behind it) → the `font-editorial` utility; both faces are self-hosted from `src/assets/fonts/`.

Measured contrast (WCAG 2.1) — the pairs that are safe:

    ivory        on midnight      16.67:1     gold       on midnight   7.70:1
    midnight     on ivory         16.67:1     midnight   on gold       7.70:1
    gold-bright  on midnight       9.61:1     gold-deep  on midnight   6.36:1
    gold-ink     on cream          5.47:1     ivory      on midnight-deep 14.61:1

**Do not** pair gold / gold-bright with ivory (2.16:1 / 1.73:1), and do not put gold-family text on the cream or paper page body (2.07:1 / 2.18:1) — use `--color-gold-ink` there.

## License
Proprietary - © 2026 Accra Dental Clinic, all rights reserved. Not open source. Full text in [LICENSE](./LICENSE).

Third-party dependencies remain under their own licenses, recorded in `package-lock.json`.

## Privacy constraints
This site is bound by three privacy constraints, recorded in `LICENSE` because changing any of them changes the site's legal posture. The current implementation is deliberately minimal:

- **No server-side data collection.** The enquiry form composes a message in the visitor's own mail client via `mailto:`. Nothing is transmitted to, received by, or stored on any server. Adding server-side transmission, storage, or logging requires a documented lawful basis.
- **No cookies, no analytics, no tag managers, no session storage.** This is load-bearing: the absence of non-essential cookies is why the site needs no consent banner. Adding any tracking SDK requires a consent mechanism and a privacy policy.
- **Reviews carry first name + neighbourhood only.** Deliberately reduced detail. Do not expand to surnames, full addresses, treatment dates, or anything else that becomes identifying in a small locality.

`public/images/` currently holds generated placeholders, not real patient records. Real patient or clinical photography may only be published with documented written consent specifying scope of use.