## Dependency and import conventions

- When adding packages to `package.json`, use the latest available version and pin the exact version (no `^` or other range prefixes).
- Source imports should use the repo alias with explicit TypeScript extensions, e.g. `#/renderer/stores/i18n.ts` or `#/main/settings.ts`.
