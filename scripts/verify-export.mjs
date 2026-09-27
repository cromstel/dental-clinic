// Post-build gate: assert the static export is actually deployable.
//
// `next build` exiting 0 is not proof of a working site. Three classes of silent
// breakage have shipped from this exact build before, and none of them fail the
// compiler:
//
//   1. The RSC prefetch payloads in wrong filenames (see rsc-payload-fix.mjs) —
//      every cross-route prefetch 404s, soft navigation silently degrades.
//   2. A missing .htaccess — .avif served as text/plain, `<picture>` falls back.
//   3. A route dropped from sitemap.xml or robots.txt missing — pages go
//      unindexed with no error anywhere.
//
// This runs last in the `build` script and exits non-zero on any failure, so CI
// and the deploy workflow both stop before a broken artifact can be published.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outDir = join(root, "out");
const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

if (!existsSync(outDir)) {
  console.error("verify-export: no out/ directory found.");
  process.exit(1);
}

/** Every route Next exports. Keep in sync with src/app/ + the RSC payload fix. */
const ROUTES = ["", "about", "contact", "dentists", "faq", "invisalign", "services"];

const isFile = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

// 1. Every route has an index.html
for (const route of ROUTES) {
  const html = join(outDir, route, "index.html");
  if (!isFile(html)) {
    fail(`missing route HTML: ${route ? `${route}/` : "home"}index.html`);
  }
}

if (!isFile(join(outDir, "404.html"))) {
  fail("missing 404.html — unknown URLs would return the host's default error page");
}
if (!isFile(join(outDir, "favicon.svg"))) {
  fail("missing favicon.svg");
}

// 2. RSC prefetch payloads, in the dot-form filenames the client router fetches.
//
// The router requests `<route>/index.txt` for the root and
// `<route>/__next.<route>.__PAGE__.txt` for each subroute. If the fix script
// regresses, the slash-form directories come back and every prefetch 404s.
for (const route of ROUTES) {
  const dir = join(outDir, route);
  if (!existsSync(dir)) continue;

  const indexTxt = join(dir, "index.txt");
  if (!isFile(indexTxt)) {
    fail(`missing RSC payload: ${route ? `${route}/` : ""}index.txt`);
  }

  // Leftover slash-form directories are the exact signature of the bug this
  // script exists to prevent.
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("__next.")) {
      fail(
        `stale RSC payload directory still present: ${relative(outDir, join(dir, entry.name))}/ — ` +
          `scripts/rsc-payload-fix.mjs did not normalize it`
      );
    }
  }

  if (route) {
    const expected = join(dir, `__next.${route}.__PAGE__.txt`);
    if (!isFile(expected)) {
      fail(`missing RSC payload: ${route}/__next.${route}.__PAGE__.txt`);
    }
  }
}

for (const root4 of ["__next._tree.txt", "__next._index.txt", "__next.__PAGE__.txt"]) {
  if (!isFile(join(outDir, root4))) {
    fail(`missing root RSC payload: ${root4}`);
  }
}

// 3. Server config staged (load-bearing: AVIF/WebP MIME + immutable caching)
if (!isFile(join(outDir, ".htaccess"))) {
  fail("missing out/.htaccess — .avif would be served as text/plain (run scripts/stage-server-config.mjs)");
}

// 4. SEO files present and consistent with the routed pages
const robotsPath = join(outDir, "robots.txt");
const sitemapPath = join(outDir, "sitemap.xml");

if (!isFile(robotsPath)) {
  fail("missing out/robots.txt");
} else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/^Sitemap:/m.test(robots)) {
    fail("robots.txt has no Sitemap: directive");
  }
}

if (!isFile(sitemapPath)) {
  fail("missing out/sitemap.xml");
} else {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const route of ROUTES) {
    const slug = route ? `${route}/` : "";
    // The bare origin + "/" form and the full form both count; we only assert the
    // path appears, not the exact origin, so a domain change is not a build break.
    if (!sitemap.includes(`/${slug}`.replace(/\/\//g, "/"))) {
      fail(`sitemap.xml does not list route: /${slug}`);
    }
  }
}

// 5. Asset pipeline sanity: images must be referenced in a modern format.
// (MIME correctness itself is the server's job, asserted by the .htaccess check
// above; this only catches a regression to .jpg in source.)
const imagesDir = join(outDir, "images");
if (existsSync(imagesDir)) {
  let modern = 0;
  let legacy = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(avif|webp|jpg|jpeg|png|svg)$/i.test(entry.name)) {
        if (/\.(avif|webp)$/i.test(entry.name)) modern++;
        else legacy++;
      }
    }
  };
  walk(imagesDir);
  if (modern === 0) {
    fail("no AVIF/WebP assets in out/images — the responsive-image pipeline regressed");
  } else if (legacy > 0) {
    warn(`${legacy} legacy image(s) in out/images alongside ${modern} modern — verify none are referenced`);
  }
}

// 6. No source or dependency leakage into the publishable output.
for (const forbidden of [".env", "package.json", "node_modules", "next.config.mjs"]) {
  if (existsSync(join(outDir, forbidden))) {
    fail(`out/${forbidden} must not be published`);
  }
}

// Report
console.log("verify-export: checking static export…");
for (const w of warnings) console.warn(`verify-export: WARNING: ${w}`);

if (errors.length > 0) {
  console.error(`verify-export: FAILED with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `verify-export: OK — ${ROUTES.length} routes, RSC payloads normalized, ` +
    `.htaccess staged, robots.txt + sitemap.xml consistent.`
);
