// Post-build check: assert the host config actually reached the export.
//
// `next build` with `output: "export"` copies `public/` into `out/`, so
// `public/.htaccess` lands at `out/.htaccess` on its own. This script no longer
// copies anything — an earlier version staged a separate `config/htaccess` over
// the top, which meant two sources of truth and a staged copy that silently
// overwrote the intended cache policy.
//
// The check stays because the failure is silent and serious: without the file,
// LiteSpeed serves `.avif` as `text/plain`, browsers refuse to decode the
// images, and every `<picture>` source falls back or fails. Nothing in the build
// errors, and nothing in the browser reports it clearly.
//
// It also asserts the two MIME declarations survive, because a `public/.htaccess`
// that is present but has lost its `AddType` lines is the same outage with a
// more convincing looking file.

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "public", ".htaccess");
const staged = join(root, "out", ".htaccess");

if (!existsSync(join(root, "out"))) {
  console.error("stage-server-config: no out/ directory found; run `next build` first.");
  process.exit(1);
}

if (!existsSync(source)) {
  console.error("stage-server-config: public/.htaccess is missing.");
  console.error("  This file is load-bearing — without it .avif is served as text/plain.");
  console.error("  Restore it from version control; it must not be deleted.");
  process.exit(1);
}

if (!existsSync(staged)) {
  console.error("stage-server-config: out/.htaccess is missing.");
  console.error("  Next should have copied public/.htaccess into out/. A dotfile that did not");
  console.error("  get copied means the export will deploy without its host config.");
  process.exit(1);
}

try {
  const text = readFileSync(staged, "utf8");
  const required = [
    ["AddType image/avif .avif", "AVIF MIME type"],
    ["AddType image/webp .webp", "WebP MIME type"],
  ];
  const missing = required.filter(([needle]) => !text.includes(needle));
  if (missing.length) {
    console.error("stage-server-config: out/.htaccess is missing required directives:");
    for (const [, label] of missing) console.error(`  - ${label}`);
    process.exit(1);
  }

  const size = statSync(staged).size;
  console.log(`stage-server-config: out/.htaccess present (${size} B), MIME rules intact.`);
} catch (err) {
  console.error(`stage-server-config: FAILED to verify out/.htaccess: ${err.message}`);
  process.exit(1);
}
