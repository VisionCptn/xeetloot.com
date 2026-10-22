#!/usr/bin/env node
// Fails (exit 1) if any locale listed in i18n/routing.ts's `locales` array
// has a message value that's byte-identical to the English source outside
// the allowlist below — i.e. a string that looks untranslated. Run via
// `pnpm --filter @xeetloot/web check-translations`; wired into CI so a
// locale can't silently regress to English copy.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Locales actually routed (see i18n/routing.ts) — stub locales not yet in
// that array are allowed to stay English; they're simply not checked.
const ACTIVE_LOCALES = ["tr", "pt-BR", "id", "es", "vi", "ar"];

// Final path segment — exempt regardless of value. These are
// intentionally identical in every locale (internal route slugs, the
// contact address).
const EXEMPT_KEYS = new Set(["href", "email"]);

// Exact string values expected to legitimately match English in any
// locale: the brand name, format/technical acronyms, common loanwords,
// and "Twitter (X)" itself (brief: allowed as descriptive text
// everywhere, never translated).
const EXEMPT_VALUES = new Set([
  "XeetLoot",
  "GIF",
  "MP3",
  "MP4",
  "JPG",
  "DMCA",
  "Video",
  "Legal",
  "Cookies",
  "Twitter (X)",
  "Twitter (X) ",
  "X Corp.",
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Flattens a message tree into [jsonPath, stringValue] pairs, walking
 * through arrays (of strings or objects) as well as plain objects. */
function leaves(value, path = "") {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value).flatMap((k) => leaves(value[k], path ? `${path}.${k}` : k));
  }
  if (typeof value === "string") {
    return [[path, value]];
  }
  return [];
}

function lastKey(path) {
  const match = /([A-Za-z0-9_]+)(\[\d+\])?$/.exec(path);
  return match?.[1] ?? path;
}

function main() {
  const messagesDir = __dirname;
  const en = readJson(join(messagesDir, "en.json"));
  const enLeaves = new Map(leaves(en));

  let failed = false;

  for (const locale of ACTIVE_LOCALES) {
    const data = readJson(join(messagesDir, `${locale}.json`));
    const localeLeaves = leaves(data);
    const misses = [];

    for (const [path, value] of localeLeaves) {
      if (!enLeaves.has(path)) continue; // structural mismatch is a separate concern
      if (value.trim() === "") continue;
      if (EXEMPT_KEYS.has(lastKey(path))) continue;
      if (EXEMPT_VALUES.has(value)) continue;
      if (enLeaves.get(path) === value) misses.push(path);
    }

    if (misses.length > 0) {
      failed = true;
      console.error(`\n✗ ${locale}.json has ${misses.length} value(s) identical to English:`);
      for (const path of misses) console.error(`    ${path}: ${JSON.stringify(enLeaves.get(path))}`);
    } else {
      console.log(`✓ ${locale}.json — no untranslated values found`);
    }
  }

  if (failed) {
    console.error(
      "\nIf a flagged value is a legitimate cognate/technical term (not a missed translation), add it to EXEMPT_VALUES in check-translated.mjs.",
    );
    process.exit(1);
  }
}

main();
