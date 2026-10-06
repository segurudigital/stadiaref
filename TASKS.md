# Tasks

**Project:** StadiaRef (was Seguru Debug Toolbar)
**Current version:** 3.0.0 (release candidate, not yet released)

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-10-06 (3.0.0 released)

**State:** 3.0.0 is released (2026-10-06): GitHub release `v3.0.0` with its three assets, `stadiaref@3.0.0` on npm, the demo on GitHub Pages. Done since: `@segurudigital/seguru-debug-toolbar` deprecated on npm pointing at `stadiaref`; a ruleset on `main` blocks deletion and force-pushes; npm trusted publishing set up (publish directly; dist-tags not allowed), and the release workflow publishes through it with no stored token; a Buy Me a Coffee link (unreleased: it reaches npm and the plugin readme with the next release); brand assets and the GitHub social preview in `assets/`.

**Release zips are committed again** (2026-10-06, Samuel): `dist/stadiaref-wp-v<version>.zip` and the 2.5.1 bridge zip are force-added (`git add -f`) for each release, so they can be downloaded from the repo until the plugin is in the WordPress.org directory.

**Next, for the maintainer:**
- Upload `assets/github-social-preview.png` under Settings → Social preview, if not done yet.
- After the next release publishes through trusted publishing, delete the `NPM_TOKEN` repository secret and revoke that token on npmjs.com.
- Move the notes in this file to GitHub Issues.

---

## Currently in flight

*Nothing in flight. Next scope is 3.1 (see ROADMAP.md).*

---

## 3.0.0 build

StadiaRef 3.0.0, built in stages. A new session starts at the first unticked stage. Each stage is finished, with its checks passing and its work committed, before the next one starts. `npm test` runs at the end of every stage.

- [x] **Stage 0 — Safety net.** Baseline tests against 2.5.0, test tooling, AGENTS.md and this section.
  - [x] Preconditions: tree clean; `origin/main` at the 2.5.0 commit; tag `v2.5.0` present; remote `segurudigital/stadiaref` (already renamed)
  - [x] `npm test` runs unit tests (`node --test`) and browser tests (Playwright, against both the source and `dist/`)
  - [x] Baseline tests cover every API member, every config key and script attribute, every emitted event with its detail, the D, L, T, O, F and Esc keys, `classifyDataRef()` against the v5 fixtures, label counts on `test/demo.html` in each mode, click-to-copy, `refresh()`, and `php -l` on the WordPress files
  - [x] `npm test` passes against untouched 2.5.0 source
  - [x] The commit contains only tests, tooling, `AGENTS.md` and `TASKS.md`
- [x] **Stage 1 — Modules, no behaviour change.** One state object, one `boot()`, nothing touches the DOM at import.
  - [x] Every baseline test passes unchanged
  - [x] `dist/` behaves identically on `test/demo.html` and the four v5 fixtures in a real browser (96 DOM snapshots, page and shadow root, identical to the 2.5.0 release bundle across 16 API states)
- [x] **Stage 2 — The rename, with aliases.**
  - [x] All tests pass under the new names and the old ones (`test/browser/baseline/` on 3.0 names, `test/browser/baseline-2x/` on 2.x names, `test/browser/aliases.spec.mjs` for every 2.x name)
  - [x] A page using only 2.x names (`window.seguruDebugConfig`, `seguruDebugToolbar.setDepth()`, `sdt:dataref-click`) works with one console notice
  - [x] No `sdt` or `seguru-debug` string left in `src/` outside `compat/` and history comments (`test/unit/names.test.mjs`)
  - [x] `npm run build:wp` still produces a working zip (builds and unpacks with `assets/stadiaref.min.js`, which the plugin now enqueues; not installed in a WordPress, see stage 9)
- [x] **Stage 3 — Core and profiles.**
  - [x] Unit tests for all three profiles, the core rules, the registry and the throwaway third-party profile (`test/unit/core.test.mjs`; overlay side in `test/browser/profiles.spec.mjs`)
  - [x] The v5 fixtures classify exactly as before with `profile: 'titan'`. (The one exception, the malformed `bad--ref` in `mixed.html`, was removed from the fixture on 2026-10-05: see Resolved decisions)
  - [x] `node -e "import('./dist/core.mjs')"` succeeds
- [x] **Stage 4 — Show, Auto-address, keys.**
  - [x] Every non-empty tier combination shows what it says, on authored and on automatic-only pages; `setTiers([])` shows no labels (`show-auto-keys.spec.mjs`)
  - [x] Automatic addresses stay valid, unique and unchanged across ten forced surveys
  - [x] Alias tests pass, including the five Target values and three Level values against 2.5.0 (titan profile): `legacy-vs-2.5.0.spec.mjs` runs the frozen 2.5.0 bundle and the current build on the demo page and the four fixtures and compares which elements show a label. The only difference is the intended one it lists: void-element labels now follow the filter
  - [x] Keys rebind, disable, and work with Shift held
- [x] **Stage 5 — Brand, toolbar and labels.**
  - [x] Screenshots of the toolbar (light, dark, desktop, 390px) and the sample page in each label mode, compared against the wireframe values (`toolbar.spec.mjs` attaches the screenshots to the report and checks the computed values)
  - [x] Every text and background pair at least 4.5:1 by calculation (`test/unit/contrast.test.mjs`, from `src/overlay/styles/tokens.js`; translucent backgrounds over the worst backdrop of their surface). Changes from the wireframes: menu hover is `#F9FAFB` (light) and a 6% white wash (dark) so grey notes stay at 4.5:1 or more; the active option's note uses the accent (the wireframe's grey would be 4.40:1); the cluster and block-group badges are opaque (`#FCE8DD` light, `#27272A` dark) instead of a translucent wash; the brand tip is opaque `#111827`
  - [x] Toolbar fully usable by keyboard, visible focus, accessible names and pressed/expanded state
  - [x] A hidden StadiaRef leaves the page DOM byte-identical (class converter off) — `host-page.spec.mjs`, five pages, including setters called while hidden
- [x] **Stage 6 — Pick and Find.** (`pick-find.spec.mjs`)
  - [x] Pick: pointer, arrow keys, Esc, an element with no address, clicks don't reach the host
  - [x] Find: exact, substring, no match, hidden match, keyboard navigation, shortcut letters typed into the field, dim layer clears on close
  - [x] `copied` flag in both outcomes
- [x] **Stage 7 — Apps.**
  - [x] Route change in a small SPA fixture relabels without `refresh()`
  - [x] A framework-style text update that wipes a label: label back within two frames
  - [x] `<dialog>` via `showModal()`: toolbar clickable, Find accepts typing; scripted `role="dialog"` with a focus trap; Esc closes the host dialog without hiding StadiaRef
  - [x] Touch sheet under mobile emulation; docking above a fixed bottom bar
  - [x] `<body>` swap followed by recovery; one survey per frame
- [x] **Stage 8 — Entry points and integrations.**
  - [x] Astro (7, the current major; Astro 5 dropped, see notes) and Vite projects: dev server serves StadiaRef; production output has no `data-stadiaref-root`
  - [x] A `setup` module registers a profile the overlay then uses
  - [x] `import('stadiaref')` in Node resolves and does nothing
  - [x] `npm pack --dry-run` lists only what should ship
  - [x] Types check under `strict` with `moduleResolution` `bundler` and `node16`
- [x] **Stage 9 — WordPress.**
  - [x] Both PHP files and the bridge pass `php -l`
  - [x] Both zips build and unpack to the right folder names; bridge zip name matches `^seguru-debug-toolbar-wp-v[\d.]+\.zip$`
  - [x] With a local WordPress: option copy, admin-only loading, page config wins, bridge installs over 2.5.0. Run on WordPress Playground (`npm run test:wordpress`): WordPress 7.1.2, 6.2 and 5.8, PHP 8.3 and 8.1
- [x] **Stage 10 — Docs, release pack, release candidate.**
  - [x] Every doc statement true of the built code (audited against the source; fixes listed in the stage 10 notes). No doc states a bundle size; the size budget is in `scripts/check-size.mjs`
  - [x] Scrub, community files, CI, release and Pages workflows
  - [x] Version `3.0.0` everywhere (bridge stays `2.5.1`); full CHANGELOG entry
  - [x] Clean build, full test run, release notes written

### Baseline notes (stage 0)

The baseline tests pin what the 2.5.0 code does, not what the README says. Where they differ:

| Area | 2.5.0 code | README / fixture says | Test |
|---|---|---|---|
| `sdt:ready` with a deferred script | Fires before `window.seguruDebugToolbar` is assigned | "SDT has booted and the API is callable" | `baseline-config` › deferred script |
| Events | Also emits `sdt:level-filter-change` `{ levelFilter }` | Not in the event table | `baseline-events` |
| Level filter | Labels of void elements (`<img>` etc.) live in a sibling host, so the level-filter CSS doesn't hide them | Sections only shows only sections | `baseline-classify` › void-hosted image |
| `bad--ref` in `mixed.html` | Classifies as `section` (last segment is non-numeric) | Fixture comment says unclassified | `baseline-classify` (removed from the fixture, 2026-10-05) |
| v4.0 refs | Element only when they carry a page prefix (6+ segments); bare `heading-01-01-primary` is a section | "receive `sdt-ref-class-element`" | `baseline-classify` › edge cases |
| Address chain row click | `current` in `sdt:dataref-click` is always the last row (loop `var` capture) | Not documented | `baseline-events` › chain row |
| Labels while hidden | Injected at boot even when hidden | n/a (3.0 rule 1 changes this) | `baseline-config` › labels injected at boot |
| Automatic address slug | Path-derived, unsanitised: `/test/demo.html` → `test-demo.html-03-section` | n/a (stage 4 sanitises) | `baseline-config`, `baseline-labels` |
| Tree copy button | Copies, emits no event | n/a (stage 6 adds `source: 'tree'`) | `baseline-events` › Tree row |

For stage 3: `bad--ref` broke the core rule against doubled hyphens, so under 3.0 it was `unclassified` in every profile. Resolved 2026-10-05 by removing it from the fixture.

Notes from stage 10:

- Docs copied from the 3.0 pack; `usage-guide.md`, `naming-conventions.md`, `wordpress.md`, `agent-rollout-prompt.md` and `v3-data-ref-update-prompt.md` removed. `page-builders.md`, `design.md` and `wp-settings-page.md` rewritten from what was built. `test/unit/docs.test.mjs` checks every relative link and anchor.
- Doc fixes from checking every statement against the code: Find jumps on Enter (pasting alone lists matches); Outline frames section and block *wrappers* by selector, not addressed tiers (as in 2.5.0); the chain panel opens at the opposite edge on the toolbar's side; an auto-address example (`about-us-03-h2`); the class converter turned on by `init()` while hidden converts on first show; the integrations examples call their sync function directly as well as on `stadiaref:ready` (which has already fired in module setups); the `theme` default notes the saved choice; WordPress covers only some keys; the mu-plugin is turned on with WP-CLI; the WordPress role is configurable; Astro 7; the Vite plugin is ESM only; the Next.js Pages Router path.
- Code fix from the audit: `isVisible()` returned `true` before start; it now returns `false` until StadiaRef is shown.
- The demo page is rewritten for 3.0 and shows the toolbar on load (`?hidden` starts it hidden, for tests). The fixtures use `stadiarefConfig` with the titan profile; the QA pages keep the 2.x names on purpose. The 2.5.0 comparison test maps the 3.0 config for the frozen bundle.
- `NOTICE` holds the trademark note and the Barlow (SIL OFL 1.1) credit; it ships in the npm package and the WordPress zip.
- CI (`.github/workflows/ci.yml`): build, unit and browser tests with PHP 8.1, the size budget, the integration projects, and the WordPress Playground run. The release workflow attaches the three assets and fails loudly on a missing `NPM_TOKEN` or a failed publish. `pages.yml` publishes the demo. None of the workflows have run on GitHub yet.
- Size budget: `dist/stadiaref.min.js` measured 133,027 bytes (36,964 gzipped) for 3.0.0; the budget is that plus 10%.
- "Titan" and "Seguru Titan Foundations" stay in the docs as the name of the `titan` profile's grammar, a public Seguru product.

Notes from stage 9:

- **Tested on a real WordPress** with WordPress Playground (WordPress and PHP running in Node; pinned to `@wp-playground/cli` 3.1.40, the last release that runs on Node 22). `npm run test:wordpress` drives wp-admin in a browser: 2.5.0 from its release zip, the 2.5.1 bridge uploaded over it, StadiaRef installed next to it, then the old plugin deactivated. Passed on WordPress 7.1.2, 6.2 and 5.8 (PHP 8.3) and 7.1.2 on PHP 8.1. It needs the network the first time, so it isn't part of `npm test`.
- **Not tested:** the 2.5.0 self-updater actually offering the bridge. That needs a published GitHub release with the bridge zip attached. The bridge was installed by uploading it over 2.5.0, which replaces the files the same way.
- `test/unit/wordpress.test.mjs` runs the plugin, the mu-plugin and the bridge against a small stand-in for WordPress (`test/unit/wp/harness.php`): the option copy (each mapping, once only, never over a 3.0 value), the config handover (real booleans, the page wins), role checks, no second copy next to 2.x, the bridge notice, and the zips.
- The 2.x page config `window.seguruDebugConfig` outranked the WordPress settings in 2.x. The inline handover keeps that: a key the page sets there (in its 2.x name) is left to the page. `window.stadiarefConfig` wins as the brief asks.
- The mu-plugin also runs the settings copy on the front end, as an mu-plugin site may have no admin visits.
- With the 2.x plugin (or the bridge) active, StadiaRef shows a notice and doesn't load on the front end, so the old toolbar keeps running until it is deactivated.
- The self-updater looks at `segurudigital/stadiaref`. Renaming the GitHub repo from `seguru-debug-toolbar` is the maintainer's job (GitHub redirects the old name).
- The plugin says "Tested up to: 7.1".

Core Spec (2026-10-05): written at `docs/spec/stadia-address-core.md` from the core as built (Samuel asked for it rather than supplying it). `test/unit/spec.test.mjs` checks its example table, the titan word lists, the app surfaces, the length limit and the parse shapes against `src/core`. The 3.0 docs already link to that path; stage 10 only needs to check the links resolve once the docs are copied in.

Notes from stage 8:

- **Astro 7 and later only** (Samuel, 2026-10-05: Astro is at v7, no need to support v5). The peer range is `astro >=7`; the integration was also run once on Astro 5.18 before that decision and passed. The 3.0 docs still say "Needs Astro 5 or later" (`install/astro.md`): change that when the docs are copied in at stage 10. Vite's peer range stays `>=5`; tested on Vite 8.3.
- **ESM only.** `stadiaref`, `stadiaref/core`, `stadiaref/vite` and `stadiaref/astro` are ES modules with no CommonJS build. Stage 10: say so in `install/vite.md` (a CommonJS `vite.config.js` can't import the plugin), as the brief asks.
- The integration checks need the network (they install Vite, Astro and TypeScript), so they are `npm run test:integration`, not part of `npm test`. Each run packs the repo and installs the tarball, so they test what would be published.
- Astro 7 backgrounds `astro dev` when it detects an agent; the runner passes `--ignore-lock` to keep it in the foreground.
- The Astro host has no hooks (Samuel, 2026-10-05: site code mustn't be able to reach into StadiaRef). The overlay decides for itself: it uses the Astro host when Astro's Dev Toolbar holds the app canvas the integration registers (`data-app-id="stadiaref"`), and draws its panel into that canvas. The app's `init()` only fires a `stadiaref:astro-app` event so the overlay looks again; it hands nothing over. No symbols or methods on the API, nothing in config; tests check both. Without the integration, Astro's Dev Toolbar alone doesn't hide the floating toolbar.
- The panel is drawn as soon as the canvas exists, even while StadiaRef is hidden: it lives in Astro's own canvas, not the page, so rule 1 isn't affected.
- Using a panel control (Labels, Show, Outline, Pick, Find, Tree) shows StadiaRef if it is hidden. Opening the panel alone doesn't.
- Both integrations exclude `stadiaref` and `stadiaref/core` from Vite's dependency pre-bundling. Without that, the first page load after install reloads once, and pre-bundling could give the overlay and a setup module's `stadiaref/core` import separate registries.
- `types/` checks: `check.ts` against the real Vite and Astro types with `skipLibCheck` on (Astro's own types need it), plus StadiaRef's `.d.ts` files alone with `skipLibCheck` off against small stand-ins. TypeScript 7.0.

Notes from stage 7:

- The baseline test "refresh() picks up nodes added after boot" pinned 2.5.0's lack of a childList observer. It now runs with `watch: false` (the 2.5.0 behaviour), and a twin checks that with watch on the new node is labelled without `refresh()`. Both naming schemes.
- The old body-only visibility observer and the `load` re-scan's own survey are folded into the one watcher; the `load` re-scan now calls `survey()`.
- On a phone, a page wider than the viewport widens the layout viewport, and a fixed toolbar sits at the bottom of that, below the visible area. That is how fixed elements behave on such pages, not something StadiaRef can fix; the touch test makes the sample cards fit.
- Touch: Pick uses the sheet and never needs hover. The icon tooltip and the address chain still open on hover; on touch a tap on a label copies it, as before.

Left for later stages on purpose (stage 4):

- Keys P and / are in the keymap but do nothing until Pick and Find exist (stage 6). Esc already calls the hook Pick and Find will use.
- The Show menu and AUTO chip use the 2.5 toolbar styles with the wireframe's tick-box and chip values. Stage 5 restyles the toolbar as a whole.
- The frozen 2.5.0 script now lives at `wordpress/bridge/assets/seguru-debug-toolbar.min.js` (byte-identical to the v2.5.0 release asset). Stage 9's bridge uses it.

Left for later stages on purpose (stage 2):

- (Done in stage 10.) The release workflow, the README and docs, the demo page and the fixtures were moved to the 3.0 names.
- The 2.x copy of the baseline differs from the stage 0 originals only where 3.0 has no alias (CSS classes, internal attributes, ids, storage key) and in two intended fixes: the global now exists when a deferred script fires `ready`, and `init()` applies every config key.

For stage 10: the v5 fixtures' page codes looked like they came from a real project. Done in stage 10: they are now `home-` and `team-v2-`, in `expected-2.5.0.json` too.

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Per-page override key is `seguruDebugConfig`, not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` |
| 2026-04-10 | Orange `#EA580C` for UI accent; Seguru blue `#00C0F3` reserved for the S mark badge | Brand guidelines: orange is functional, blue is the brand mark only (3.0: the mark is the orange StadiaRef icon) |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps Tree adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold `0.40` for `sdt-on-dark` | Validated visually — anything below 40% relative luminance reads as dark enough to warrant white labels |
| 2026-04-11 | Tree panel search/filter deferred after Phase 5 | Header context, click-to-jump, and improved row rhythm solved the readability problem without adding UI weight |
| 2026-04-26 | WP plugin keeps `sdt_auto_ref` default at `'0'` (admin opt-in) even when the engine default changed in v2.3.0 | Safer for large WP sites — admins explicitly opt in via Settings → Debug Toolbar → Page Builders. Superseded by the v2.4.1 engine default-off decision below. |
| 2026-05-23 | SDT engine auto-ref defaults OFF again; when enabled, Target defaults to All | Keeps standard embeds and WordPress installs opt-in while still supporting full-coverage scans for explicit QA sessions. |
| 2026-04-26 | Public API: `setDepth()` / `getDepth()` keep their names even though the UI label is now "Target" | Back-compat — these methods are documented since v1.3.0 and used by external consumers |
| 2026-04-26 | User-pill avatar uses neutral slate (`#111827` light / `#71717A` dark), not Seguru blue | The badge stays the only Seguru-blue anchor in the toolbar; avatar reads as identity, not brand |
| 2026-04-26 | Esc is a global one-shot hide, not a 3-step cycle | Simpler mental model — one keystroke, page is clean |
| 2026-10-05 | The malformed `bad--ref` address is removed from the `mixed.html` fixture; the core rule against doubled hyphens stands in every profile | It added nothing to the fixture, and it was the only address whose tier changed under 3.0 |
| 2026-10-05 | The colour changes from the wireframes made for contrast (menu hover, active option note, opaque badges and brand tip, dark dialog status line) are approved | Legibility: every text pair passes 4.5:1 |
| 2026-10-05 | Astro integration supports Astro 7 and later only (`astro >=7`) | Astro 7 is current; 5 is two majors old |
| 2026-10-05 | No host hooks on the API; the overlay finds its own app canvas in Astro's Dev Toolbar | Site code must not be able to reach into StadiaRef |
| 2026-10-05 | The Stadia Address core spec (`docs/spec/stadia-address-core.md`) is written in this build, from the core as built | Samuel asked for it to be written rather than supplied |

---

## Blocked / waiting

None.
