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

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

/**
 * Read `url` and `email` out of the content module without importing it.
 *
 * `src/content/site.ts` is TypeScript and pulls in `./types`, so it cannot be
 * imported by a plain Node script. Parsing the properties is deliberate: this
 * check runs *before* typecheck in some paths, and it must not fail for reasons
 * unrelated to the thing it is checking.
 */
function readSiteProperties() {
  const file = join(root, "src", "content", "site.ts");
  const text = readFileSync(file, "utf8");
  // Anchored and quote-delimited so a match cannot come from the explanatory
  // comment above the property or from a similarly named key.
  const pick = (key, pattern, hint) => {
    const m = text.match(pattern);
    if (!m) {
      console.error(`verify-hosts: could not find \`${key}\` in src/content/site.ts.`);
      console.error(`  ${hint}`);
      process.exit(1);
    }
    return m[1];
  };
  return {
    url: pick(
      "url",
      /^[ \t]*url:[ \t]*"(https?:\/\/[^"]+)"/m,
      "site.url is the single source of truth for the production origin.",
    ).replace(/\/+$/, ""),
    email: pick(
      "email",
      /^[ \t]*email:[ \t]*"([^"]+)"/m,
      "site.email is the contact address the enquiry form sends to.",
    ),
  };
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

const { url: declared, email: declaredEmail } = readSiteProperties();
const failures = [];

// Every email address the site publishes must belong to a domain this site is
// served from. Checking `site.email` alone is not enough: addresses also appear
// in form placeholders, in the JSON-LD emitted from site.ts, and in the licence
// notice shipped at /LICENSE. Each of those is a place a wrong domain can hide.
//
// This is a policy assertion, not a deliverability test: it cannot prove mail
// arrives, and nothing in a static export can. What it catches is the class of
// bug it was written for - a published address on an unrelated domain, which is
// exactly what shipped once. The site is served from
// dental-clinic.cromstelit.com while the address was on the citgroupdental.com
// brand domain, which has no NS, A or MX record at all, so every enquiry the
// form composed was undeliverable. The build was green throughout: TypeScript is
// happy with any string, the page renders, the mailto: link looks fine in the
// source.
//
// A parent domain counts. The site is served from a subdomain
// (dental-clinic.cromstelit.com) but the practice's mailbox is on the apex
// (cromstelit.com), which is the normal arrangement. So an address must be on
// the served host or on one of its ancestors - not merely share a substring.
// "cromstelit.com.example.net" and "notcromstelit.com" both fail.
//
// Placeholders are allowed, but only on TLDs reserved by RFC 2606/6761 that can
// never be registered: .example, .test, .invalid, .localhost, and the
// example.{com,net,org} names. This matters: the enquiry form's placeholder used
// to read "you@email.com", and email.com is a real registrable domain, so it was
// a genuine foreign address rendered into the page.
//
// If the practice later registers the brand domain and wants to use it, this
// check will fail. That is intended - it is a decision to make deliberately,
// and changing it should be a visible edit rather than a quiet drift.
// RFC 2606 / 6761 reserved names. These can never be registered, so an address
// on one is a safe placeholder. Matched as a suffix rather than by equality:
// example.org is reserved, and so is anything under it such as
// legacy.example.org. Equality alone would reject the subdomain form.
const RESERVED_MAIL_NAMES = [
  "example.com",
  "example.net",
  "example.org",
  "example",
  "test",
  "invalid",
  "localhost",
];

const servedHost = new URL(declared).host.replace(/:\d+$/, "");
const host = servedHost.toLowerCase();

// The registrable base of the served host: dental-clinic.cromstelit.com -> cromstelit.com
const ourDomain = host.split(".").slice(-2).join(".");

function isReservedMailDomain(domain) {
  return RESERVED_MAIL_NAMES.some(
    (name) => domain === name || domain.endsWith(`.${name}`),
  );
}

function isAllowedMailDomain(domain) {
  const d = domain.toLowerCase();

  // 1. Our own host, or a parent of it. The practice's mailbox is on the apex
  //    while the site is served from a subdomain, which is the normal shape.
  if (host === d || host.endsWith(`.${d}`)) return true;

  // 2. Anything else that mentions our domain must be rejected, and this has to
  //    be checked BEFORE the reserved-name test.
  //
  //    A naive suffix match is not enough: "cromstelit.com.example.net" ends
  //    with the reserved ".example.net", so a reserved-name check on its own
  //    would wave it through. It is still an attack — a visitor skimming
  //    "hello@cromstelit.com.example.net" reads it as cromstelit.com. This is
  //    the case that was actually wrong in an earlier version of this check,
  //    found by testing rather than by reading.
  if (d.endsWith(`.${ourDomain}`) || d.startsWith(`${ourDomain}.`) || d.includes(`.${ourDomain}.`)) {
    return false;
  }

  // 3. Genuinely reserved placeholders, which can never be registered.
  return isReservedMailDomain(d);
}

const emailDomain = declaredEmail.split("@")[1];
if (!emailDomain) {
  failures.push(`site.email is not an email address: ${declaredEmail}`);
} else if (!isAllowedMailDomain(emailDomain)) {
  failures.push(
    `site.email points at a domain the site is not served from.\n` +
      `      email:     ${declaredEmail}\n` +
      `      served as: ${servedHost}`,
  );
}

// Now sweep every email-shaped string in the files that actually ship, so an
// address cannot hide outside site.ts — in a form placeholder, in the JSON-LD
// that layout.tsx builds from site.email, or in the licence notice served at
// /LICENSE.
//
// The sweep is textual and includes comments, which is deliberate: it means a
// complete address must never be written in a comment either, because the guard
// cannot tell an address in prose from a live one. Comments here name bare
// domains instead.
const SHIPPED_SOURCES = ["src", "public", "LICENSE", "public/LICENSE"];
const EMAIL_SHAPE = /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;
const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|css|txt|xml|svg|html|md|htaccess)$|^LICENSE$/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (TEXT_EXT.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const scanned = [];
for (const target of SHIPPED_SOURCES) {
  const full = join(root, target);
  if (!existsSync(full)) continue;
  if (statSync(full).isDirectory()) scanned.push(...walk(full));
  else scanned.push(full);
}

const foreign = new Map();
for (const file of scanned) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(EMAIL_SHAPE)) {
    const domain = match[1];
    if (isAllowedMailDomain(domain)) continue;
    const rel = file.slice(root.length + 1);
    if (!foreign.has(domain)) foreign.set(domain, new Set());
    foreign.get(domain).add(rel);
  }
}

for (const [domain, files] of [...foreign.entries()].sort()) {
  failures.push(
    `email addresses on a domain the site is not served from: ${domain}\n` +
      `      in: ${[...files].join(", ")}\n` +
      `      served as: ${servedHost} (a parent domain is fine)` +
      `        a placeholder must use a reserved TLD - ` +
      `.example, .test, .invalid, or example.com/net/org`,
  );
}

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
  `verify-hosts: ${declared} consistent across public/robots.txt and public/sitemap.xml (${locs.length} URLs);` +
    ` every published address is on ${servedHost} or a parent domain (${scanned.length} files swept).`,
);
