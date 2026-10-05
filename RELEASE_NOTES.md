# StadiaRef 3.0.0

**Seguru Debug Toolbar is now StadiaRef: an address for every part of the screen.**

StadiaRef shows each `data-ref` attribute on a page as a label you can point at and copy. 3.0 renames the tool and makes it work in web apps and PWAs as well as websites. Every 2.x name keeps working through 3.x.

## Highlights

- **Show.** One control picks which tiers you see: sections, blocks, elements, in any mix (keys 1, 2, 3).
- **Labels coded by tier.** Sections solid orange, blocks dark, elements light, automatic addresses dashed. Every colour passes 4.5:1 contrast.
- **Pick (P)** shows the address of whatever you point at, as section, block and element; click to copy. On a phone, tap and a sheet rises.
- **Find (/)** jumps to an address someone pasted into a ticket.
- **Profiles.** `generic` (the default: tiers from nesting), `app` for web apps, `titan`, or your own with `registerProfile()`. The same rules run in Node through `stadiaref/core`, described in the [Stadia Address core spec](https://github.com/segurudigital/stadiaref/blob/main/docs/spec/stadia-address-core.md).
- **Apps.** Labels follow route changes and re-renders, narrow to an open dialog, work by touch, and the toolbar keeps clear of notches and tab bars.
- **New ways to install.** `import 'stadiaref'`, a Vite plugin and an Astro integration that shows StadiaRef in Astro's Dev Toolbar. Both load only on the dev server. TypeScript types included.
- **Nothing added to your page until you press D.** A hidden StadiaRef writes nothing, so server-rendered apps hydrate cleanly.

## Upgrading from 2.x

- **npm:** `npm uninstall @segurudigital/seguru-debug-toolbar && npm install --save-dev stadiaref`
- **Script tag:** use `https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js`
- **WordPress:** install `stadiaref-wp-v3.0.0.zip` (attached) next to the old plugin and activate it. Your settings are copied over. Then deactivate and delete Seguru Debug Toolbar. Sites still running the old plugin are offered a final 2.5.1 update that points them here.

Breaking changes to check:

- The default profile is now `generic`. Pages written to the Titan grammar should set `profile: 'titan'` (or choose Titan under Settings → StadiaRef).
- Target and Level are gone from the toolbar; Show replaces them. Keys T and F are no longer bound.
- CSS classes `sdt-*` are now `stadiaref-*`, with no alias. `data-ref` and the `dataref-` prefix are unchanged.
- Esc leaves Pick or Find first, and leaves an open dialog of your page to close itself.

Every renamed config key, method and event is listed in [Migrating from 2.x](https://github.com/segurudigital/stadiaref/blob/main/docs/migrating-from-2.x.md). The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.0.0.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
