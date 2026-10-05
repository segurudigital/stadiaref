# Tasks

**Project:** Seguru Debug Toolbar
**Current version:** 2.5.0 (3.0.0 in progress)

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-10-05 (3.0.0 build, stage 0)

**State before this session:** v2.5.0 released (tag `v2.5.0` on `5805bc5`, GitHub release with both assets).

See the "3.0.0 build" section below for what was done and where to start.

---

## Currently in flight

*3.0.0 build. Package version stays at the current number until stage 2 sets `3.0.0-dev`, and `3.0.0` only at stage 10.*

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
  - [x] The v5 fixtures classify exactly as before with `profile: 'titan'`, with one exception raised for a decision: `bad--ref` in `mixed.html` breaks the core rule against doubled hyphens, so it is `unclassified` (brief 5.5: invalid addresses are unclassified in every profile), where 2.5.0 said `section`. `classifyDataRef()` still says `section`
  - [x] `node -e "import('./dist/core.mjs')"` succeeds
- [x] **Stage 4 — Show, Auto-address, keys.**
  - [x] Every non-empty tier combination shows what it says, on authored and on automatic-only pages; `setTiers([])` shows no labels (`show-auto-keys.spec.mjs`)
  - [x] Automatic addresses stay valid, unique and unchanged across ten forced surveys
  - [x] Alias tests pass, including the five Target values and three Level values against 2.5.0 (titan profile): `legacy-vs-2.5.0.spec.mjs` runs the frozen 2.5.0 bundle and the current build on the demo page and the four fixtures and compares which elements show a label. The only differences are the two intended ones it lists: void-element labels now follow the filter, and `bad--ref` is unclassified
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
- [ ] **Stage 9 — WordPress.**
  - [ ] Both PHP files and the bridge pass `php -l`
  - [ ] Both zips build and unpack to the right folder names; bridge zip name matches `^seguru-debug-toolbar-wp-v[\d.]+\.zip$`
  - [ ] With a local WordPress: option copy, admin-only loading, page config wins, bridge installs over 2.5.0. Without one: reported as untested
- [ ] **Stage 10 — Docs, release pack, release candidate.**
  - [ ] Every doc statement true of the built code; bundle size filled in
  - [ ] Scrub, community files, CI, release and Pages workflows
  - [ ] Version `3.0.0` everywhere (bridge stays `2.5.1`); full CHANGELOG entry
  - [ ] Clean build, full test run, release notes written

### Baseline notes (stage 0)

The baseline tests pin what the 2.5.0 code does, not what the README says. Where they differ:

| Area | 2.5.0 code | README / fixture says | Test |
|---|---|---|---|
| `sdt:ready` with a deferred script | Fires before `window.seguruDebugToolbar` is assigned | "SDT has booted and the API is callable" | `baseline-config` › deferred script |
| Events | Also emits `sdt:level-filter-change` `{ levelFilter }` | Not in the event table | `baseline-events` |
| Level filter | Labels of void elements (`<img>` etc.) live in a sibling host, so the level-filter CSS doesn't hide them | Sections only shows only sections | `baseline-classify` › void-hosted image |
| `bad--ref` in `mixed.html` | Classifies as `section` (last segment is non-numeric) | Fixture comment says unclassified | `baseline-classify` |
| v4.0 refs | Element only when they carry a page prefix (6+ segments); bare `heading-01-01-primary` is a section | "receive `sdt-ref-class-element`" | `baseline-classify` › edge cases |
| Address chain row click | `current` in `sdt:dataref-click` is always the last row (loop `var` capture) | Not documented | `baseline-events` › chain row |
| Labels while hidden | Injected at boot even when hidden | n/a (3.0 rule 1 changes this) | `baseline-config` › labels injected at boot |
| Automatic address slug | Path-derived, unsanitised: `/test/demo.html` → `test-demo.html-03-section` | n/a (stage 4 sanitises) | `baseline-config`, `baseline-labels` |
| Tree copy button | Copies, emits no event | n/a (stage 6 adds `source: 'tree'`) | `baseline-events` › Tree row |

For stage 3: `bad--ref` breaks the core rule against doubled hyphens, so under 3.0 it is `unclassified` in every profile, including titan. That is the one fixture address whose class changes. Raise it at stage 3 (brief, decision 2).

Notes from stage 8:

- **Astro 7 and later only** (Samuel, 2026-10-05: Astro is at v7, no need to support v5). The peer range is `astro >=7`; the integration was also run once on Astro 5.18 before that decision and passed. The 3.0 docs still say "Needs Astro 5 or later" (`install/astro.md`): change that when the docs are copied in at stage 10. Vite's peer range stays `>=5`; tested on Vite 8.3.
- **ESM only.** `stadiaref`, `stadiaref/core`, `stadiaref/vite` and `stadiaref/astro` are ES modules with no CommonJS build. Stage 10: say so in `install/vite.md` (a CommonJS `vite.config.js` can't import the plugin), as the brief asks.
- The integration checks need the network (they install Vite, Astro and TypeScript), so they are `npm run test:integration`, not part of `npm test`. Each run packs the repo and installs the tarball, so they test what would be published.
- Astro 7 backgrounds `astro dev` when it detects an agent; the runner passes `--ignore-lock` to keep it in the foreground.
- The Astro host hooks sit on the API object under `Symbol.for('stadiaref.hostMode')` and `Symbol.for('stadiaref.astroHost')`: not config, not listed by `Object.keys()`. A test checks config can't reach them.
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

- `.github/workflows/release-assets.yml` still attaches `dist/seguru-debug-toolbar.min.js`, which no longer exists. Stage 10 rewrites the release workflow with the new asset names.
- `README.md` and `docs/` still describe 2.x. Stage 10 replaces them.
- `test/demo.html`, the QA pages and the v5 fixtures still use 2.x names (`seguruDebugConfig`, `sdt:*`, `../src/seguru-debug-toolbar.js`). The test server serves the current build for that path, so they double as 2.x pages until stage 10 moves them to the new names.
- The 2.x copy of the baseline differs from the stage 0 originals only where 3.0 has no alias (CSS classes, internal attributes, ids, storage key) and in two intended fixes: the global now exists when a deferred script fires `ready`, and `init()` applies every config key.

For stage 10: the v5 fixtures use page codes (`hf-`, `mpt-v2-`) that look like they came from a real project. Rename them, and `expected-2.5.0.json` with them.

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Per-page override key is `seguruDebugConfig`, not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` |
| 2026-04-10 | Orange `#EA580C` for UI accent; Seguru blue `#00C0F3` reserved for the S mark badge | Brand handbook §10 — orange = functional, blue = brand mark only |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps Tree adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold `0.40` for `sdt-on-dark` | Validated visually — anything below 40% relative luminance reads as dark enough to warrant white labels |
| 2026-04-11 | Tree panel search/filter deferred after Phase 5 | Header context, click-to-jump, and improved row rhythm solved the readability problem without adding UI weight |
| 2026-04-26 | WP plugin keeps `sdt_auto_ref` default at `'0'` (admin opt-in) even when the engine default changed in v2.3.0 | Safer for large WP sites — admins explicitly opt in via Settings → Debug Toolbar → Page Builders. Superseded by the v2.4.1 engine default-off decision below. |
| 2026-05-23 | SDT engine auto-ref defaults OFF again; when enabled, Target defaults to All | Keeps standard embeds and WordPress installs opt-in while still supporting full-coverage scans for explicit QA sessions. |
| 2026-04-26 | Public API: `setDepth()` / `getDepth()` keep their names even though the UI label is now "Target" | Back-compat — these methods are documented since v1.3.0 and used by external consumers |
| 2026-04-26 | User-pill avatar uses neutral slate (`#111827` light / `#71717A` dark), not Seguru blue | The badge stays the only Seguru-blue anchor in the toolbar; avatar reads as identity, not brand |
| 2026-04-26 | Esc is a global one-shot hide, not a 3-step cycle | Simpler mental model — one keystroke, page is clean |

---

## Blocked / waiting

None.
