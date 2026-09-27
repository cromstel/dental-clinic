// Post-build fix: normalize per-route RSC prefetch payload filenames in `out/`.
//
// Problem: with `output: "export"` on Next 16.3.6 (Turbopack), `next build` writes the
// per-route RSC payload as `<route>/__next.<route>/__PAGE__.txt` (slash form), while the
// client router fetches `<route>/__next.<route>.__PAGE__.txt` (dot form). The root route
// is exported correctly as a file (`out/__next.__PAGE__.txt`). Result: every cross-route
// prefetch 404s on any static host, which surfaces as `errors-in-console` in Lighthouse
// and degrades soft navigation to full page loads.
//
// Fix: for each `__next.*` directory inside a route directory, copy its `__PAGE__.txt`
// to the dot-form sibling file name the client expects, then remove the stale directory.
// Runs after `next build` (see the `build` script in package.json). Idempotent: when no
// `__next.*` directories exist, it does nothing and exits 0.

import { readdirSync, existsSync, copyFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");

if (!existsSync(outDir)) {
  console.error("rsc-payload-fix: no out/ directory found; run `next build` first.");
  process.exit(1);
}

let normalized = 0;
let removed = 0;
let failed = 0;

for (const routeEntry of readdirSync(outDir, { withFileTypes: true })) {
  if (!routeEntry.isDirectory()) continue;
  const routeDir = join(outDir, routeEntry.name);

  for (const entry of readdirSync(routeDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("__next.")) continue;

    const payloadDir = join(routeDir, entry.name);
    const payload = join(payloadDir, "__PAGE__.txt");

    if (!existsSync(payload)) {
      console.warn(`rsc-payload-fix: skipped ${routeEntry.name}/${entry.name} (no __PAGE__.txt)`);
      continue;
    }

    const target = join(routeDir, `${entry.name}.__PAGE__.txt`);
    try {
      copyFileSync(payload, target);
      const size = statSync(target).size;
      rmSync(payloadDir, { recursive: true, force: true });
      normalized++;
      removed++;
      console.log(`rsc-payload-fix: ${routeEntry.name}/${entry.name}/__PAGE__.txt -> ${entry.name}.__PAGE__.txt (${size} B)`);
    } catch (err) {
      failed++;
      console.error(`rsc-payload-fix: FAILED for ${routeEntry.name}/${entry.name}: ${err.message}`);
    }
  }
}

console.log(
  `rsc-payload-fix: ${normalized} payload(s) normalized, ${removed} stale dir(s) removed` +
    (failed ? `, ${failed} FAILED` : "") + "."
);
if (failed > 0) process.exit(1);