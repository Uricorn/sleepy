// Release-consistency checks: version sync, F-Droid/fastlane metadata limits, changelog.
// Run with `npm run check:release`. Also part of `npm test`.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };

const pkg = JSON.parse(read('package.json'));
const gradle = read('android/app/build.gradle');
const versionName = /versionName\s+'([^']+)'/.exec(gradle)?.[1];
const versionCode = Number(/versionCode\s+(\d+)/.exec(gradle)?.[1]);
check(versionName, 'versionName not found in android/app/build.gradle');
check(Number.isInteger(versionCode) && versionCode > 0, 'versionCode not found in android/app/build.gradle');
check(pkg.version === versionName, `package.json version (${pkg.version}) != Gradle versionName (${versionName})`);

const meta = 'fastlane/metadata/android/en-US';
const text = (f) => (existsSync(join(root, meta, f)) ? read(`${meta}/${f}`) : null);
const limits = { 'title.txt': 30, 'short_description.txt': 80, 'full_description.txt': 4000 };
for (const [file, max] of Object.entries(limits)) {
  const body = text(file);
  check(body !== null, `${meta}/${file} is missing`);
  if (body !== null) {
    check(body.trim().length > 0, `${file} is empty`);
    check([...body.trim()].length <= max, `${file} exceeds ${max} characters`);
  }
}
const changelog = text(`changelogs/${versionCode}.txt`);
check(changelog !== null, `${meta}/changelogs/${versionCode}.txt is missing (needed for versionCode ${versionCode})`);
if (changelog !== null) check(Buffer.byteLength(changelog) <= 500, `changelogs/${versionCode}.txt exceeds 500 bytes`);
check(existsSync(join(root, meta, 'images/icon.png')), `${meta}/images/icon.png is missing`);

const manifest = read('android/app/src/main/AndroidManifest.xml');
check(!/<uses-permission[^>]*INTERNET/.test(manifest), 'AndroidManifest must not request INTERNET (privacy promise)');
check(!/RECORD_AUDIO/.test(manifest), 'AndroidManifest must not request RECORD_AUDIO (voice input was removed in 1.2.3)');
check(/allowBackup="false"/.test(manifest), 'AndroidManifest must keep allowBackup="false"');

const topLog = read('CHANGELOG.md');
check(topLog.includes(`## [${versionName}]`), `CHANGELOG.md has no "## [${versionName}]" section`);

if (errors.length) {
  console.error('Release check FAILED:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`PASS: release metadata consistent (version ${versionName}, code ${versionCode}).`);
