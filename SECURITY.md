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
| Build pipeline | `npm ci` → `next build` | Runs in CI on ephemeral runners with no secrets on `main`-bound jobs |
| Deploy | SFTP upload, `workflow_dispatch` only | The one job holding credentials |

There is **no authentication layer to bypass** because there are no accounts. There is **no cookie** because there is nothing to track — see the privacy constraints below.

## Privacy constraints

These are load-bearing and recorded in `LICENSE`. Changing any of them changes the site's legal posture, not just its behaviour.

1. **No server-side data collection.** The enquiry form is `mailto:`-based. Adding server-side transmission, storage, or logging of enquiry data requires a documented lawful basis first.
2. **No cookies, no analytics, no tag managers, no session storage.** This is why the site needs no consent banner. Adding any tracking SDK requires a consent mechanism and a privacy policy.
3. **Reviews carry a first name and neighbourhood only.** Do not expand to surnames, full addresses, or treatment dates.

## Automated checks

| Check | Workflow | When | Blocking |
|---|---|---|---|
| Dependency audit | `ci.yml` | every push + PR | Yes, high/critical in production deps |
| CodeQL `security-extended` | `codeql.yml` | push to `main`, every PR, weekly, manual | Yes |
| Dependabot security updates | `.github/dependabot.yml` | daily, unbatched | Opens a PR |
| Automated security fixes | repository setting | on advisory | Applies a fix PR automatically |

CodeQL currently reports **zero open alerts**. The previous two — `js/log-injection` in the image pipeline — were fixed by removing externally-derived values from log lines rather than by wrapping them in a hand-rolled sanitizer, which the taint model does not accept.

## Secrets

The only secrets in this repository are the five `HOSTINGER_SFTP_*` values, used by `deploy.yml`. They are repository secrets, never committed, never available to PR-triggered runs (which run from forks with a read-only token by default).

`deploy.yml` is **`workflow_dispatch` only, never push-triggered**, and requires the literal string `DEPLOY` as confirmation. A deploy replaces production and the `.htaccess` is load-bearing, so it is deliberately a human action rather than something a push can cause.

## What is not protected

The repository is **public**. `LICENSE` is proprietary/all-rights-reserved, but a licence asserts rights rather than enforcing them — the source is readable and clonable by anyone. There is no patient data in the repository to leak, but if that changes, assume it is public unless visibility changes first.

Branch protection requires the five CI checks and blocks deletion and force-push, but does not require a human review — a maintainer with write access can merge once checks are green. Add a required review if that is not the intent.
