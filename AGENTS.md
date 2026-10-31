# StadiaRef — agent context

**Version:** 3.3.0
**Repo:** https://github.com/segurudigital/stadiaref
**Maintained by:** Seguru Digital (hello@seguru.digital)
**License:** MIT (see `LICENSE` and `NOTICE`)

---

## What this project is

StadiaRef gives every part of the screen an address. It shows `data-ref` attributes as labels you can point at and copy, for websites, web apps and PWAs. Used for wireframe QA, design review, client feedback and debugging. It ships as a script tag, an npm package (with a Vite plugin and an Astro integration) and a WordPress plugin. It was called Seguru Debug Toolbar until 2.5.0; every 2.x name still works.

---

## Tech stack

| Layer | Tech |
|---|---|
| Source | Plain JavaScript ES modules in `src/`. No framework, no runtime dependencies |
| Build | esbuild, `scripts/build.mjs` |
| Types | Hand-written `.d.ts` in `types/` |
| WordPress | PHP 8.1+, WordPress 5.8+ |
| Tests | `node --test` (unit), Playwright (browser), integration projects for Vite, Astro and WordPress Playground |

---

## File structure

```
src/
  core/                 stadiaref/core: the rules, the generic/app/titan profiles, the registry. No DOM
  overlay/              the overlay, one module per area
    index.js            script-tag entry (dist/stadiaref.min.js)
    module.js           ES module entry (dist/index.mjs); imports ./core.mjs
    start.js            starts once; never twice on a page
    boot.js             load-time work; init() at DOMContentLoaded
    state.js            the one mutable state object
    mount.js            nothing written while hidden; survey()
    watch.js            the MutationObserver, one survey per frame, self-repair
    layer.js            the overlay layer: one slot per element, placed over its box
    labels.js tiers.js survey.js pick.js find.js dialogs.js dock.js tree.js chain.js
    toolbar.js panel.js host.js keys.js theme.js user.js events.js …
    styles/             CSS as strings; tokens.js holds every colour
  compat/aliases.js     every 2.x name, and nothing else
  integrations/         the Vite plugin, the Astro integration and its Dev Toolbar app
types/                  index.d.ts, core.d.ts, vite.d.ts, astro.d.ts
dist/                   built output (never edit): stadiaref.min.js, index.mjs, core.mjs, vite.mjs, astro.mjs, astro-app.mjs
wordpress/
  stadiaref/stadiaref.php   the WordPress plugin
  stadiaref.php             the mu-plugin
  bridge/                   Seguru Debug Toolbar 2.5.1 for sites still on 2.x (frozen 2.5.0 script)
scripts/                build.mjs, build-wp-zip.sh, build-wp-bridge.sh, check-size.mjs
docs/                   user docs; docs/spec/ is the Stadia Address core spec
test/
  unit/                 node --test
  browser/              Playwright, run against the source and against dist/
  integration/          Vite, Astro 7 and types projects (run.mjs); wordpress/ on WordPress Playground
  fixtures/             Titan-grammar fixture pages
  demo.html             the demo page, also published to GitHub Pages
  support/server.mjs    the test server
```

---

## Session protocol

### Start
1. `git status`: the tree should be clean.
2. Read this file, then **TASKS.md** (open work), **ROADMAP.md** (what's next) and **CHANGELOG.md** (what shipped).
3. `git log --oneline -5`

TASKS.md, ROADMAP.md and CHANGELOG.md must agree at the start and end of every session.

### During
- TASKS.md is the record of open work. Add anything new there before doing it, and tick items as they finish.

### End
1. TASKS.md: what's done is ticked; what's open is carried forward.
2. CHANGELOG.md: an entry under `[Unreleased]` for each user-facing change.
3. ROADMAP.md: updated if scope moved.
4. `npm test`, then commit.

Don't push, tag, release or publish. The maintainer does that.

---

## Version locations

When the version changes, update all of these:

1. `package.json` → `version`
2. `src/overlay/constants.js` → `VERSION`
3. `wordpress/stadiaref/stadiaref.php` → `Version:` header and `STADIAREF_VERSION`
4. `wordpress/stadiaref.php` → `Version:` header and the `stadiaref_migrated_2x` value
5. `CHANGELOG.md` → move `[Unreleased]` under a new version heading

`test/unit/wordpress.test.mjs` checks the WordPress files against `package.json`. The 2.5.1 bridge in `wordpress/bridge/` keeps its version; it is never rebuilt from 3.x source.

---

## Release flow

For reference; the maintainer does this.

CI runs locally, not on GitHub Actions (from 3.3.0).

1. Bump the version in every location above, run the full `npm run ci:local`, commit, push to `main`.
2. Build the release files from a clean clone of the release commit, as `.github/workflows/release-assets.yml` does: `npm ci`, `npm run build`, `npm run size`, `npm run build:wp`, `npm run build:wp-bridge`, `npm pack --ignore-scripts`.
3. Publish a GitHub release tagged `v<version>` (it must match `package.json`), with the notes in `RELEASE_NOTES.md` and the three assets attached: `stadiaref.min.js`, `stadiaref-wp-v<version>.zip` and the bridge `seguru-debug-toolbar-wp-v2.5.1.zip`.
4. Publish the packed `stadiaref-<version>.tgz` to npm from the maintainer's own npm login. npm trusted publishing (and provenance) only works from the Actions workflow, which isn't used.
5. Then pin the CDN examples and their SRI hash to the new version (from the file on npm), and force-add the release's `dist/stadiaref-wp-v<version>.zip`.

WordPress installs see a new release when the `stadiaref_github_release` transient expires (six hours).

---

## Commands

```bash
npm run build             # everything in dist/
npm run dev               # rebuild the overlay on change (dist/stadiaref.js)
npm test                  # build, unit tests, browser tests
npm run size              # bundle-size budget
npm run ci:local          # CI's gates here, in CI's order (--quick, --from <step>, --list)
npm run test:integration  # Vite, Astro 7, types (needs the network the first time)
npm run test:wordpress    # WordPress plugin on WordPress Playground (needs the network)
npm run build:wp          # dist/stadiaref-wp-v<version>.zip
npm run build:wp-bridge   # dist/seguru-debug-toolbar-wp-v2.5.1.zip
```

---

## Guardrails

- **CI runs locally first.** `npm run ci:local -- --quick` before every commit you hand over for a push; the full `npm run ci:local` when a change touches the browser behaviour, the integrations, the WordPress plugin or dependencies, and before a release. GitHub Actions is not used: the local run is the CI result. The secret scan and the demo-page build exist only as workflows, so run TruffleHog by hand before a release if it matters.
- **The `data-ref` attribute and the `dataref-` class prefix never change.**
- **No runtime dependencies, no network requests.** The overlay ships as one file. Source may use modules and modern syntax; esbuild bundles it.
- **Nothing is written to the page while StadiaRef is hidden** (class converter aside). The host and its overlay layer are created on first show.
- **No state on the page's own elements.** Per-element state lives in a `WeakMap` (`records.js`) and on StadiaRef's own nodes; global state is `data-stadiaref-*` attributes on `<html>`. Exceptions: an automatic address's `data-ref` with its `data-stadiaref-auto` markers, and the `--stadiaref-tree-w` custom property on `<html>` with `tree: 'push'`.
- **Everything drawn is in the shadow root.** The toolbar, panels, toast and card, and, since 3.4, labels, badges and outline frames, which are drawn in the overlay layer (`layer.js`): one slot per element, placed over its box. Nothing is appended to the page's elements, and no stylesheet goes into the page.
- **The shadow host carries `data-stadiaref-root`**, the marker a production build is searched for. It appears in the overlay builds and nowhere else.
- **Config merge order, per key:** `init()` and the setters, then `window.stadiarefConfig`, then the 2.x objects (`seguruDebugConfig`, then `sdtConfig`), then script-tag attributes, then defaults. See `readConfig()` in `src/overlay/config.js`.
- **2.x names live in `src/compat/aliases.js` only**, each with a test. `test/unit/names.test.mjs` fails if one appears elsewhere in `src/`.
- **The brand is permanent.** No option removes the icon or the logotype.
- **No hooks for the host page.** The Astro host is decided from the page (the integration's app canvas), not by a call or a config key.
- **Every colour pair passes 4.5:1**; add new pairs to `tokens.js`.
- **The bundle stays within budget** (`scripts/check-size.mjs`).
- **WordPress PHP stays 8.1+.**

---

## Git conventions

- Commit to `main`. Stage files by name, never `git add .` or `git add -A`.
- Never commit `docs/_internal/`.
- One commit per coherent step; Conventional Commits (`feat(find): …`, `fix(labels): …`, `docs: …`).
- Don't push, tag, release, publish or change GitHub settings.
- The repo is public: no client names, client URLs, internal paths or internal project names in any file. Example addresses use neutral names (`home-hero`, `ops-app-jobs`).

---

## Key behaviours to preserve

- **Keys** (one keymap, each rebindable or `false`): D toggles StadiaRef, L cycles labels (Off → Icons → Full), 1 2 3 toggle sections, blocks and elements in Show, P Pick, / Find, O cycles Outline (Off → Sections → Blocks), Esc hides. Keys match `event.key` (Shift allowed), ignore typing targets (from `composedPath()[0]`) and Cmd, Ctrl or Alt.
- **Esc:** leaves Pick or Find first; otherwise is left to an open modal of the host page; otherwise closes menus, the Tree and the chain and hides StadiaRef in one press.
- **Click any label** to copy the address; `stadiaref:address-click` carries `source` and `copied`.
- **Watching:** route changes, re-renders and new content are surveyed at most once per frame; slots follow scrolling, resizing and layout shifts at most once per frame.
- **Dialogs:** labels narrow to an open host modal, a status line counts them, and the host moves into the modal.
- **Automatic addresses** are valid, numbered from a counter, and stable per element for the page view; they never change an authored address's tier.

---

## Docs

User docs are in `docs/`. Change the doc in the same commit as the behaviour.

| Changed | Update |
|---|---|
| A key, a control or a panel | `docs/using-the-toolbar.md` |
| A config key, method or event | `docs/api.md` |
| Profiles or the rules | `docs/addressing.md`, `docs/spec/stadia-address-core.md` |
| App behaviour | `docs/apps-and-pwas.md` |
| An install path | `docs/install/` |
| WordPress | `docs/install/wordpress.md`, `docs/wp-settings-page.md` |
| Page builders | `docs/page-builders.md` |
| Colours or layout | `docs/design.md`, `src/overlay/styles/tokens.js` |
| A 2.x name | `docs/migrating-from-2.x.md` |
