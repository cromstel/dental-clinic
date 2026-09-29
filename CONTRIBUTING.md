# Contributing

## Workflow

`main` is protected. A direct push is rejected with `GH013` until the required checks have run on that commit, so:

```bash
git switch -c <type>/<short-description>
# ... work ...
bash scripts/simulate-ci.sh          # CI assertions, locally
npm run lint && npm run typecheck && npm run build && npm audit --omit=dev --audit-level=high
git push -u origin <branch>
gh pr create --fill
```

Required checks on `main`: **Lint, Typecheck, Build static export, Dependency audit, Workflow sanity**. All five must pass, plus **1 approving review** with stale reviews dismissed on push. Protection is enforced on admins, so a maintainer cannot merge their own PR unreviewed. Linear history only — no merge commits.

Signed commits are not yet required. If you are asked to enable them, see the "What is not protected" section of `SECURITY.md` for why, and configure signing before doing so — otherwise your own pushes will be rejected.

Worth knowing before it is enabled: GitHub lets you push unsigned commits to a **topic branch** even when the protected branch requires signatures. The rejection happens at merge time, not push time. So enabling it will not block your work immediately — it will block your PR from merging, which is the more confusing failure to debug.

`nvm use` first — Node is pinned in `.nvmrc`.

## Commit style

Conventional Commits, matching the existing history:

```
feat(hero): …
fix(ci): …
chore(deps): …        # Dependabot's prefix for grouped bumps
fix(deps): …          # Dependabot's prefix for security fixes
chore(actions): …     # Dependabot's prefix for action updates
```

## Things that will bite you

**Do not delete the `*.txt` files in `out/`.** They are RSC prefetch payloads, not debug output. The shipped router chunk fetches `<route>/index.txt` and `<route>/__next.<route>.__PAGE__.txt` for client-side navigation. Stripping them degrades every `<Link>` to a full page load. `deploy/README.md` and the build script both say this; `scripts/verify-export.mjs` now fails the build if they are missing.

**Do not delete `public/.htaccess`.** Without it Hostinger serves `.avif` as `text/plain`, the AVIF `<picture>` sources fail to decode, and the browser falls back to WebP. It lives in `public/` so Next copies it into `out/`, which means it travels inside the deploy archive and cannot be lost to a partial upload. Both `stage-server-config.mjs` and `verify-export.mjs` fail the build if it is missing. There is only one copy — an earlier version also had a `config/htaccess` that the staging script copied over the top, and the two silently disagreed.

**Adding a route means touching four places.** `src/app/<route>/page.tsx`, the `ROUTES` array in `scripts/verify-export.mjs`, `public/sitemap.xml`, and the sitemap list in `public/robots.txt` is unchanged but the sitemap must gain the URL. Miss the `ROUTES` entry and the build fails — that is intentional.

**Changing the production host means changing three things together:** `metadataBase` in `src/app/layout.tsx`, `public/robots.txt`, and `public/sitemap.xml`. Canonicals and the sitemap must agree.

**Lint does not cover TypeScript.** `npm run lint` covers the JS build tooling only. `eslint-config-next` cannot load with TypeScript 7 — `typescript-eslint` throws on load. `src/` is guarded by `npm run typecheck` instead. See the note at the top of `eslint.config.mjs` for how to re-enable full TS linting.

## New colour pairs

Check contrast before shipping. The safe pairs are tabulated under **Design tokens** in the README. In short: `ivory` and `gold` are safe on `midnight`; `gold-ink` is the only gold tone safe on `cream`/`paper`; never put gold-family text on the light page body. A focus indicator must clear 3:1 against **both** the cream body and the midnight hero — the current two-tone ring is how that is done.

## Dependency bumps

Dependabot opens grouped PRs weekly and security PRs daily. Nothing auto-merges. Majors for `typescript`, `next`, `react`, `react-dom` are ignored on purpose and need a human — see the commit style above and the linting note for the TypeScript constraint specifically.

## Patient data

Do not commit real patient photography, clinical before/after imagery, surnames, or treatment dates. `public/images/` holds generated placeholders. Reviews carry a first name and neighbourhood only, and that is a deliberate reduction — a dental practice's readership makes fuller combinations identifying. See the privacy constraints in `LICENSE`.
