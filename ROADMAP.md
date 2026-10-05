# Roadmap

Where StadiaRef is going. This is a direction, not a promise: what ships is recorded in [CHANGELOG.md](CHANGELOG.md), and the work in flight is in [TASKS.md](TASKS.md).

## 3.0.0 — the release candidate

Seguru Debug Toolbar becomes **StadiaRef**, and gains what it needs to work in apps as well as websites.

- [x] **The rename.** Package `stadiaref`, global `window.stadiaref`, `stadiaref:*` events. Every 2.x name keeps working through 3.x.
- [x] **Profiles.** `generic` (the default, tiers from nesting), `app` and `titan`, and `registerProfile()` for your own grammar. The same rules in Node through `stadiaref/core`, described in the [Stadia Address core spec](docs/spec/stadia-address-core.md).
- [x] **Show.** One control for which tiers are drawn, with keys 1, 2 and 3. **Auto-address** is a single setting, with dashed AUTO labels.
- [x] **Labels coded by tier**, each with a dark-surface version, and every colour pair at 4.5:1 or more.
- [x] **Pick and Find** on the toolbar, with keys P and /.
- [x] **Apps.** Labels follow route changes and re-renders, narrow to an open dialog, and work by touch; the toolbar keeps clear of safe areas and tab bars.
- [x] **Entry points.** `import 'stadiaref'`, `stadiaref/core`, a Vite plugin and an Astro integration with a Dev Toolbar app. Types for all four.
- [x] **WordPress.** The plugin renamed to StadiaRef, with 2.x settings carried over and an Address profile setting, and a final 2.5.1 release of the old plugin that points sites to StadiaRef.
- [x] **Release pack.** New docs, CI, community files, the demo page on GitHub Pages.

## 3.1 — safe inside any app, and one address fast

- **One overlay layer for labels.** In 3.0 labels are drawn inside the page's own elements, which a framework re-render can disturb. 3.1 draws them in one layer of StadiaRef's own, positioned from each element's box, so StadiaRef changes nothing in the page at all. This removes the void-element workaround and the label re-mounting after re-renders.
- **Problems in the Tree:** duplicated addresses, unclassified addresses and gaps in numbering, in their own tab.
- **Tree search and filter.**
- **Copy for a developer or an agent:** the address, its tier, the page URL, the chain of addresses around it and the element's tag, as one block of text.
- **An `onAddress(address, context)` hook,** with examples for GitHub Issues and Linear. StadiaRef still stores nothing itself.
- **Drill-down:** narrow the view to one section or block, with a breadcrumb of where you are. Built on the overlay layer, behind a config flag first.

## 3.2 — reach

- **`npx stadiaref audit <path or URL>`:** the address inventory, duplicates and grammar check from the command line, for CI.
- **A browser extension,** so StadiaRef can run on any page, including production sites with no plugin and screens with no build change.
- **Shopify sections and `extraSelectors`:** recognise `.shopify-section` wrappers in auto-address, and let a project add its own section patterns.

## Later

- **WordPress.org.** Submit the plugin to the directory once 3.0 has settled, with its banner, icon and screenshots.

Releases before 3.0 are in [CHANGELOG.md](CHANGELOG.md).
