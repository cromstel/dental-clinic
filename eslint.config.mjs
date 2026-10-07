// ESLint flat config.
//
// HOW TYPESCRIPT IS LINTED HERE, AND WHY IT NEEDS A SHIM
// -------------------------------------------------------
// `eslint-config-next` cannot be used in this project. It pulls in
// `typescript-eslint`, which hard-throws when it loads and sees TypeScript >= 7:
//
//     typescript-eslint does not support TS 7.0.
//
// This project is on `typescript@7.0.2` — the native compiler — deliberately,
// for speed. The previous version of this config therefore gave up and linted
// only the JavaScript build tooling, leaving `src/` with no ESLint at all. That
// trade was recorded in the README and CONTRIBUTING as a limitation.
//
// It is fixable without giving up TypeScript 7, and this is that fix.
//
// `typescript-eslint` reaches the compiler through exactly one call:
// `require("typescript")`, from inside its own code. There is no option to hand
// it a different TypeScript, and its own error message points at the answer —
// run it against the TypeScript 6 API, which is what ships side by side with 7.
// So `typescript@6.0.3` is installed under the alias `typescript-lint-api`, and
// the CommonJS module cache is seeded so that `require("typescript")` yields the
// v6 copy *for the lint process only*. `tsc --noEmit` is unaffected and still
// runs on TypeScript 7.
//
// Three things make this load-bearing rather than clever-clever, and each was
// verified rather than assumed:
//
//   1. The gate is version-based, so redirecting the module redirects the gate.
//      Confirmed: with no seeding, `require("typescript-eslint")` throws; with
//      seeding, it loads 136 rules.
//   2. It actually parses this project's TSX. Confirmed by parsing
//      `src/components/ui/Cta.tsx` through `@typescript-eslint/parser`.
//   3. Rules actually fire. Confirmed end to end: `no-explicit-any` reports a
//      probe, and the clean case is silent. A parser that loads but reports
//      nothing would have proved nothing at all.
//
// The `require.cache` write has to happen before `typescript-eslint` is
// imported, and static `import` statements are hoisted above all module-body
// code — so the import below is dynamic. Making it static would silently restore
// the throw, and the config would fail to load with the same message as before.
//
// `npm install` needs `--legacy-peer-deps` for this: npm checks
// `typescript-eslint`'s declared peer range (`>=4.8.4 <6.1.0`) against the
// top-level `typescript@7.0.2` and refuses. The peer is satisfied *in
// practice* — the linter runs on 6.0.3 — so this is declared in `.npmrc` rather
// than passed as a flag, so that `npm ci` in CI and a fresh clone behave
// identically instead of one of them failing on an install flag nobody
// remembered.

import { createRequire } from "node:module";
import js from "@eslint/js";

const require = createRequire(import.meta.url);

// Point `require("typescript")` at the TypeScript 6 API for this process only.
const tsLintApi = require("typescript-lint-api");
const ts7Path = require.resolve("typescript");
require.cache[ts7Path] = {
  id: ts7Path,
  filename: ts7Path,
  loaded: true,
  exports: tsLintApi,
  children: [],
  paths: [],
};

// Dynamic, for the hoisting reason above.
const tseslint = await import("typescript-eslint");

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,

  // Node build tooling: `scripts/*.mjs` are ESM, but `scripts/*.js` are
  // CommonJS (they use require + __dirname), so they need a different
  // sourceType and the CommonJS globals.
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        // Web-standard globals that exist in Node 18+ and are legitimately used
        // by the build scripts. TextDecoder in particular is how
        // scripts/fix-encoding.mjs validates UTF-8 with { fatal: true }.
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        queueMicrotask: "readonly",
        structuredClone: "readonly",
      },
    },
    rules: {
      // Build scripts fail loudly by design; `console` is the output channel.
      "no-console": "off",
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        require: "readonly",
        module: "writable",
        exports: "writable",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // `src/` — TypeScript and TSX, previously unlinted.
  //
  // The rule set is deliberately small rather than
  // `tseslint.configs.recommended`. Recommended is a large stylistic surface,
  // and adopting it wholesale on a codebase that has never been linted produces
  // hundreds of findings — at which point the honest options are to fix all of
  // them or to silence most of them, and both are worse than a short list that
  // actually holds.
  //
  // Each rule below was measured against all 54 TS/TSX files before being kept.
  // `no-unused-vars` found 8 real ones (now removed); `no-explicit-any` found
  // none, and is kept precisely because a rule that currently passes is what
  // makes it useful tomorrow.
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2024,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        matchMedia: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        Node: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        URL: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // The base rule cannot see TypeScript type-only usage, so it reports
      // false positives on every type import and interface. The TS-aware
      // replacement below is the one that belongs here.
      "no-unused-vars": "off",
      "no-undef": "off", // `tsc` is authoritative on identifiers.

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      // A type assertion to `any` via a double cast is the same defect wearing
      // a disguise, and is otherwise trivially evadable.
      "@typescript-eslint/no-unsafe-declaration-merging": "error",

      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
