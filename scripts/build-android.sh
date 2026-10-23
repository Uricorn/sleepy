#!/usr/bin/env sh
# Builds the web assets and the Android APK.
#   sh scripts/build-android.sh            -> debug APK (debug-signed)
#   sh scripts/build-android.sh release    -> release APK (signed if SLEEPY_KEYSTORE_FILE or
#                                             android/keystore.properties is provided, else unsigned)
set -eu
cd "$(dirname "$0")/.."
variant="${1:-debug}"
case "$variant" in debug|release) ;; *) echo "usage: $0 [debug|release]" >&2; exit 2 ;; esac
: "${JAVA_HOME:?Set JAVA_HOME to a JDK 17 or newer installation}"
: "${ANDROID_HOME:?Set ANDROID_HOME to an Android SDK with platform 35 and build-tools 35.0.0}"
export PATH="$JAVA_HOME/bin:$PATH"
npm ci
npm run build
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties
cd android
if [ "$variant" = release ]; then
  ./gradlew assembleRelease --no-daemon
  ls app/build/outputs/apk/release/*.apk
else
  ./gradlew assembleDebug --no-daemon
  printf '\nAPK: android/app/build/outputs/apk/debug/app-debug.apk\n'
fi
