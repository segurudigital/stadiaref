# StadiaRef 3.1.0

**StadiaRef is now Signal Lime.**

StadiaRef shows each `data-ref` attribute on a page as a label you can point at and copy. 3.1 gives it a colour of its own: Signal Lime `#A3E635` replaces orange across the icon, labels, toolbar and WordPress settings page. Nothing about how it works has changed.

## What you'll see

- **Section labels are lime with black text**, edged in Lime Ink `#3F6212` so they stand out on white pages. On a dark page they're a lighter lime, `#BEF264`. Blocks stay dark and elements light.
- **Active controls, ticks, the Pick chip and the Find and Pick frames are lime.** Wherever lime would be text on a light surface it is Lime Ink instead, so every text pair still passes 4.5:1. The lowest is 6.52:1.
- **Focus rings are Seguru's focus colours** (Deep Teal on light, Primary Blue on dark, each with a halo), the same as on every Seguru product.
- **New product icon:** the black S mark on lime.

## Upgrading

Nothing to change. Update the package (`npm install --save-dev stadiaref@3.1.0`) or the WordPress plugin as usual. If your own CSS matched StadiaRef's old orange values, update it; class names and attributes are unchanged.

The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.1.0.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
