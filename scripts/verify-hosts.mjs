// Cross-check the declared production origin against every static copy of it.
//
// `site.url` in `src/content/site.ts` is the single source of truth for code:
// `metadataBase`, canonical URLs and og:url all derive from it, so a change
// there propagates on its own.
//
// Two files cannot import it, because `public/` is copied verbatim by
// `next build` and is never executed:
//
//   public/robots.txt    - the Sitemap: line
//   public/sitemap.xml   - every <loc>
//
// Those are hand-maintained strings. If the site moves and only `site.url` is
// updated, the build succeeds, the site serves fine, and search engines are
// quietly pointed at the old host: canonicals disagree with the sitemap,
// `robots.txt` advertises a sitemap URL that no longer resolves, and submitted
// URLs 404. Nothing errors. It fails months later, in traffic.
//
// So this script fails the build on drift instead. It also checks the reverse
// direction — an origin appearing in a static file that `site.url` does not
// declare — because that is how the wrong-host bug in the enquiry email
// happened: a hard-coded domain from a different environment.
//
// Run standalone (`node scripts/verify-hosts.mjs`) or as part of the build.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

/**
 * Read `site.url` out of the content module without importing it.
 *
 * `src/content/site.ts` is TypeScript and pulls in `./types`, so it cannot be
 * imported by a plain Node script. Parsing the one property is deliberate: this
 * check runs *before* typecheck in some paths, and it must not fail for reasons
 * unrelated to the thing it is checking.
 */
function readDeclaredOrigin() {
  const file = join(root, "src", "content", "site.ts");
  const text = readFileSync(file, "utf8");
  // Anchored and quote-delimited so it cannot match the comment above the
  // property or a similarly named key.
  const match = text.match(/^[ \t]*url:[ \t]*"(https?:\/\/[^"]+)"/m);
  if (!match) {
    console.error("verify-hosts: could not find a `url: \"https://…\"` property in src/content/site.ts.");
    console.error("  site.url is the single source of truth for the production origin.");
    console.error("  Add it back — other checks depend on it existing.");
    process.exit(1);
  }
  return match[1].replace(/\/+$/, "");
}

/** Every distinct absolute origin that looks like a real site URL. */
function originsIn(text) {
  // XML namespace and schema URIs are identifiers, not destinations. They are
  // required in a valid sitemap and must not be mistaken for a mis-hosted URL:
  //   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  //   xsi:schemaLocation="... http://www.sitemaps.org/..."
  // Remove the declarations before scanning, or the check rejects every
  // standards-compliant sitemap.
  const withoutNamespaces = text.replace(
    /(?:\bxmlns(:\w+)?|\bxsi:schemaLocation)\s*=\s*"[^"]*"/g,
    "",
  );

  const found = new Set();
  // Match an origin plus optional port, not a bare hostname: we are checking
  // web origins, and mailto:/tel: and bare hosts in prose are not ours to police.
  for (const m of withoutNamespaces.matchAll(/https?:\/\/[A-Za-z0-9.-]+(?::\d+)?/g)) {
    found.add(m[0].replace(/\/+$/, ""));
  }
  return found;
}

const declared = readDeclaredOrigin();
const failures = [];

const targets = [
  { path: join("public", "robots.txt"), label: "public/robots.txt" },
  { path: join("public", "sitemap.xml"), label: "public/sitemap.xml" },
];

for (const { path, label } of targets) {
  const text = readFileSync(join(root, path), "utf8");
  const origins = originsIn(text);

  if (!origins.has(declared)) {
    failures.push(
      `${label} does not mention the declared origin.\n` +
        `      declared: ${declared}\n` +
        `      found:    ${[...origins].join(", ") || "(none)"}`,
    );
  }

  for (const origin of origins) {
    if (origin !== declared) {
      failures.push(
        `${label} references an origin the site does not declare.\n` +
          `      stray:    ${origin}\n` +
          `      declared: ${declared}`,
      );
    }
  }
}

// The robots.txt Sitemap: line must resolve to a file that exists in the export.
// A stale sitemap path is a 404 in the file crawlers read first.
const robots = readFileSync(join(root, "public", "robots.txt"), "utf8");
const sitemapLine = robots.match(/^[ \t]*Sitemap:[ \t]*(\S+)[ \t]*$/m);
if (!sitemapLine) {
  failures.push("public/robots.txt has no `Sitemap: <url>` line.");
} else if (sitemapLine[1] !== `${declared}/sitemap.xml`) {
  failures.push(
    `public/robots.txt advertises the wrong sitemap URL.\n` +
      `      declared: ${declared}/sitemap.xml\n` +
      `      found:    ${sitemapLine[1]}`,
  );
}

// Every <loc> in the sitemap must use the declared origin, and trailing-slash
// shape must match the router so canonical and sitemap URLs are the same URL and
// not a redirect apart. /invisalign is the only route without a trailing slash
// requirement of its own, so accept both shapes rather than encode a guess.
const sitemap = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>[ \t]*([^<]+?)[ \t]*<\/loc>/g)].map((m) => m[1]);
if (!locs.length) {
  failures.push("public/sitemap.xml has no <loc> entries.");
}
for (const loc of locs) {
  if (!loc.startsWith(`${declared}/`)) {
    failures.push(`public/sitemap.xml <loc> is not under the declared origin: ${loc}`);
  }
}

if (failures.length) {
  console.error(`verify-hosts: FAILED — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("  Fix the static files to match src/content/site.ts `url`, or update both.");
  process.exit(1);
}

console.log(
  `verify-hosts: ${declared} consistent across public/robots.txt and public/sitemap.xml (${locs.length} URLs).`,
);
