// i18n guard rails. Fails when:
//  - a locale array length differs from the English KEYS list (positional mapping)
//  - a locale has empty strings, or `{placeholders}` that differ from the English key
//  - KEYS has duplicates
//  - a locale file is not registered in translations.js, or vice versa
//  - source code calls t("...") with a literal that is missing from KEYS (would show untranslated)
//  - a KEYS entry is never used in source (dead translation)
import { KEYS } from "../src/i18n/keys.js";
import fs from "node:fs";
import path from "node:path";

const errors = [];
const err = (m) => errors.push(m);
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

// Duplicates
const seen = new Set();
for (const k of KEYS) { if (seen.has(k)) err(`keys.js: duplicate key ${JSON.stringify(k)}`); seen.add(k); }

// Locales
const files = fs.readdirSync("src/i18n/locales").filter((f) => f.endsWith(".js"));
const registry = fs.readFileSync("src/i18n/translations.js", "utf8");
for (const f of files) {
  const code = f.replace(/\.js$/, "");
  if (!new RegExp(`from "\\./locales/${code}"`).test(registry)) err(`${f}: not imported in translations.js`);
  if (!new RegExp(`^\\s*${code}:\\s*\\{ name:`, "m").test(registry)) err(`${f}: missing from LANGUAGES in translations.js`);
  const { default: arr } = await import(`../src/i18n/locales/${f}`);
  if (arr.length !== KEYS.length) { err(`${f}: ${arr.length} entries, expected ${KEYS.length}`); continue; }
  arr.forEach((v, i) => {
    if (typeof v !== "string" || !v.trim()) err(`${f}: entry ${i} (${JSON.stringify(KEYS[i])}) is empty`);
    else if (placeholders(v) !== placeholders(KEYS[i])) err(`${f}: entry ${i} (${JSON.stringify(KEYS[i])}) has different {placeholders}`);
  });
}

// Source usage
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "i18n") walk(p, out); }
    else if (/\.(jsx?|tsx?)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}
const src = walk("src").map((f) => [f, fs.readFileSync(f, "utf8")]);
const used = new Set();
const callRe = /\bt\(\s*(["'`])((?:\\.|(?!\1).)*?)\1/g;
for (const [f, text] of src) {
  for (const m of text.matchAll(callRe)) {
    if (m[1] === "`" && m[2].includes("${")) continue;
    const key = m[2].replace(/\\(["'`\\])/g, "$1");
    used.add(key);
    if (!seen.has(key)) err(`${f}: t(${JSON.stringify(key)}) is missing from src/i18n/keys.js and every locale`);
  }
}
// Keys referenced some other way (e.g. label strings passed to t(label) later) count as used
// when the literal appears anywhere in source.
const all = src.map(([, t]) => t).join("\n");
for (const k of KEYS) {
  if (!used.has(k) && !all.includes(JSON.stringify(k)) && !all.includes(`'${k}'`)) err(`keys.js: ${JSON.stringify(k)} is never used in src`);
}

if (errors.length) { console.error(errors.join("\n")); console.error(`\n${errors.length} i18n problem(s). See CONTRIBUTING.md.`); process.exit(1); }
console.log(`i18n ok (${KEYS.length} keys, ${files.length} locales)`);
