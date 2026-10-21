# StadiaRef 3.2.0

**The Titan profile reads lists, loops and forms.**

StadiaRef shows each `data-ref` attribute on a page as a label you can point at and copy. 3.2 brings the `titan` profile up to date with the Titan data-ref spec, and carries the security hardening done since 3.1. The Stadia Address core spec is now 1.1.

## What's new

- **Loop and form slots are blocks.** `loop` and `form` wrap a region the site renders itself: a posts loop, a related list, a form plugin's fields (`home-news-loop-01`, `home-contact-form-01`). Only the wrapper is addressed. In 3.1 these showed as unclassified.
- **Lists are elements.** A list's address, such as `home-cards-list-01-02-items`, is an element. In 3.1 it showed as a section, with no warning.
- **Safer updates and builds.** WordPress updates are checked against the exact release asset and its SHA-256 digest before they install. Release builds run with least privilege, actions are pinned, and the reviewer identity StadiaRef keeps is just a name and a role.

## Upgrading

Nothing to change. Update the package (`npm install --save-dev stadiaref@3.2.0`) or the WordPress plugin as usual. If you use the `titan` profile, addresses with `-loop-`, `-form-` or `-list-` in them now get their own tier.

The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.2.0.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
