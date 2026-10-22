import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import globals from "globals";
import tseslint from "typescript-eslint";

// One config for the whole monorepo — each package's `lint` script just
// runs `eslint .`, which finds this by walking up from its cwd (flat
// config resolution). apps/web gets Next's own rules (hooks, a11y,
// core-web-vitals); apps/api and packages/shared are plain Workers/TS
// code with no React, so they only get the baseline TS rules.
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.open-next/**",
      "**/.wrangler/**",
      "**/.turbo/**",
      "**/test-results/**",
      "**/playwright-report/**",
      "**/*.config.*",
      "apps/web/.open-next/**",
      "apps/web/cloudflare-env.d.ts",
      "apps/extractor/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // eslint-config-next's export is itself an array of flat configs, not
  // one config object — spreading it into a single `{ files, ... }`
  // object (rather than mapping over it) produces numeric keys ESLint's
  // schema rejects. Force every entry's `files` to apps/web regardless
  // of what it already has: eslint-config-next assumes it's the only
  // config in a Next-only repo, so most entries ship a project-wide
  // glob (e.g. "**/*.{ts,tsx}") that would otherwise leak Next/React
  // rules into apps/api and packages/shared.
  ...nextCoreWebVitals.map((config) => ({
    ...config,
    files: ["apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  })),
  {
    rules: {
      // Workers/Node code throws plenty of intentionally-unused
      // destructured params (e.g. Hono handlers); keep this a warning
      // everywhere rather than off, so real dead code still gets flagged.
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
);
