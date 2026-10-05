# Migrating from 2.x (Seguru Debug Toolbar)

StadiaRef 3.0 is Seguru Debug Toolbar under its new name, with a simpler set of controls. Your `data-ref` attributes don't change. Nothing in your markup needs editing.

The old names keep working through every 3.x release and are removed in 4.0. You can update in one go or a piece at a time.

## The short version

1. Swap the package or the script URL.
2. Rename the global and the config object when you next touch that code.
3. If your addresses follow the Titan grammar, set `profile: 'titan'`. See [The default profile changed](#the-default-profile-changed).
4. If you used **Target** or **Level**, read [Show replaces Target and Level](#show-replaces-target-and-level).
5. On WordPress, install the StadiaRef plugin and remove the old one.

## Package and script

| | 2.x | 3.0 |
|---|---|---|
| npm | `@segurudigital/seguru-debug-toolbar` | `stadiaref` |
| CDN | `…/npm/@segurudigital/seguru-debug-toolbar@2/dist/seguru-debug-toolbar.min.js` | `https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js` |
| File | `seguru-debug-toolbar.min.js` | `stadiaref.min.js` |
| Repo | `segurudigital/seguru-debug-toolbar` | `segurudigital/stadiaref` (the old URL redirects) |

```bash
npm uninstall @segurudigital/seguru-debug-toolbar
npm install --save-dev stadiaref
```

If you imported the source file directly in 2.x, import the package instead:

```js
// 2.x
import('@segurudigital/seguru-debug-toolbar/src/seguru-debug-toolbar.js');

// 3.0
import('stadiaref');
```

Better still, use the [Astro integration](install/astro.md) or the [Vite plugin](install/vite.md) and delete your loader.

## Global, config and storage

| 2.x | 3.0 | Old name still works? |
|---|---|---|
| `window.seguruDebugToolbar` | `window.stadiaref` | Yes, with one console notice |
| `window.seguruDebugConfig` | `window.stadiarefConfig` | Yes |
| `window.sdtConfig` | `window.stadiarefConfig` | Yes |
| localStorage `seguru-debug-toolbar:theme` | `stadiaref:theme` | Read once and moved over |

## Config keys

| 2.x | 3.0 |
|---|---|
| `defaultMode: 2` / `0` / `1` | `labels: 'full'` / `'icons'` / `'off'` |
| `autoRef: true` | `autoAddress: true` |
| `autoRefDepth` | No direct equivalent. Use `autoAddress` and Show (see below). The old key keeps its 2.x behaviour |
| `levelFilter` | `tiers` (see below) |
| `outlineMode` | `outline` |
| `position` | `dock` |
| `hotkey: 'V'` | `keys: { toggle: 'V' }` |
| `startHidden`, `theme`, `dock`, `user`, `classConverter`, `pageSlug` | Unchanged |
| Script attribute `data-position` | `data-dock` |
| Script attributes `data-hotkey`, `data-theme`, `data-dock` | Unchanged |

New in 3.0: `profile`, `watch`, `dockOffset` and the full `keys` map.

## The default profile changed

2.x sorted every address into section, block or element with one built-in grammar, the one Seguru Titan Foundations use. 3.0 has profiles, and the default is `generic`, which reads the tier from nesting instead.

For most projects this is an improvement and needs no action. Labels may land in a different tier than before, which only affects what the Show control filters.

If your addresses follow the Titan grammar (`home-hero-card-01`, `home-hero-heading-01-01-primary`), keep the old sorting:

```js
stadiaref.init({ profile: 'titan' });
```

On WordPress, choose **Titan** under **Settings → StadiaRef → Addresses**. The plugin starts on Generic, including when it copies settings from the old plugin.

## Show replaces Target and Level

2.x had two controls that overlapped. **Target** chose which elements got an automatic address. **Level** filtered which addresses were shown. Some combinations showed nothing at all.

3.0 has one control and one setting:

- **Show** is on the toolbar. It has a tick box for sections, blocks and elements, and applies to every address on the page.
- **Auto-address** is a setting, on or off. When it is on, everything without an address gets a temporary one at every tier, marked **AUTO**.

| 2.x | 3.0 |
|---|---|
| Target: Off | `autoAddress: false` |
| Target: All | `autoAddress: true` |
| Target: Sections / Blocks / Elements | `autoAddress: true`, then tick that tier in Show |
| Level: All | `tiers: ['section', 'block', 'element']` |
| Level: Sec + Blk | `tiers: ['section', 'block']` |
| Level: Sections | `tiers: ['section']` |

New in 3.0: you can show elements only, or blocks only, on a page with written addresses. 2.x couldn't.

One difference to know about. In 2.x, Target: Sections added automatic addresses to sections and left your written addresses at every tier on screen. Show filters everything, written or automatic. Code that still calls `setDepth()` keeps the exact 2.x behaviour.

## Methods

| 2.x | 3.0 | Old name still works? |
|---|---|---|
| `setState(0 \| 1 \| 2)` / `getState()` | `setLabels('icons' \| 'off' \| 'full')` / `getLabels()` | Yes |
| `setDepth(value)` / `getDepth()` | `setAutoAddress(on)` and `setTiers(tiers)` | Yes, with its 2.x behaviour |
| `setLevelFilter(value)` / `getLevelFilter()` | `setTiers(tiers)` / `getTiers()` | Yes |
| `classifyDataRef(ref)` | `classify(address)` | Yes. The old name always uses the Titan grammar, as 2.x did |
| `setHotkey(letter)` / `getHotkey()` | `setKeys({ toggle })` / `getKeys()` | Yes |
| `show`, `hide`, `toggle`, `isVisible`, `init`, `refresh`, `toggleTree`, `setOutline`, `setTheme`, `setDock`, `setUser` and their getters | Unchanged | |

New in 3.0: `pick()`, `find()`, `setProfile()`, `registerProfile()`, `validate()`.

`refresh()` is rarely needed now. StadiaRef re-surveys the screen on its own when the route changes or content mounts.

## Keys

| 2.x | 3.0 |
|---|---|
| **T** cycles Target | Gone. Auto-address is a setting |
| **F** cycles Level | **1**, **2**, **3** switch sections, blocks, elements |
| | **P** starts Pick |
| | **/** opens Find |
| **D**, **L**, **O** | Unchanged |
| **Esc** hides everything | **Esc** leaves Pick or Find first. With neither open it hides everything, as before |

Every key can now be changed or turned off, not only the toggle key.

## Events

Every `sdt:` event still fires through 3.x. Use the `stadiaref:` names in new code.

| 2.x | 3.0 |
|---|---|
| `sdt:ready`, `sdt:show`, `sdt:hide`, `sdt:theme-change`, `sdt:outline-change`, `sdt:user-change` | Same name with the `stadiaref:` prefix |
| `sdt:dataref-click` / `-hover` / `-leave` | `stadiaref:address-click` / `-hover` / `-leave` |
| `sdt:depth-change` | `stadiaref:auto-address-change` |
| `sdt:level-filter-change` | `stadiaref:tiers-change` |

The new address events carry `{ address, tier, element }`, and the click event adds `source` and `copied`. The old `sdt:dataref-*` events keep their 2.x detail: `{ dataRef, element, current }`.

## CSS and attributes

These have no alias. Update them if your own code touches them.

| 2.x | 3.0 |
|---|---|
| Classes starting `sdt-` | `stadiaref-` |
| `data-sdt-auto`, `data-sdt-auto-level` | `data-stadiaref-auto`, `data-stadiaref-auto-tier` |

Unchanged, and they never will change: the `data-ref` attribute and the `dataref-` class prefix.

## WordPress

StadiaRef is a new plugin. Install it alongside the old one, then remove the old one. The steps are in the [WordPress guide](install/wordpress.md#coming-from-the-seguru-debug-toolbar-plugin).

| | 2.x | 3.0 |
|---|---|---|
| Plugin folder and slug | `seguru-debug-toolbar` | `stadiaref` |
| Settings page | Settings → Debug Toolbar | Settings → StadiaRef |
| Options | `sdt_*` | `stadiaref_*`, copied across the first time the new plugin runs |
| Release zip | `seguru-debug-toolbar-wp-vX.Y.Z.zip` | `stadiaref-wp-vX.Y.Z.zip` |

The old plugin doesn't turn into StadiaRef. It gets one last update that keeps it working, adds a notice pointing to the new plugin, and turns off its update check.

## What looks different

- The toolbar carries the StadiaRef name and an orange mark.
- Labels are coded by tier: sections solid orange, blocks dark, elements light. In 2.x every label looked the same.
- **Pick** and **Find** are new.
- The Target and Level menus are gone. **Show** takes their place.
- Under `astro dev`, StadiaRef lives inside Astro's Dev Toolbar.
