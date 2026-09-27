// ESLint flat config.
//
// WHY THIS IS DELIBERATELY NARROWER THAN YOU EXPECT
// ---------------------------------------------------
// `eslint-config-next` cannot be used in this project. It pulls in
// `typescript-eslint@8.70.1`, which hard-throws on load when it detects
// TypeScript >= 7:
//
//     typescript-eslint does not support TS 7.0.
//     (node_modules/typescript-eslint/dist/index.js)
//
// This project is on `typescript@7.0.2`, so any config that loads that package
// dies before a single rule runs. `next lint` is also gone as of Next 16, so the
// previous `npm run lint` script was a no-op that silently linted nothing.
//
// Rather than downgrade TypeScript (a toolchain change the team has not asked
// for, and the native TS 7 compiler is a deliberate speed choice), this config
// lints the JavaScript surface only — the build and deploy plumbing, which is
// where a real bug would actually land:
//
//   - scripts/*.mjs        the post-build RSC payload fix (data-loss capable)
//   - next.config.mjs      output/trailingSlash/inlineCss — silently break deploys
//   - postcss.config.mjs   Tailwind pipeline
//
// `.ts`/`.tsx` files are covered by `npm run typecheck` (tsc --noEmit), which
// is a strictly stronger guarantee than linting and needs no ESLint parser.
//
// TO RE-ENABLE FULL TS LINTING: pin `typescript` to ^6.0.0 (or ^5.9.0) in
// devDependencies, then replace the import below with the array exported by
// `eslint-config-next` and widen `files` to cover TS/TSX.

import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
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
      // Build scripts fail loudly by design; `console` is the output channel.
      "no-console": "off",
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
