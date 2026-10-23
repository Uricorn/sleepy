# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [Semantic Versioning](https://semver.org/). Each release also needs
`fastlane/metadata/android/en-US/changelogs/<versionCode>.txt` (max 500 bytes) for F-Droid.

## [Unreleased]

## [1.0.0]

### Added
- Fully local Android sleep diary (WebView shell, bundled assets, no INTERNET permission).
- Before-bed and morning entries, history, trends, editing, foreground reminders.
- JSON backup export/import (`lull:v1` storage key and `app: "lull", version: 1` format preserved).
- Local typed-note parser (not cloud AI).
- F-Droid metadata, CI, and signed-release workflow.
