# Contributing

1. Use Node 22.12+ (`nvm use`), then `npm ci`.
2. `npm run dev` for the web UI, `npm run lint && npm test` before pushing.
3. Android build: see README "Android build". Releases: see [docs/RELEASING.md](docs/RELEASING.md).

Project rules: offline only (no INTERNET permission, analytics, accounts, cloud AI), keep storage
key `lull:v1` and the backup format compatible, only record information the user reports.
Use Conventional Commits (`feat:`, `fix:`, `chore:`...).
