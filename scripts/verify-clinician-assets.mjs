// Assert every clinician's image assets exist under the clinician's own slug.
//
// WHY THIS EXISTS
// ---------------
// The rebrand renamed two clinicians but left the image paths pointing at the
// previous practice's files: `/images/doctors/olivia.avif` rendered behind
// Dr. Ama Serwaa Boateng, and `ethan.avif` behind Dr. Kwesi Mensah. Nothing
// failed. Alt text is built from `name` and `role`, so screen readers and search
// engines got the right names, and the images were the only records of what was
// actually on the page.
//
// A guard that reads the content file and the asset directory is the only thing
// that notices. This runs on every build.
//
// WHAT IT CHECKS
// --------------
// For each clinician, the four files `OptimizedImage` will request:
//   <slug>.avif        the <img src>
//   <slug>-400w.avif   srcSet candidate
//   <slug>-800w.avif   srcSet candidate
//   <slug>-400w.webp   fallback for browsers that cannot decode AVIF
//
// It also fails on any orphaned file in the directory, because a leftover
// `olivia.avif` is the other half of the same defect: not rendered, so nothing
// else would ever report it.
//
// And it scans the repository's own text files for asset paths that no clinician
// owns. Renaming these files broke `deploy.yml`, which probes
// `/images/doctors/ethan-800w.avif` as its AVIF and cache-header check — the
// workflow would have failed on the next deploy, after the site was already
// live and rewritten. A renamed asset is referenced from more than the content
// file, and this is what finds the other references.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const contentPath = join(root, "src", "content", "accra.ts");
const imageDir = join(root, "public", "images", "doctors");

if (!existsSync(contentPath)) {
  console.error("verify-clinician-assets: src/content/accra.ts not found.");
  process.exit(1);
}
if (!existsSync(imageDir)) {
  console.error(`verify-clinician-assets: ${imageDir} not found.`);
  process.exit(1);
}

/**
 * Slugs are read out of the source rather than imported.
 *
 * `accra.ts` is TypeScript with `@/` path aliases, so requiring it would need a
 * loader. Parsing the literal is sufficient here and has the side benefit of
 * failing loudly if the shape of the file changes — which is the moment this
 * check would need revisiting anyway.
 */
const source = readFileSync(contentPath, "utf8");

// Scoped to the clinicians block, because services and transformations carry
// `slug:` keys too and would otherwise be picked up as orphan claimants.
const blockStart = source.indexOf("const clinicianSeeds");
const blockEnd = source.indexOf("export const patientSteps");
if (blockStart === -1 || blockEnd === -1 || blockEnd < blockStart) {
  console.error("verify-clinician-assets: could not locate the clinician block in accra.ts.");
  console.error("  If the seeds moved, update this script rather than deleting the check.");
  process.exit(1);
}
/**
 * Both quote styles are matched. A double-quoted-only pattern lets a clinician
 * declared `slug: 'efua-mensah'` slip through unnoticed: the slug is not found,
 * its four files are never checked, and because the *other* clinicians are still
 * found the "did we find any?" guard below is satisfied. The check then reports
 * green while a clinician has no portrait at all.
 *
 * The backreference (`\1`) requires the closing quote to match the opening one,
 * so `slug: "abc'` cannot produce a bogus slug.
 */
const clinicianSlugs = [
  ...source.slice(blockStart, blockEnd).matchAll(/slug:\s*(["'])([a-z0-9-]+)\1/g),
].map((m) => m[2]);

if (!clinicianSlugs.length) {
  console.error("verify-clinician-assets: no clinician slugs found in the clinician block.");
  process.exit(1);
}

const onDisk = readdirSync(imageDir);
const expectedFor = (slug) => [
  `${slug}.avif`,
  `${slug}-400w.avif`,
  `${slug}-800w.avif`,
  `${slug}-400w.webp`,
];

const failures = [];
let checks = 0;

console.log(`verify-clinician-assets: ${clinicianSlugs.length} clinicians\n`);

for (const slug of clinicianSlugs) {
  for (const file of expectedFor(slug)) {
    checks++;
    if (!onDisk.includes(file)) {
      failures.push(`missing ${file} (expected for clinician "${slug}")`);
    }
  }
}

// Orphans. A file that matches no slug is either a stale name or a new clinician
// whose content entry has not been written yet — both are worth failing on.
for (const file of onDisk) {
  checks++;
  const owned = clinicianSlugs.some((slug) => expectedFor(slug).includes(file));
  if (!owned) {
    failures.push(`orphaned ${file} — no clinician with that slug claims it`);
  }
}

/* 3. Stale asset paths in repository text files.
 *
 * Renaming the files is only half the job: they are referenced from the deploy
 * workflow, the README and the .htaccess comment too. `deploy.yml` probes
 * `/images/doctors/ethan-800w.avif` to confirm AVIF is served with the right MIME
 * type and cache headers — so renaming the assets without updating that probe
 * produces a deploy that replaces the live site and then fails its own
 * verification, which is the worst possible moment to discover a filename.
 *
 * Scanned: any `/images/doctors/<name>` path anywhere in the tracked text files.
 * Excluded: `design/` and `CHANGELOG.md`, which are historical records of
 * the previous identity rather than shipped or current configuration, plus this
 * script itself, whose doc comments name the old filenames deliberately.
 */
{
  const SCAN_DIRS = ["src", "scripts", ".github", "public"];
  /**
   * Root-level docs that describe the *current* setup, so a path in them is a
   * live instruction rather than a historical note. CHANGELOG.md is excluded on
   * purpose: it records what used to be true, and naming a retired asset there is
   * correct.
   */
  const SCAN_ROOT_FILES = ["README.md", "SECURITY.md", "CONTRIBUTING.md"];
  const SKIP_FILES = new Set([
    join(root, "scripts", "verify-clinician-assets.mjs"),
  ]);

  function scan(dir, acc = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".") && e.name !== ".htaccess") continue;
      const p = join(dir, e.name);
      if (SKIP_FILES.has(p)) continue;
      if (e.isDirectory()) scan(p, acc);
      else if (/\.(ts|tsx|mjs|js|yml|yaml|md|css|txt|htaccess)$/.test(e.name)) acc.push(p);
    }
    return acc;
  }

  const ownedPaths = new Set();
  for (const slug of clinicianSlugs) {
    for (const file of expectedFor(slug)) ownedPaths.add(`/images/doctors/${file}`);
  }

  const scanned = [];
  for (const dir of SCAN_DIRS) {
    if (existsSync(join(root, dir))) scanned.push(...scan(join(root, dir)));
  }
  for (const f of SCAN_ROOT_FILES) {
    if (existsSync(join(root, f))) scanned.push(join(root, f));
  }

  const staleRefs = [];
  for (const file of scanned) {
    checks++;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\/images\/doctors\/[A-Za-z0-9._-]+/g)) {
      if (!ownedPaths.has(m[0])) {
        staleRefs.push(`${file.replace(root + "\\", "") || file} references ${m[0]}`);
      }
    }
  }
  failures.push(...staleRefs);

  console.log(
    `  ${staleRefs.length} stale path reference(s) across ${scanned.length} text files`,
  );
}

console.log(`  ${checks} asset checks across ${onDisk.length} files in public/images/doctors`);
console.log(`  clinicians: ${clinicianSlugs.join(", ")}`);

if (failures.length) {
  console.error(`\nverify-clinician-assets: FAILED — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    "\n  The image path is derived from each clinician's slug, so a mismatch here\n" +
      "  means the assets on disk are not named after the slug. Rename the files to\n" +
      "  <slug>.avif, <slug>-400w.avif, <slug>-800w.avif and <slug>-400w.webp — all\n" +
      "  four are requested by OptimizedImage.\n" +
      "\n  Then update every file that references the path. `deploy.yml` probes one\n" +
      "  of these assets after a deploy, so a stale reference there fails the\n" +
      "  workflow once the live site has already been replaced.",
  );
  process.exit(1);
}

console.log("\nverify-clinician-assets: OK — assets match their slug, no stale references.");
