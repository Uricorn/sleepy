#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME to a JDK 17 or newer installation}"
: "${ANDROID_HOME:?Set ANDROID_HOME to an Android SDK with platform 35 and build-tools 35.0.0}"
export PATH="$JAVA_HOME/bin:$PATH"
npm ci
npm run build
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties
cd android
./gradlew assembleDebug --no-daemon
printf '\nAPK: android/app/build/outputs/apk/debug/app-debug.apk\n'
