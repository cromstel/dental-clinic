// Assert that the living documentation does not contradict package.json.
//
// Why this exists
// ---------------
// The changelog has claimed, at least twice, something the code had stopped being:
//
//   1. "npm run lint does not cover TypeScript"  -- true when written in v1.0.0,
//      false for several PRs before anyone removed it.
//   2. "`eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` are no longer in
//      the tree at all... Neither is configured."  -- left in place by the same PR
//      that added them and configured them, so one file said both at once.
//
// In both cases the code was right and the prose was stale, and in both cases the
// prose sat in a section a reader trusts. Nothing else in the pipeline notices:
// `lint`, `typecheck` and the build all passed. So this checks it.
//
// What it does NOT check
// ----------------------
// The `## [1.0.0]` section. That section is explicitly historical -- it records what
// was true at the tag, including superseded facts, and says so. Reading it as a
// statement about `main` is the mistake this guard is here to prevent elsewhere, so
// it is excluded here rather than cleaned up.
//
// How to negative-test
// --------------------
// A guard that has never been seen to fail is not evidence. To test it, add a bullet
// under [Unreleased] -> Known limitations naming a package that IS in package.json
// alongside an absence phrase, run this script, confirm it exits non-zero and names
// that package, then revert. `npm run verify:docs` runs this check.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

const pkg = JSON.parse(read("package.json"));
const installed = new Set(
  Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).map((n) => n.toLowerCase()),
);

/**
 * Phrases that assert a package is absent. Deliberately narrow: each one has to be
 * something that would be false the moment the package is added back. Broad phrasings
 * like "not used" fire on legitimate statements about code that was removed.
 */
const ABSENCE = [
  /no longer in the tree/i,
  /not in the tree/i,
  /neither is configured/i,
  /\bis not configured\b/i,
  /\bare not configured\b/i,
  /\bnot configured\b/i,
  /\bnot a direct dependency\b/i,
  /\bneither is installed\b/i,
  /\bnot installed\b/i,
];

/** `@scope/name/subpath` -> `@scope/name`; bare names pass through. */
function normalise(token) {
  const t = token.replace(/^\$\{(.*)\}$/, "$1").trim();
  if (!/^@?[a-z0-9][a-z0-9._-]*(\/[a-z0-9._-]+)*$/i.test(t)) return null;
  const parts = t.split("/");
  if (t.startsWith("@")) return parts.slice(0, 2).join("/").toLowerCase();
  return parts[0].toLowerCase();
}

/**
 * Scope of the claim. [Unreleased] Known limitations is where forward-looking
 * statements about tooling live; the two living guides can also make them.
 */
function scopes() {
  const out = [];
  const changelog = read("CHANGELOG.md");
  const eol = changelog.includes("\r\n") ? "\r\n" : "\n";
  const start = changelog.indexOf(`## [Unreleased]${eol}`);
  const end = changelog.indexOf("## [1.0.0]", start);
  if (start < 0 || end < 0) throw new Error("could not delimit [Unreleased] in CHANGELOG.md");

  const unreleased = changelog.slice(start, end);
  const klAt = unreleased.search(/^### Known limitations\s*$/m);
  if (klAt < 0) throw new Error("[Unreleased] has no Known limitations section");

  // To the end of the section, i.e. the next heading or the end of [Unreleased].
  //
  // The next heading is searched for *after* the first line, not in `rest.slice(1)`.
  // Skipping one character leaves `## Known limitations`, which still matches
  // /^#{2,3} /, so the "section" came out four characters long and the changelog was
  // never scanned at all. The guard then reported OK while checking nothing --
  // found by the negative test in ../negative-test-docs, which is the only reason
  // this is fixed rather than shipped.
  const rest = unreleased.slice(klAt);
  const firstLineEnd = rest.indexOf("\n") + 1;
  const tail = rest.slice(firstLineEnd);
  const nextAt = tail.search(/^#{2,3} /m);
  const section = nextAt < 0 ? rest : rest.slice(0, firstLineEnd + nextAt);

  // A scope that yields no bullets means the extraction broke, not that the
  // documentation is clean. Failing loudly here is what stops the bug above from
  // coming back as a silent pass.
  if (!/^\s*-\s/m.test(section)) {
    throw new Error("[Unreleased] Known limitations extracted no bullets — extraction is broken");
  }

  out.push({ file: "CHANGELOG.md [Unreleased] Known limitations", text: section });
  for (const f of ["README.md", "CONTRIBUTING.md"]) {
    try {
      out.push({ file: f, text: read(f) });
    } catch {
      /* optional file */
    }
  }
  return out;
}

const findings = [];
let checkedBullets = 0;
let checkedTokens = 0;

for (const { file, text } of scopes()) {
  // A "bullet" is a line starting with a dash; continuation lines are folded in so a
  // claim cannot escape by wrapping onto the next line.
  const bullets = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*-\s/.test(line)) bullets.push({ at: bullets.length, lines: [line] });
    else if (bullets.length && line.trim()) bullets[bullets.length - 1].lines.push(line);
  }

  for (const bullet of bullets) {
    checkedBullets++;
    const body = bullet.lines.join(" ");
    const phrase = ABSENCE.find((re) => re.test(body));
    if (!phrase) continue;

    for (const token of body.matchAll(/`([^`\n]+)`/g)) {
      checkedTokens++;
      const name = normalise(token[1]);
      if (name && installed.has(name)) {
        findings.push({ file, line: bullet.lines[0].slice(0, 110), phrase: String(phrase), name });
      }
    }
  }
}

console.log(
  `verify-docs: ${installed.size} package(s) in package.json, ${checkedBullets} bullet(s) scanned, ${checkedTokens} package name(s) resolved`,
);

if (findings.length) {
  console.error("");
  for (const f of findings) {
    console.error(`  ${f.file}`);
    console.error(`    claims absence via /${f.phrase}/ but "${f.name}" IS in package.json`);
    console.error(`    ${f.line}`);
  }
  console.error("");
  console.error("  A Known limitations bullet says a package is absent. It is present.");
  console.error("  Either the claim is stale and the bullet should go, or the package was");
  console.error("  never actually added. Resolve which, rather than editing the bullet to");
  console.error("  agree with whichever was checked first.");
  process.exit(1);
}

console.log("verify-docs: OK — no stale absence claims in the living documentation.");