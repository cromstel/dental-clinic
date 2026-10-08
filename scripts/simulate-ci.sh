#!/usr/bin/env bash
# Local simulation of the `guards` job in .github/workflows/ci.yml.
# Runs on Git Bash, WSL, Linux or macOS — it resolves its own location rather
# than assuming a checkout path.
set -e
cd "$(dirname "$0")/.."

echo "--- step: assert critical build inputs are tracked ---"
for f in .nvmrc public/.htaccess public/robots.txt public/sitemap.xml; do
  if [ ! -f "$f" ]; then
    echo "::error::required file missing: $f"
    exit 1
  fi
  echo "  present: $f"
done

echo "--- step: assert build scripts are wired into npm run build ---"
scripts=$(node -p "require('./package.json').scripts.build")
echo "  build = $scripts"

# The guard list is READ OUT OF ci.yml rather than copied here.
#
# An earlier version of this file carried its own copy and its own warning that the
# two "must stay in step". They were not in step: it asserted 4 of the scripts CI
# asserts, so six guards could be unwired locally and the simulation still passed --
# which is the exact failure the comment described, already realised. A duplicated
# list with a comment asking people to keep it updated is not a mechanism.
#
# `tr -d '\r'` because the working tree is CRLF, and without it `do$` never matches
# and the list reads as empty -- a silent pass with a scary-looking empty line.
ci_yml=".github/workflows/ci.yml"
if [ ! -f "$ci_yml" ]; then
  echo "::error::$ci_yml missing; cannot verify wiring"
  exit 1
fi
list=$(tr -d '\r' < "$ci_yml" | sed -n 's/^ *for s in \(.*\); do$/\1/p' | head -n 1)
if [ -z "$list" ]; then
  echo "::error::could not read the guard list from $ci_yml -- has the line been reworded?"
  exit 1
fi
# `grep -c .` always PRINTS a number — 0 when nothing matches — and a command
# substitution containing "0" is not empty, so `[ -z ... ]` could never be true and
# this check had never fired. Reported in review, and it was right: the case it was
# written for is `for s in  ; do`, where the capture is whitespace only, non-empty,
# and skips the first test above — so the loop would run zero times and the
# simulation would pass without checking a single guard. That is the silent pass the
# comment at line 29 describes, arriving through the check meant to catch it.
#
# Compare the count to zero. `|| true` because `set -e` is on and `grep -c` exits 1
# when the count is 0, which would abort before printing the reason.
count=$(echo "$list" | tr -s ' ' '\n' | grep -c . || true)
if [ "$count" -eq 0 ]; then
  echo "::error::guard list from $ci_yml is blank — has the line been reworded?"
  exit 1
fi
echo "  guard list (from ci.yml): $list ($count guard(s))"
for s in $list; do
  case "$scripts" in
    *"$s"*) echo "  wired: $s" ;;
    *) echo "::error::build script not wired into npm run build: $s"; exit 1 ;;
  esac
done

echo "--- step: check declared origin matches static files ---"
node scripts/verify-hosts.mjs

# Mirrors the ci.yml step of the same name, which runs these three before the slow
# build because each reads only committed files and fails in seconds.
echo "--- step: check palette contrast and documentation drift ---"
node scripts/verify-contrast.mjs
node scripts/verify-docs.mjs

echo "--- step: confirm export is non-trivial ---"
count=$(find out -type f | wc -l)
echo "out/ contains $count files"
if [ "$count" -lt 100 ]; then
  echo "::error::out/ has only $count files; the static export is incomplete"
  exit 1
fi

echo "--- step: package export as a tarball (release job) ---"
# Mirrors release.yml: the listing is consumed in full rather than piped to
# `grep -q`, which under `set -o pipefail` would exit early, SIGPIPE tar, and
# fail the step even though the archive is fine.
rm -f export.tar.gz
tar -czf export.tar.gz -C out .
listing=$(tar -tzf export.tar.gz)
echo "  archive: $(du -h export.tar.gz | cut -f1)"
echo "  files:   $(printf '%s\n' "$listing" | wc -l)"
if ! printf '%s\n' "$listing" | grep -x './\.htaccess' > /dev/null; then
  echo "::error::.htaccess missing from archive"
  exit 1
fi
echo "  .htaccess present in archive"
rm -f export.tar.gz

echo
echo "ALL WORKFLOW STEPS SIMULATED SUCCESSFULLY"
