# Shipping on F-Droid

F-Droid builds the app **from source** on its own servers and signs it with its own key. Nothing
binary is taken from this repo, which is why `*.apk` is git-ignored.

## What is already prepared

| Requirement | Where |
|---|---|
| Open-source licence | `LICENSE` (MIT - change if you prefer another FLOSS licence, and update `License:` in the recipe) |
| No proprietary libs / trackers / network | Manifest has no INTERNET permission, no Android dependencies; CI fails if that changes |
| Store listing (title, descriptions, icon, changelog) | `fastlane/metadata/android/en-US/` |
| Build recipe draft | `fdroid/com.uricorn.sleepy.yml` |
| Version auto-detection | tags `vX.Y.Z` + `versionCode`/`versionName` in `android/app/build.gradle` |
| Consistency checks | `npm run check:release` (also in CI) |
| Deterministic build inputs | `package-lock.json`, Gradle wrapper pinned with SHA-256, `dependenciesInfo` stripped |

## Steps to submit

1. Push this branch, merge it, and create the first tag: see [RELEASING.md](RELEASING.md).
2. Optional but recommended: add phone screenshots as
   `fastlane/metadata/android/en-US/images/phoneScreenshots/1.png`, `2.png`, ...
3. Fork <https://gitlab.com/fdroid/fdroiddata>, copy `fdroid/com.uricorn.sleepy.yml` to
   `metadata/com.uricorn.sleepy.yml`.
4. Run `fdroid lint` and `fdroid build -v -l com.uricorn.sleepy` (see the
   [F-Droid quick start](https://f-droid.org/docs/Submitting_to_F-Droid_Quick_Start_Guide/)).
5. Open a merge request. Reviewers may ask you to adjust the Node.js install in `sudo:`; the
   recipe is a draft that has **not** been run on the F-Droid build server.

## Updates later

With `UpdateCheckMode: Tags`, pushing a new `vX.Y.Z` tag is enough: F-Droid's bot picks it up.
The signing key on F-Droid differs from the GitHub-release APK key, so users cannot switch between
the two sources without reinstalling (export a backup first). Reproducible-build verification
(`Binaries:` in the recipe) is possible later if you want one signing key for both.

## Policy review notes (Quality Control)

- **Native features (rule 3):** this is not a thin website wrapper. Sleepy adds native reminder notifications
  (AlarmManager + NotificationChannel, rescheduled on boot), Storage Access Framework backup export/import,
  launcher shortcuts, notification deep links and an offline asset-intercepting WebView with all network blocked.
- **Dependencies:** only packages imported by the app are kept in `package.json` (audited; unused UI kit removed).
- **Age/users (rule 6):** if the project is under three months old, mention real users or other F-Droid apps in the MR.
