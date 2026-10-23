# Contributing

1. Use Node 24 (`nvm use` reads `.nvmrc`; 22.12+ also works), then `npm ci`.
2. `npm run dev` for the web UI, `npm run lint && npm test` before pushing.
3. Android build: see README "Android build". Releases: see [docs/RELEASING.md](docs/RELEASING.md).
4. User-facing text: wrap it in `t("...")`, add the English string to the end of `src/i18n/keys.js`,
   and append the translation at the same position in every file in `src/i18n/locales/`.
   `npm test` (`scripts/check-i18n.mjs`) fails on missing, empty, misordered-length or unused
   strings and on mismatched `{placeholders}`.

Project rules: offline only (no INTERNET permission, analytics, accounts, cloud AI), keep storage
key `lull:v1` and the backup format compatible, only record information the user reports.
Use Conventional Commits (`feat:`, `fix:`, `chore:`...).
