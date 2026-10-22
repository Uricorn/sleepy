# Sleepy Local

A local-only sleep diary being converted from a platform-specific web app into a standalone Android APK. The original `Uricorn/sleepy` repository is untouched. This repository is `Uricorn/sleepy-basecode`.

## Current implementation

- React client app with Vite, TanStack Router hash routing and on-device storage.
- Before-bed and morning entries, history, trends, editing and JSON backups.
- Typed-note parsing runs locally. No cloud AI, image analysis, login or server database.
- Android WebView shell with bundled assets, no INTERNET permission, import file picker and native backup-save dialog.
- Browser/PWA assets use local icons. The Android shell loads its bundled files from an intercepted local HTTPS origin, without hosting or an actual web server.
- Reminders are foreground-only. They cannot wake the phone or notify while the app is closed.

## Verification so far

The diary preservation/backup tests and four local-parser tests pass. The full dependency installation, production web build, lint, APK compilation and Android device behavior still need verification. An installable APK has not been delivered. Treat this as a work-in-progress handoff, not a finished release.

See [BASECODE_HANDOFF.md](./BASECODE_HANDOFF.md) for the continuation prompt and exact acceptance checks.

## Local development

Use a supported Node version for Vite 8 (Node 22.12+ or 24 recommended).

```sh
npm ci
npm test
npm run dev
npm run build
npm run lint
```

Development and production assets must not require a Base44 account, SDK, runtime, cloud service or external hosting.

## Android build

Install JDK 17+ and Android SDK platform 35 with build-tools 35.0.0. Set `JAVA_HOME` and `ANDROID_HOME`, then:

```sh
sh scripts/build-android.sh
```

This installs JS dependencies, builds the web assets, copies `dist` into the Android project and runs the checked-in Gradle wrapper. Expected test APK output: `android/app/build/outputs/apk/debug/app-debug.apk`. It is a debug-signed personal test build, not an app-store release. Preserve the signing key for updates; production signing and APK verification remain follow-up work.

The Android app targets Android 8+ (API 26). These are configuration targets, not confirmed device compatibility.

## Existing diary data

The storage key remains `lull:v1` and the backup format remains `app: "lull", version: 1`. A new Android app has separate storage from the old browser app, so entries will not migrate automatically. Export a backup in the old app first, then import it in the new app. Never clear or uninstall the old app until the imported entries have been checked. Uninstalling this local app deletes its data; keep backups.

Do not add Netlify, hosting, cloud AI, authentication or automatic syncing as part of this conversion.
