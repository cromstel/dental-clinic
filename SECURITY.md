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
| Host config | `config/htaccess` | LiteSpeed directives, fully tracked, reviewed in diffs |
| Build pipeline | `npm ci` → `next build` | Runs in CI on ephemeral runners; no job triggered by a pull request has access to secrets |
| Deploy | SFTP upload, `workflow_dispatch` only | The only job holding credentials |

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

`main` carries full branch protection:

- **Required status checks:** Lint, Typecheck, Build static export, Dependency audit, Workflow sanity
- **Required pull request review:** 1 approving review, with stale reviews dismissed on push and last-push approval required — a contributor cannot approve their own PR
- **Enforced on admins** — protection cannot be bypassed by a maintainer
- **Required linear history** — no merge commits
- **Conversation resolution required** — all review threads must be closed
- **Branch deletion and force-pushes blocked**

Direct pushes to `main` are rejected. Branch → PR is the only path.

## Secrets

The only secrets are the five `HOSTINGER_SFTP_*` values, used exclusively by `deploy.yml`. Verified: no credential value appears anywhere in the repository or its history.

`deploy.yml` is **`workflow_dispatch` only, never push-triggered**, and requires the literal string `DEPLOY` as confirmation. It runs against a `production` environment. It is also the only workflow with a `production` environment, and the only one that can reach a secret.

No workflow uses a high-risk trigger. Specifically absent: `pull_request_target`, `workflow_run`, and `issue_comment` — all of which execute with repository credentials in ways a fork can influence. Every pull-request-triggered job here runs read-only.

The audit job is a separate concern from supply chain: `npm ci` installs from the committed lockfile, and Dependabot is what moves that lockfile. A compromised dependency is caught by `npm audit` and CodeQL, not by these two settings.

## What is not protected

**The repository is public.** `LICENSE` is proprietary/all-rights-reserved, but a licence asserts rights rather than enforcing them — the source is readable and clonable by anyone. This was a deliberate trade to obtain branch protection and code scanning, which are plan-gated on private repositories. There is no patient data in the repository to leak. If that ever changes, assume it is public until visibility changes first.

**The `production` environment has no required reviewers.** Anyone with write access can approve and trigger a deploy. For a single-maintainer repository that is the intent, not an oversight; if a second maintainer is added, add a required reviewer to the environment at that point.

**A compromised maintainer account can still push through.** Branch protection requires a review, but there is no 2FA enforcement or signed-commit requirement. Both are account-level settings, not repository settings, and must be configured on the user or org.
