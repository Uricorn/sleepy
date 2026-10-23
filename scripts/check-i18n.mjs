// Fails when a locale array length differs from the English KEYS list (positional mapping).
import { KEYS } from "../src/i18n/keys.js";
import fs from "node:fs";
let bad = 0;
for (const f of fs.readdirSync("src/i18n/locales")) {
  const { default: arr } = await import(`../src/i18n/locales/${f}`);
  if (arr.length !== KEYS.length) { console.error(`${f}: ${arr.length} entries, expected ${KEYS.length}`); bad++; }
}
if (bad) process.exit(1);
console.log(`i18n ok (${KEYS.length} keys)`);
