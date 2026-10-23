# Releasing

## One-time setup: signing key (GitHub-release APKs)

```sh
keytool -genkeypair -v -keystore sleepy-release.jks -alias sleepy -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 sleepy-release.jks   # macOS: base64 -i sleepy-release.jks
```

Keep the `.jks` and its passwords in a password manager - **losing it means users cannot update**.
Never commit it (`*.jks`/`*.keystore` are git-ignored). Add repository secrets
(Settings -> Secrets and variables -> Actions):

- `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

Local signed build: create untracked `android/keystore.properties` with `storeFile`, `storePassword`,
`keyAlias`, `keyPassword`, then `npm run android:release`.

## Cutting a release

1. Pick the version `X.Y.Z`; increase `versionCode` by 1.
2. Update `package.json` `version`, `android/app/build.gradle` `versionName` + `versionCode`.
3. Add `## [X.Y.Z]` to `CHANGELOG.md` and `fastlane/metadata/android/en-US/changelogs/<versionCode>.txt`.
4. `npm run lint && npm test` (the release check fails if anything is out of sync).
5. Merge to `main`, then tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
6. The **Release** workflow builds, signs, verifies and publishes the APK + `SHA256SUMS.txt`.
7. Add the new build entry to the F-Droid recipe (or let the auto-update bot do it).

## CI

`CI` runs on every PR/push: lint, tests, web build, Android debug build + Android lint, and asserts
the built APK has no INTERNET permission. Enable branch protection on `main` requiring these checks.
