set -euo pipefail
# Replicates the "Package the static export" logic from release.yml against a
# real archive, to prove the pipefail/SIGPIPE fix works.
archive="test-release.tar.gz"
tar -czf "$archive" -C out .

listing=$(tar -tzf "$archive")
if ! printf '%s\n' "$listing" | grep -x './\.htaccess' > /dev/null; then
  echo "FAIL: .htaccess missing from the release archive"
  exit 1
fi
echo "  archive: $(du -h "$archive" | cut -f1)"
echo "  files:   $(printf '%s\n' "$listing" | wc -l)"
echo "  .htaccess found via full-listing grep: OK"
rm -f "$archive"
echo "PACKAGING CHECKS PASSED"
