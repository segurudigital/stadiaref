# StadiaRef — agent context

**Version:** 3.0.0
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

1. Bump the version in every location above, commit, push to `main`.
2. Publish a GitHub release tagged `v<version>` (it must match `package.json`), with the notes in `RELEASE_NOTES.md`.
3. `.github/workflows/release-assets.yml` builds and attaches `stadiaref.min.js`, `stadiaref-wp-v<version>.zip` and the bridge `seguru-debug-toolbar-wp-v2.5.1.zip`, then publishes `stadiaref` to npm through npm trusted publishing (no stored token; the trusted publisher on npmjs.com names this workflow), with provenance. A failed publish fails the job.
4. Re-run for an existing tag with `gh workflow run release-assets.yml -f tag=v<version>`.

WordPress installs see a new release when the `stadiaref_github_release` transient expires (six hours).

---

## Commands

```bash
npm run build             # everything in dist/
npm run dev               # rebuild the overlay on change (dist/stadiaref.js)
npm test                  # build, unit tests, browser tests
npm run size              # bundle-size budget
npm run test:integration  # Vite, Astro 7, types (needs the network the first time)
npm run test:wordpress    # WordPress plugin on WordPress Playground (needs the network)
npm run build:wp          # dist/stadiaref-wp-v<version>.zip
npm run build:wp-bridge   # dist/seguru-debug-toolbar-wp-v2.5.1.zip
```

---

## Guardrails

- **The `data-ref` attribute and the `dataref-` class prefix never change.**
- **No runtime dependencies, no network requests.** The overlay ships as one file. Source may use modules and modern syntax; esbuild bundles it.
- **Nothing is written to the page while StadiaRef is hidden** (class converter aside). The host and the label stylesheet are created on first show.
- **No state on the page's own elements.** Per-element state lives in a `WeakMap` (`records.js`) and on StadiaRef's own nodes; global state is `data-stadiaref-*` attributes on `<html>`. Exceptions: `position: relative` on a static element that gets labels, and an automatic address's `data-ref` with its `data-stadiaref-auto` markers.
- **Shadow DOM split.** The toolbar, panels and toast are in a shadow root; labels are in the page's DOM (moving them to an overlay layer is planned for 3.1, not before).
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
- **Watching:** route changes, re-renders and new content are surveyed at most once per frame; labels a re-render deletes come back.
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
