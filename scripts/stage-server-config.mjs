// Post-build step: stage server config that the static export cannot produce.
//
// `next build` with `output: "export"` has no knowledge of the host, so it copies
// only `public/` into `out/`. The Hostinger/LiteSpeed `.htaccess` therefore never
// reaches the server on its own — and without it Hostinger serves `.avif` as
// `text/plain`, which breaks every `<picture>` source in the site.
//
// This copies `config/htaccess` to `out/.htaccess` so a plain `out/` upload is
// genuinely sufficient. `config/htaccess` is the single source of truth; the copy
// in `out/` is build output and is gitignored with the rest of `out/`.
//
// It lives in `config/` rather than `deploy/` because the whole `deploy/` folder
// is gitignored — it holds only generated deploy artifacts. This file is not a
// generated artifact: nothing else in the repo can produce it.
//
// Runs after `scripts/rsc-payload-fix.mjs`. Fails the build if the source file is
// missing, because shipping without it silently regresses image rendering.

import { copyFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "config", "htaccess");
const target = join(root, "out", ".htaccess");

if (!existsSync(source)) {
  console.error("stage-server-config: config/htaccess is missing.");
  console.error("  This file is load-bearing — without it .avif is served as text/plain.");
  console.error("  Restore it from version control; it must not be deleted.");
  process.exit(1);
}

if (!existsSync(join(root, "out"))) {
  console.error("stage-server-config: no out/ directory found; run `next build` first.");
  process.exit(1);
}

try {
  copyFileSync(source, target);
  const size = statSync(target).size;
  console.log(`stage-server-config: config/htaccess -> out/.htaccess (${size} B)`);
} catch (err) {
  console.error(`stage-server-config: FAILED to stage out/.htaccess: ${err.message}`);
  process.exit(1);
}
