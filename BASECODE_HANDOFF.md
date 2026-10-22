# Continue Sleepy Local in Base Code

Copy the prompt below into Base Code after opening `Uricorn/sleepy-basecode` on its latest `main` branch.

## Prompt

Continue the in-progress conversion of this repository into a fully local Android sleep diary. Inspect the current files first and work from the existing implementation, not a new rewrite. Finish in small, independently verified steps.

### Non-negotiable requirements

- No Base44 SDK, runtime, build plugin, backend, authentication, entities or app-linking configuration. Do not reintroduce platform-specific scaffolding.
- No Netlify, cloud hosting, paid APIs, cloud AI, external image uploads or syncing. This is an APK installed on my own Android phone, with all web assets bundled inside it.
- Keep the existing diary UI and before-bed/morning entry workflow, history, trends, editing, reminders settings and JSON backup import/export.
- Preserve `localStorage` key `lull:v1` and existing backup compatibility (`app: "lull", version: 1`). Never erase or silently migrate user data. The old browser storage does not automatically transfer into the APK; provide export/import instructions.
- Only record reported sleep information. Never derive total sleep from awakening start times without durations.
- Typed notes use the local parser. Be explicit that it is not cloud AI and cannot understand screenshots. Do not add network-dependent functionality to replace it.
- Foreground reminders only unless real Android scheduling is deliberately implemented and tested. Do not claim reminders work while closed or asleep.
- Keep the Android manifest without INTERNET permission. Do not add broad file/storage permissions; keep Android's document pickers.
- Do not change the original `Uricorn/sleepy` repository.

### What is already implemented

1. Client-only Vite entry (`index.html`, `src/main.jsx`), TanStack Router plugin/file routes, hash-history router, no SSR server entry.
2. Platform SDK/auth/cloud runtime files, `base44/` configuration and obsolete generated instructions have been removed. Recheck for remaining references, including lockfile and unused dependencies.
3. Local diary implementation remains in `src/lib/sleep-fns.js`. Its save/update/export/import tests are in `scripts/test-diary.mjs`.
4. `src/lib/chat-fns.js`, `local-parser.js` and `components/sleep/chat/` now process typed notes locally, without uploads. Four parser tests are in `src/lib/local-parser.test.js`.
5. Local manifest, icons, service worker and `scripts/precache.mjs`. The Android shell skips service-worker registration because files are already bundled.
6. Android project in `android/`, using Android Gradle Plugin 8.7.3, Gradle wrapper 8.9 with its distribution SHA-256, compile/target SDK 35 and min SDK 26. `MainActivity.java` serves bundled assets at intercepted `https://sleepy.local/`, restricts navigation, stores diary data in WebView localStorage, and bridges JSON backup saves to the system document picker. Web assets copy from `dist/` before building.
7. `scripts/build-android.sh` is the intended build entry. Requires `JAVA_HOME` and `ANDROID_HOME`. Debug APK expected at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Verified versus unverified

Verified: `node scripts/test-diary.mjs` passes, covering storage key compatibility, save/update, backup roundtrip, invalid JSON rejection, same-date merge and not inferring sleep duration. `node src/lib/local-parser.test.js` passes four local parsing tests. Git whitespace checks passed before handoff. The lockfile was regenerated successfully with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`; this is not a full install or build.

NOT yet verified: clean dependency install, full web build, lint, browser routing/rendering, Android compilation, installing/launching on a real phone, WebView local-storage persistence, native export/import, APK permissions and offline behavior. No installable APK has been delivered. Check actual command results rather than assuming source presence means success.

### Finish in this order

1. Run `npm ci`, `npm test`, `npm run build`, `npm run lint`. Fix concrete errors, dependency/lockfile mismatches and router generation issues. Keep source changes focused. Verify every main route and the diary save/edit/apply-chat workflows in the client-only app.
2. Confirm no app runtime requests external assets, fonts, analytics or cloud endpoints. Inspect the built output as well as source.
3. Review and test Android packaging. Ensure Gradle actually copies the new `dist` output, native backup callbacks only mark backups after a successful save, import works through a content URI, navigation and Android back behavior work, and UI controls avoid system bars and the keyboard. Review the local-origin WebView/native-bridge security.
4. With JDK 17+ and Android SDK platform/build-tools 35 installed, run `sh scripts/build-android.sh`. Fix build errors and verify the resulting APK signature, manifest permissions and bundled assets. If this environment cannot build Android, say exactly which compiler/tool is missing, preserve all work and provide reproducible build instructions; do not claim an APK exists.
5. Test on an Android emulator or device when available: first launch in airplane mode, create both entry stages, restart the app and verify persistence, view history/trends, parse/apply a note, export JSON, import a backup, and verify foreground reminder wording. Do not claim device tests if only compilation was possible.
6. Commit the finished changes and provide the actual APK artifact if built, test results, remaining limitations, and short sideload/import instructions. Do not publish or expose diary data. The deliverable is a working local APK, not a hosted URL.
