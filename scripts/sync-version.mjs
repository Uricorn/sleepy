// Copies package.json "version" into android/app/build.gradle (versionName) and
// bumps versionCode when the version changed. Runs automatically on `npm version`
// (see "version" script) so the two can't drift; check-release.mjs still enforces it.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gradlePath = join(root, 'android/app/build.gradle');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
let gradle = readFileSync(gradlePath, 'utf8');
const current = /versionName\s+'([^']+)'/.exec(gradle)?.[1];
if (current === version) {
  console.log(`Already in sync (${version}).`);
  process.exit(0);
}
gradle = gradle
  .replace(/versionName\s+'[^']+'/, `versionName '${version}'`)
  .replace(/versionCode\s+(\d+)/, (_, n) => `versionCode ${Number(n) + 1}`);
writeFileSync(gradlePath, gradle);
const code = /versionCode\s+(\d+)/.exec(gradle)[1];
console.log(`Synced Gradle to ${version} (versionCode ${code}).`);
console.log(`Now add fastlane/metadata/android/en-US/changelogs/${code}.txt and a "## [${version}]" section in CHANGELOG.md.`);
