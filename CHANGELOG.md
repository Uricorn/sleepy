# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [Semantic Versioning](https://semver.org/). Each release also needs
`fastlane/metadata/android/en-US/changelogs/<versionCode>.txt` (max 500 bytes) for F-Droid.

## [Unreleased]

## [1.2.0]

### Fixed
- Focused text fields stay visible above the on-screen keyboard.

## [1.1.0]

### Added
- Localization in 17 languages with full RTL support, plus a language switcher.
- Multilingual keyword support in the local typed-note parser.
- Native daily reminder notifications that work when the app is closed (rescheduled after reboot).
- Launcher shortcuts and notification taps open the before-bed / morning entry directly.

### Changed
- Fixed a chat crash.
- Removed unused dependencies and dead UI components (smaller, faster F-Droid build).
- Trend averages ignore nights without a value.
- Assistant page text no longer mentions uploads or internet.

## [1.0.0]

### Added
- Fully local Android sleep diary (WebView shell, bundled assets, no INTERNET permission).
- Before-bed and morning entries, history, trends, editing, foreground reminders.
- JSON backup export/import (`lull:v1` storage key and `app: "lull", version: 1` format preserved).
- Local typed-note parser (not cloud AI).
- F-Droid metadata, CI, and signed-release workflow.
