# Contributing to StadiaRef

Thanks for helping. Issues and pull requests are welcome.

## Before you start

- **Bugs:** open an issue with the page or a small reproduction, what you expected and what happened, and your browser. The [bug report form](.github/ISSUE_TEMPLATE/bug_report.yml) asks for each of these.
- **Features:** open an issue first so we can agree the shape before you write code. [ROADMAP.md](ROADMAP.md) shows what is already planned.
- **Security problems:** don't open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need Node.js 22 or later. PHP 8.1 or later is optional; without it the PHP checks are skipped.

```bash
npm ci
npx playwright install chromium
npm test
```

`npm test` builds everything, then runs the unit tests (`node --test`) and the browser tests (Playwright, once against the source and once against `dist/`).

Two more suites need the network the first time, because they install Vite, Astro and WordPress Playground:

```bash
npm run test:integration   # the Vite plugin and the Astro integration, the types
npm run test:wordpress     # the WordPress plugin on WordPress Playground
```

## Where things are

| Path | What |
|---|---|
| `src/core/` | `stadiaref/core`: the address rules and profiles. No DOM |
| `src/overlay/` | The overlay, one module per area |
| `src/compat/aliases.js` | Every 2.x name, and nothing else |
| `src/integrations/` | The Vite plugin and the Astro integration |
| `types/` | Hand-written TypeScript types for the four entry points |
| `wordpress/` | The WordPress plugin, the mu-plugin and the 2.5.1 bridge |
| `docs/` | The documentation |
| `test/` | Unit, browser and integration tests, fixtures, the demo page |

## Rules the code keeps

- The `data-ref` attribute and the `dataref-` class prefix never change.
- No runtime dependencies. The overlay ships as one file, `dist/stadiaref.min.js`.
- No network requests at runtime: no fonts, no remote images, no analytics.
- StadiaRef starts hidden, and writes nothing to the page until it is first shown.
- Every 2.x name keeps working through 3.x, with a test. 2.x names live in `src/compat/aliases.js` only; a unit test fails if one appears elsewhere in `src/`.
- The brand can't be switched off by any option.
- Every text colour passes 4.5:1 contrast; `test/unit/contrast.test.mjs` checks each pair in `src/overlay/styles/tokens.js`.
- The bundle stays within its size budget (`npm run size`).

## Pull requests

- One change per pull request, with tests. A bug fix comes with a test that fails without it.
- Update the docs in `docs/` and add a line to `CHANGELOG.md` under `[Unreleased]` when behaviour changes.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `fix(labels): …`, `feat(find): …`, `docs: …`.
- Example addresses in code, docs and tests use neutral names such as `home-hero` or `ops-app-jobs`.

By contributing you agree that your contribution is licensed under the MIT License.
