#!/usr/bin/env bash
# Local simulation of the `guards` job in .github/workflows/ci.yml.
# Run with Git Bash on Windows, or bash on Linux/macOS.
set -e
cd /c/projects/dental-clinic 2>/dev/null || cd "$(dirname "$0")/.."

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
for s in rsc-payload-fix stage-server-config verify-export; do
  case "$scripts" in
    *"$s"*) echo "  wired: $s" ;;
    *) echo "::error::build script not wired into npm run build: $s"; exit 1 ;;
  esac
done

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
