# Security

Report a vulnerability privately via GitHub's security advisory form rather than a public issue:
**Security → Report a vulnerability**. Do not open a public issue for an exploitable finding.

## Threat model

This is a **fully static site with no server-side code**. There is no database, no authentication, no API route, no Server Action, and no Node runtime in production. That eliminates the entire class of server-side vulnerabilities — injection, auth bypass, IDOR, deserialisation — by construction rather than by mitigation.

The actual attack surface is:

| Surface | What it is | Notes |
|---|---|---|
| Static HTML/CSS/JS | The whole product | Served as files; no execution server-side |
| `mailto:` enquiry form | The only form on the site | Composes in the visitor's own mail client. Nothing is transmitted to or stored on any server |
| Host config | `public/.htaccess` | LiteSpeed directives, shipped inside the deploy archive, reviewed in diffs |
| Build pipeline | `npm ci` → `next build` | Runs in CI on ephemeral runners; no job triggered by a pull request has access to secrets |
| Deploy | Hostinger API archive upload, `workflow_dispatch` only | The only job holding a credential |

There is **no authentication layer to bypass** because there are no accounts. There is **no cookie** because there is nothing to track — see the privacy constraints below.

## Privacy constraints

These are load-bearing and recorded in `LICENSE`. Changing any of them changes the site's legal posture, not just its behaviour.

1. **No server-side data collection.** The enquiry form is `mailto:`-based. Adding server-side transmission, storage, or logging of enquiry data requires a documented lawful basis first.
2. **No cookies, no analytics, no tag managers, no session storage.** This is why the site needs no consent banner. Adding any tracking SDK requires a consent mechanism and a privacy policy.
3. **Reviews carry a first name and neighbourhood only.** Do not expand to surnames, full addresses, or treatment dates.

## Automated checks

| Check | Workflow | When | Blocking |
|---|---|---|---|
| Dependency audit | `ci.yml` | every push + PR | Yes — high/critical in production deps |
| CodeQL `security-extended` | `codeql.yml` | push to `main`, every PR, weekly, manual | Yes |
| Export assertions | `scripts/verify-export.mjs` via the `build` job | every push + PR | Yes |
| Guards | `ci.yml` | every push + PR | Yes |
| Dependabot security updates | `.github/dependabot.yml` | daily, unbatched | Opens a PR |
| Automated security fixes | repository setting | on advisory | Applies a fix PR automatically |

CodeQL reports **zero open alerts**. The previous two — `js/log-injection` in the image pipeline — were fixed by removing externally-derived values from log lines rather than wrapping them in a hand-rolled sanitizer, which the taint model does not accept.

## Branch protection

`main` is protected by the automated gates:

- **Required status checks:** Lint, Typecheck, Build static export, Dependency audit, Workflow sanity — all must pass, and `strict` is on, so a push must be up to date with `main` first
- **Enforced on admins** — protection cannot be bypassed by a maintainer
- **Required linear history** — no merge commits
- **Branch deletion and force-pushes blocked**

Direct pushes to `main` are rejected; branch → PR is the only path, and it merges once the five checks are green.

**No human approval is required.** This was set deliberately: a single-maintainer repository cannot satisfy a one-approval rule, because the author is the only person who can approve, and GitHub blocks self-approval. The rule was therefore a permanent blocker rather than a control. Automated review still happens — CodeRabbit runs on every PR, and Dependabot opens security-fix PRs — but nothing *blocks* on it.

What this trades away: a compromised maintainer token, or a mistaken push, reaches `main` once CI is green without a second pair of eyes. The five checks are the mitigation, and they do cover build breakage, type errors, lint, a broken static export, and known CVEs. They do not cover a subtle logic change or a malicious one. Re-enabling review when a second maintainer exists is the natural fix.

## Secrets

The only secret is `HOSTINGER_API_TOKEN`, used exclusively by `deploy.yml`. Verified: no credential value appears anywhere in the repository or its history.

It replaced five `HOSTINGER_SFTP_*` values. What actually changed, stated precisely rather than favourably:

- **Fewer credentials.** Five long-lived SFTP secrets became one API token. That is a real reduction in the number of secrets to store, rotate and leak.
- **But not a narrower blast radius, on current evidence.** `HOSTINGER_API_TOKEN` authorises three things in this workflow: issuing a pre-signed upload URL, **replacing the site's entire root**, and **clearing its cache**. Only the *pre-signed upload URL* is scoped to a single file — that scoping belongs to the URL, not to the token. Anyone holding the token can replace production directly. Do not read "one scoped credential" as "limited authority"; the token is a full deploy credential for this account, and the precise scope is a property of Hostinger's token permissions that has not been independently confirmed.
- **No credential reuse.** The old cache-clear step authenticated to the LiteSpeed purge endpoint as user `cache` using the **SFTP password** — a credential doing double duty for a service it was never issued for. Cache clearing now goes through the API token.

The account username and site domain are deliberately *not* secrets; they sit in the workflow's `env` block.

The workflow treats the pre-signed upload credentials as secrets too: they are registered with `::add-mask::` *before* being written to `$GITHUB_OUTPUT`, and the upload destination returned by the API is checked against Hostinger's own file-store domains before either key is sent to it. Without the second check, a redirect or a hostile response would harvest working upload credentials.

`deploy.yml` is **`workflow_dispatch` only, never push-triggered**, and requires the literal string `DEPLOY` as confirmation. It runs against a `production` environment. It is also the only workflow with a `production` environment, and the only one that can reach a secret.

No workflow uses a high-risk trigger. Specifically absent: `pull_request_target`, `workflow_run`, and `issue_comment` — all of which execute with repository credentials in ways a fork can influence. Every pull-request-triggered job here runs read-only.

The audit job is a separate concern from supply chain: `npm ci` installs from the committed lockfile, and Dependabot is what moves that lockfile. `npm audit` reports known vulnerabilities and CodeQL reports findings matched by its configured queries; neither guarantees detection of every compromised dependency, and neither addresses a package that is malicious without being listed in an advisory.

## What is not protected

**The repository is public.** `LICENSE` is proprietary/all-rights-reserved, but a licence asserts rights rather than enforcing them — the source is readable and clonable by anyone. This was a deliberate trade to obtain branch protection and code scanning, which are plan-gated on private repositories. There is no patient data in the repository to leak. If that ever changes, assume it is public until visibility changes first.

**The `production` environment has no required reviewers.** Anyone with write access can approve and trigger a deploy. For a single-maintainer repository that is the intent, not an oversight; if a second maintainer is added, add a required reviewer to the environment at that point.

**A compromised maintainer account can still push through.** Branch protection requires a review, but nothing verifies *who* made the commits. Two separate controls close this:

- **Signed commits** — *Require signed commits* in branch protection (or a `required_signatures` rule in a ruleset). This rejects unsigned commits at the branch, so a stolen token alone is not enough. It is currently off, because enforcing it would lock out every contributor who has not configured commit signing.
- **Two-factor authentication** — enforced per account or at the organisation level, not per repository. 2FA materially reduces password-only account takeover, but it does not prevent phishing of TOTP or SMS codes, and it does not revoke tokens that already exist. Phishing-resistant factors (hardware security keys, passkeys) and short-lived, narrowly scoped tokens are the stronger controls here.

Turning signed commits on is the stronger control and costs nothing once every contributor signs. Add a second maintainer, or decide the trade is worth making, and enable it.
