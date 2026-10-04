// Post-build check: assert the host config and the licence notice actually
// reached the export, byte for byte.
//
// `.htaccess`
// -----------
// `next build` with `output: "export"` copies `public/` into `out/`, so
// `public/.htaccess` lands at `out/.htaccess` on its own. Nothing is copied for
// this file — an earlier version staged a separate `config/htaccess` over the
// top, which meant two sources of truth and a staged copy that silently
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
//
// `LICENSE`
// ---------
// Staged here, from the repository root, because a licence belongs at the root
// where GitHub and package tooling expect it — not under `public/`.
//
// There used to be two copies: `LICENSE` and `public/LICENSE`. They disagreed.
// One said "CITGROUP Dental Studio" and the other "CITGROUP", and the published
// copy carried the *previous* practice's postal address — 142 West 21st Street,
// New York — which was being served live at /LICENSE for an Accra practice. The
// drift was invisible because nothing compared them.
//
// `public/LICENSE` is gone. This copies the root file into the export and
// asserts the result is byte-identical, so there is one source and one
// artefact, and a failure to copy is a failed build rather than a stale notice.

import { copyFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "public", ".htaccess");
const staged = join(root, "out", ".htaccess");

const licenceSource = join(root, "LICENSE");
const licenceStaged = join(root, "out", "LICENSE");

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
  // Anchored to the start of a line, so a commented-out
  // `# AddType image/avif .avif` does NOT satisfy the check. The previous
  // `text.includes(needle)` form matched commented lines too, which meant the
  // build could publish an export whose AVIF handling was entirely inert.
  // `m` makes ^ and $ match per line; a trailing comment is not allowed so the
  // directive stays unambiguous.
  const required = [
    [/^[ \t]*AddType[ \t]+image\/avif[ \t]+\.avif[ \t]*$/m, "AVIF MIME type"],
    [/^[ \t]*AddType[ \t]+image\/webp[ \t]+\.webp[ \t]*$/m, "WebP MIME type"],
  ];
  const missing = required.filter(([directive]) => !directive.test(text));
  if (missing.length) {
    console.error("stage-server-config: out/.htaccess is missing active MIME directives:");
    for (const [, label] of missing) console.error(`  - ${label}`);
    console.error("  (a commented-out line does not count; these must be live directives)");
    process.exit(1);
  }

  const size = statSync(staged).size;
  console.log(`stage-server-config: out/.htaccess present (${size} B), MIME rules intact.`);
} catch (err) {
  console.error(`stage-server-config: FAILED to verify out/.htaccess: ${err.message}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ licence */

// The published notice is what a visitor reads to learn who owns the site. A
// stale one is a real defect, not a cosmetic one.
if (!existsSync(licenceSource)) {
  console.error("stage-server-config: LICENSE is missing from the repository root.");
  process.exit(1);
}

// Guard against the drift that caused this in the first place: a second copy
// reappearing under public/ would be picked up by `next build` and land in the
// export next to the one staged here.
if (existsSync(join(root, "public", "LICENSE"))) {
  console.error("stage-server-config: public/LICENSE exists again.");
  console.error("  There is one licence, at the repository root, and this script stages it.");
  console.error("  Two copies is what let them disagree — delete public/LICENSE.");
  process.exit(1);
}

try {
  copyFileSync(licenceSource, licenceStaged);

  const original = readFileSync(licenceSource);
  const published = readFileSync(licenceStaged);
  if (!original.equals(published)) {
    console.error("stage-server-config: out/LICENSE is not byte-identical to LICENSE.");
    console.error("  The notice visitors read must be the same text this repository carries.");
    process.exit(1);
  }

  const text = published.toString("utf8");

  /**
   * Retired identity, asserted absent from the published notice.
   *
   * `CITGROUP` on its own is correct — it is the legal entity — so it is not on
   * this list. The trading name "Accra Dental Clinic" replaced "CITGROUP Dental
   * Studio", and the previous practice's address has no business being published
   * for an Accra clinic.
   *
   * This is the check that would have caught the live notice carrying
   * "142 West 21st Street, New York, NY 10011".
   */
  const retired = [
    ["CITGROUP Dental Studio", "the retired trading name"],
    ["142 West 21st Street", "the previous practice's address"],
    ["Manhattan", "the previous practice's city"],
    ["New York", "the previous practice's state"],
    ["212", "the previous practice's area code"],
    ["src/content/site.ts", "a retired module path"],
  ];
  const found = retired.filter(([needle]) => text.includes(needle));
  if (found.length) {
    console.error("stage-server-config: out/LICENSE carries retired identity:");
    for (const [, why] of found) console.error(`  - ${why}`);
    console.error("  Fix LICENSE. This text is served to the public at /LICENSE.");
    process.exit(1);
  }

  // And the current identity must actually be there, or the checks above pass
  // on an emptied file.
  const required = [
    [/^CITGROUP — All Rights Reserved$/m, "CITGROUP as copyright holder"],
    [/18 Boundary Road, Osu, Accra, Ghana/, "the practice address"],
    [/hello@cromstelit\.com/, "a contact address"],
    [/SPDX-License-Identifier: UNLICENSED/, "the SPDX identifier"],
  ];
  const missing = required.filter(([re]) => !re.test(text));
  if (missing.length) {
    console.error("stage-server-config: out/LICENSE is missing required content:");
    for (const [, label] of missing) console.error(`  - ${label}`);
    process.exit(1);
  }

  console.log(
    `stage-server-config: out/LICENSE staged (${statSync(licenceStaged).size} B), identity current.`,
  );
} catch (err) {
  console.error(`stage-server-config: FAILED to stage out/LICENSE: ${err.message}`);
  process.exit(1);
}
