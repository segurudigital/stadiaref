# Tasks

**Project:** Seguru Debug Toolbar
**Current version:** 2.5.0

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-10-05 (v2.5.0 close-out)

**What was done:**

- Committed the v2.5.0 source that had been sitting uncommitted since 2026-09-02: void-element label hosts, so refs on `<img>`, `<video>`, `<input>`, `<iframe>` and `<canvas>` are visible. See `CHANGELOG.md [2.5.0]`.
- Finished the version bump. `package.json` and the source were already at 2.5.0; both WordPress plugin files were still at 2.4.1 and are now 2.5.0 (`Version:` header and `SDT_VERSION`).
- Rebuilt `dist/seguru-debug-toolbar.min.js` (76,037 bytes) and `dist/seguru-debug-toolbar-wp-v2.5.0.zip`.

**Where things were left:**

- `node --check src/seguru-debug-toolbar.js`, `npm run build` and `npm run build:wp` pass. The Playwright QA harness was not re-run for this release.
- Committed to `main`. Not pushed, not tagged, not released.

**Next session should:**

1. Push `main` and publish GitHub release `v2.5.0`. The release workflow attaches the assets and publishes to npm.
2. Confirm `@segurudigital/seguru-debug-toolbar@2.5.0` is on npm. The publish job is `continue-on-error`, so a bad token fails quietly.
3. Start 3.0.0, where the project is renamed StadiaRef.

---

## Currently in flight

*v2.5.0 committed, release pending. Next sprint is 3.0.0.*

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
