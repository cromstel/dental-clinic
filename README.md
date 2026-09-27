# CITGROUP Dental Studio

Premium dental clinic website for a Manhattan practice — fully static, exportable Next.js 16 build with motion-rich UI.

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
2. **`scripts/stage-server-config.mjs`** — copies `config/htaccess` → `out/.htaccess`. The export cannot know about the host, and without this file Hostinger serves `.avif` as `text/plain`, which breaks every `<picture>` source. **Load-bearing — do not delete `config/htaccess`.**
3. **`scripts/verify-export.mjs`** — fails the build if any route HTML, RSC payload, `robots.txt`, or `sitemap.xml` entry is missing, if stale payload directories remain, if `.htaccess` was not staged, or if source/deps leaked into `out/`. This is the gate that makes CI trustworthy.

`scripts/simulate-ci.sh` runs the same assertions locally under Git Bash before you push.

### A note on linting
`npm run lint` covers the JavaScript build tooling (`scripts/`, `next.config.mjs`, `postcss.config.mjs`), **not** `.ts`/`.tsx`. `eslint-config-next` cannot be loaded here: it pulls `typescript-eslint@8.70.1`, which throws on load when it detects TypeScript >= 7. `next lint` was also removed in Next 16, so the old `lint` script linted nothing at all.

`src/` is covered by `npm run typecheck` instead, which is a stronger guarantee. To re-enable full TS linting, see the instructions at the top of `eslint.config.mjs`.

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
    site.ts               # ALL business copy + config (single source of truth)
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
deploy/                    # gitignored — generated deploy artifacts only
scripts/
  rsc-payload-fix.mjs     # normalizes RSC prefetch filenames (see Scripts)
  stage-server-config.mjs # config/htaccess -> out/.htaccess
  verify-export.mjs       # fails the build if the export is not deployable
  simulate-ci.sh          # run the CI assertions locally
  download-and-convert-images.js  # one-off asset pipeline (Unsplash -> AVIF)
  generate-responsive-images.mjs
config/
  htaccess                # HOSTER CONFIG — source of truth, copied to out/.htaccess
.github/
  workflows/              # ci, deploy, codeql
  dependabot.yml
```

`deploy/` is gitignored: it holds only generated deploy artifacts (`out.zip` and
its README). Everything needed to *produce* a deploy is tracked.

## Content Source
All copy, services, doctors, hours, transformation stats, FAQs, contact info live in **`src/content/site.ts`**. Edit there — pages consume it directly.

## Placeholders
These are **not** production assets. Replace before launch.

- Transformation images (`public/images/transform/`) are labelled as illustrative in `site.ts` and the pair is explicitly placeholder. Before/after clinical photography may only be published with documented written patient consent specifying scope of use.
- Doctor photos (`public/images/doctors/*.avif`) and service cards are generated placeholders.
- Contact details in `site.ts` are partly self-declared: the phone is a reserved `555` number, and `+1 (212) 555 0184` is not a real line. `metadataBase` and the published canonical host are `dental-clinic.cromstelit.com`; if the real production domain differs, change `metadataBase` in `src/app/layout.tsx` **and** both `public/robots.txt` and `public/sitemap.xml` together — canonicals and the sitemap must not disagree.
- The `CITGROUP` legal entity name in `LICENSE` uses the trading name from `site.ts`. Substitute the registered entity if one exists; see the owner note at the foot of `LICENSE`.

## Deployment
`out/` is a complete, self-contained static site, including `.htaccess` (staged by the build) and `LICENSE`. Deploy the **contents** of `out/` to any static host. `trailingSlash: true` means the host must serve `about/index.html` at `/about/`.

The `.htaccess` is Hostinger/LiteSpeed-specific and is the one file that is easy to lose in a partial upload. It is tracked at **`config/htaccess`** and the build copies it into `out/.htaccess`, so a plain `out/` upload includes it automatically. If AVIF images render broken or fall back to WebP, that file is missing from the server.

It matters because:

- `AddType image/avif .avif` / `image/webp` are **load-bearing** — without them Hostinger serves `.avif` as `text/plain`, the AVIF `<picture>` sources fail to decode, and the browser falls back.
- The one-year `immutable` cache covers `/_next/static/**` `.js`, `.css`, `.woff2` as well as images. Those filenames are content-hash fingerprinted, so they can never go stale.
- HTML is set to `max-age=0, must-revalidate`, and the RSC `.txt` payloads / sitemap / robots to a 5-minute `stale-while-revalidate` window, so a redeploy is picked up quickly while the CDN still absorbs repeat traffic.

> If you ever find `config/htaccess` missing, do **not** recreate it from memory — it previously existed only in a local temp folder and was lost. `git log` has it.

### Manual deploy (FileZilla / any SFTP client)
1. `npm run build`
2. Upload the **contents** of `out/` into `public_html/` (not the `out` folder itself). It now contains `.htaccess`, so there is no separate step.
3. Expect this shape on the server:
   ```
   public_html/
     .htaccess          <- staged by the build from config/htaccess
     index.html   404.html   favicon.svg   robots.txt   sitemap.xml
     LICENSE             <- published alongside the site
     _next/              <- compiled JS/CSS/fonts
     about/ contact/ dentists/ faq/ invisalign/ services/
     images/  _not-found/
     *.txt               <- RSC prefetch payloads (required, leave as-is)
   ```
4. Append `?x=<n>` to a URL when you need to see a change immediately — the CDN serves fresh files as `DYNAMIC`.

Verify afterwards: all 7 routes 200, unknown URL shows the 404 page, `/robots.txt` and `/sitemap.xml` 200, and `/images/services/cosmetic.avif` returns `Content-Type: image/avif` (if it returns `text/plain`, `.htaccess` did not upload).

### Automated deploys
`.github/workflows/deploy.yml` publishes to Hostinger over SFTP. It is **`workflow_dispatch` only, not push-triggered** — a deploy replaces production and the `.htaccess` is load-bearing, so it is a deliberate human action. Run it from the Actions tab and type `DEPLOY` to confirm.

It requires these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Example |
|---|---|
| `HOSTINGER_SFTP_HOST` | `ftp.us.hostinger.com` |
| `HOSTINGER_SFTP_PORT` | `65002` |
| `HOSTINGER_SFTP_USER` | SFTP user created in hPanel |
| `HOSTINGER_SFTP_PASSWORD` | — |
| `HOSTINGER_SFTP_DIR` | `/public_html/dental-clinic` |

Prefer an SFTP user scoped to the site directory over the primary account. The workflow verifies all five secrets are present before it starts, mirrors with `--delete` so the remote matches the archive exactly, and uses a single `tar.gz` transfer rather than hundreds of small round-trips.

After upload it runs a post-deploy smoke test — all seven routes, the RSC payloads, `robots.txt`, `sitemap.xml` — with cache-busters so the origin is tested rather than the CDN edge. It then asserts `/images/doctors/ethan-800w.avif` returns `Content-Type: image/avif`, which is the direct detector of a missing or broken `.htaccess`. Deploys run against a `production` environment and are serialised by a concurrency group, so two can never race.

## CI
`.github/workflows/ci.yml` runs on every push and PR to `main`, as five parallel jobs: **lint**, **typecheck**, **build** (including `verify-export.mjs`), **audit**, and a **guards** job that asserts `.nvmrc`, `config/htaccess`, and the build-script wiring are actually committed.

Node version is pinned in `.nvmrc` (currently 22). Use it locally too (`nvm use`) so a build that passes CI does not fail on your machine. Next 16 requires Node >= 20.9.

`audit` fails on high/critical advisories in production dependencies.

`.github/workflows/codeql.yml` runs CodeQL on push to `main`, on every PR, weekly, and on manual dispatch, using the `security-extended` suite. Findings are **blocking** — `fail-on-error: true` semantics apply via the job, so a new alert fails the run and the results appear in the Security tab. Zero open alerts at time of writing.

### Branch protection
`main` carries full branch protection:

- **Required status checks:** Lint, Typecheck, Build static export, Dependency audit, Workflow sanity
- **Required pull request review:** 1 approving review, stale reviews dismissed on push, last-push approval required
- **Enforced on admins** — a maintainer cannot bypass it
- **Linear history**, no force-push, no branch deletion, review threads must be resolved

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

It verifies `.nvmrc`, `config/htaccess`, `public/robots.txt` and `public/sitemap.xml` are present; that the three post-build scripts are wired into `npm run build`; that `out/` has at least 100 files; and that `.htaccess` ends up inside the deploy tarball. The equivalent of the full gate suite is `npm run lint && npm run typecheck && npm run build && npm audit --omit=dev --audit-level=high`.

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
Proprietary — © 2026 CITGROUP Dental Studio, all rights reserved. Not open source. Full text in [LICENSE](./LICENSE).

Third-party dependencies remain under their own licenses, recorded in `package-lock.json`.

## Privacy constraints
This site is bound by three privacy constraints, recorded in `LICENSE` because changing any of them changes the site's legal posture. The current implementation is deliberately minimal:

- **No server-side data collection.** The enquiry form composes a message in the visitor's own mail client via `mailto:`. Nothing is transmitted to, received by, or stored on any server. Adding server-side transmission, storage, or logging requires a documented lawful basis.
- **No cookies, no analytics, no tag managers, no session storage.** This is load-bearing: the absence of non-essential cookies is why the site needs no consent banner. Adding any tracking SDK requires a consent mechanism and a privacy policy.
- **Reviews carry first name + neighbourhood only.** Deliberately reduced detail. Do not expand to surnames, full addresses, treatment dates, or anything else that becomes identifying in a small locality.

`public/images/` currently holds generated placeholders, not real patient records. Real patient or clinical photography may only be published with documented written consent specifying scope of use.