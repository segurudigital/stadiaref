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

## 3.1.0 — Signal Lime

- [x] **StadiaRef's own colour.** The icon, labels, toolbar, panels, the WordPress settings page and the brand graphics move from orange to Signal Lime `#A3E635`, with black text on lime and Lime Ink `#3F6212` where lime would be text on a light surface. Focus rings use Seguru's focus colours. Every pair still passes 4.5:1.
- [x] **WordPress.org graphics:** the plugin icon and banner, ready for the directory listing.

## 3.2.0 — Titan lists, loops and forms; security hardening

- [x] **The `titan` profile reads lists, loops and forms:** the `list` element noun (Titan's list rule) and the `loop` and `form` slot wrappers (Titan data-ref 5.3), in core spec 1.1. They were shown as sections or unclassified.

- [x] **Runtime inputs:** close inherited-key vocabulary matches, support SVG/MathML class conversion, and minimise reviewer identity to its two display fields.
- [x] **Distribution trust:** exact CDN versions with SRI; WordPress release name, URL and SHA-256 binding; esbuild updated past its advisory.
- [x] **Least-privilege delivery:** unprivileged release and Pages builds, prebuilt npm publication, immutable action pins, dependency auditing and full-history secret scanning.

## 3.3.0 — the address card, and one address fast

Turn StadiaRef on and click something: that is where its value is (UI Master spec 1.5, RF-023).

- [x] **The address card.** A label click opens a card beside it: the address, tier, text, the addresses above and inside it, the host's rows (`setLookup()`), and Copy, Copy for a brief, Parent and Show in Tree. `click: 'copy'` keeps 3.2's click to copy.
- [x] **Inspect in Pick:** a click anywhere in Pick opens the card for the pick target.
- [x] **Tree push mode:** `tree: 'push'`, with `--stadiaref-tree-w` and `stadiaref:tree` so the page can make room.
- [x] **The toolbar in your own chrome:** `dock: 'host'` with `mount`.
- [x] **Hover hint with labels off.**
- [x] **Problems in the Tree:** duplicated addresses, unclassified addresses and gaps in numbering, in their own tab.
- [x] **Tree search and filter.**
- [x] **Copy for a developer or an agent:** **Copy for a brief** on the card (page, viewport width, address, tier, text), and the fuller context (chain, tag, URL) handed to `onAddress()`.
- [x] **An `onAddress(address, context)` hook,** with examples for GitHub Issues and Linear. StadiaRef still stores nothing itself.
- [x] **Drill-down:** narrow the view to one section or block, with a breadcrumb of where you are. Behind `drill: true` first. Built on the in-page labels for now.

## 3.4.0 — safe inside any app

- [x] **One overlay layer for labels.** Since 3.0 labels were drawn inside the page's own elements, which a framework re-render could disturb. 3.4 draws them in one layer of StadiaRef's own, positioned from each element's box, so StadiaRef changes nothing in the page while it is shown. The void-element workaround and the label re-mounting after re-renders are gone. Labels stay clipped inside scroll containers, step aside under the page's fixed UI, and sit on top of modal dialogs and popovers.
- [x] **Drill-down out from behind its flag,** drawn on the overlay layer.
- [x] **Ten times faster surveys** on big screens: the overlap solver measures each label once.

## 3.4.1 — types patch

- [x] **`User` accepts `id` and `email` again,** deprecated and ignored, so 3.1-era TypeScript compiles. 3.2.0 had removed them from the type in a minor release. They go in 4.0.

## 3.5 — reach

- **`npx stadiaref audit <path or URL>`:** the address inventory, duplicates and grammar check from the command line, for CI.
- **A browser extension,** so StadiaRef can run on any page, including production sites with no plugin and screens with no build change.
- **Shopify sections and `extraSelectors`:** recognise `.shopify-section` wrappers in auto-address, and let a project add its own section patterns.

## Later

- **WordPress.org.** Submit the plugin to the directory once 3.0 has settled, with its banner, icon and screenshots.

Releases before 3.0 are in [CHANGELOG.md](CHANGELOG.md).
