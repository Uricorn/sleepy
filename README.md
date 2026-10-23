# Sleepy

A private, offline sleep diary for Android. All data stays on the device; the app has no INTERNET permission, account or cloud service.

## Current implementation

- React client app with Vite, TanStack Router hash routing and on-device storage.
- Before-bed and morning entries, history, trends, editing and JSON backups.
- Multilingual UI (17 languages incl. RTL: Arabic, Hebrew, Persian, Urdu) via `src/i18n`; language switcher in the app. Locale files in `src/i18n/locales` are positional arrays matching `src/i18n/keys.js`; `npm test` verifies lengths.
- Typed-note parsing runs locally, with multilingual keywords (`src/lib/parser-keywords.js`). No cloud AI, image analysis, login or server database.
- Android WebView shell with bundled assets, no INTERNET permission, import file picker and native backup-save dialog.
- Browser/PWA assets use local icons. The Android shell loads its bundled files from an intercepted local HTTPS origin, without hosting or an actual web server.
- Reminders are native Android notifications scheduled with inexact `AlarmManager` alarms (rescheduled after reboot). They work with the app closed but may arrive a few minutes late under Doze. In a browser they fire only while the page is open. Notification permission is requested on Android 13+.

## Status

Releases are built by CI (`.github/workflows/release.yml`) and prepared for F-Droid. See
[docs/RELEASING.md](docs/RELEASING.md) and [docs/FDROID.md](docs/FDROID.md). Changes are listed in
[CHANGELOG.md](CHANGELOG.md); contributions: [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT.

## Local development

Use a supported Node version for Vite 8 (Node 22.12+ or 24 recommended).

```sh
npm ci
npm test
npm run dev
npm run build
npm run lint
```

Development and production assets must not require an account, SDK, runtime, cloud service or external hosting.

## Android build

Install JDK 17+ and Android SDK platform 35 with build-tools 35.0.0. Set `JAVA_HOME` and `ANDROID_HOME`, then:

```sh
sh scripts/build-android.sh
```

This installs JS dependencies, builds the web assets, copies `dist` into the Android project and runs the checked-in Gradle wrapper. Expected test APK output: `android/app/build/outputs/apk/debug/app-debug.apk`. It is a debug-signed test build. For a signed release APK use `npm run android:release` (see docs/RELEASING.md).

The Android app targets Android 8+ (API 26). These are configuration targets, not confirmed device compatibility.

## Existing diary data

The storage key remains `lull:v1` and the backup format remains `app: "lull", version: 1`. A new Android app has separate storage from the old browser app, so entries will not migrate automatically. Export a backup in the old app first, then import it in the new app. Never clear or uninstall the old app until the imported entries have been checked. Uninstalling this local app deletes its data; keep backups.

Do not add Netlify, hosting, cloud AI, authentication or automatic syncing as part of this conversion.
