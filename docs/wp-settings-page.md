# WordPress settings page

The settings page of the StadiaRef WordPress plugin: where it is, what each setting stores, and how the page is laid out. The code is [`wordpress/stadiaref/stadiaref.php`](../wordpress/stadiaref/stadiaref.php). For installing the plugin, see [Install: WordPress](install/wordpress.md).

## Location

- **Menu:** Settings → StadiaRef, registered with `add_options_page()`.
- **URL:** `wp-admin/options-general.php?page=stadiaref`
- **Capability:** `manage_options`.
- The Plugins screen has a **Settings** link on the StadiaRef row.

## Layout

The page uses WordPress's own admin styles: a `wrap` with the page title, then white cards, each with a heading.

```
StadiaRef
┌ Status ───────────────────────────────────────────┐
│ [x] Enable StadiaRef                              │
├ Display ──────────────────────────────────────────┤
│ Default labels   (•) Full  ( ) Icons  ( ) Off     │
│ [x] Start hidden. Press D to show the toolbar.    │
│ Position         (•) Bottom right  ( ) …          │
├ Access ───────────────────────────────────────────┤
│ Minimum role     [Administrator ▾]                │
├ Addresses  New in 3.0 ────────────────────────────┤
│ Address profile  [Generic ▾]                      │
├ Page builders ────────────────────────────────────┤
│ [ ] Class-to-ref converter                        │
│ [ ] Auto-address                                  │
├ How it works ─────────────────────────────────────┤
│ Keys, click to copy, what an address is, docs     │
└───────────────────────────────────────────────────┘
[Save Changes]
(icon) StadiaRef by Seguru Digital               v3.0.0
```

## Settings

Each setting is a WordPress option. Values are cleaned on save: an unknown value falls back to the default.

| Card | Setting | Option | Values | Default | Config key it sets |
|---|---|---|---|---|---|
| Status | Enable StadiaRef | `stadiaref_enabled` | `1`, `0` | `0` | (loads the script at all) |
| Display | Default labels | `stadiaref_labels` | `full`, `icons`, `off` | `full` | `labels` |
| Display | Start hidden | `stadiaref_start_hidden` | `1`, `0` | `1` | `startHidden` |
| Display | Position | `stadiaref_dock` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` | `dock` |
| Access | Minimum role | `stadiaref_min_role` | `administrator`, `editor`, `author` | `administrator` | (who gets the script) |
| Addresses | Address profile | `stadiaref_profile` | `generic`, `titan`, `app` | `generic` | `profile` |
| Page builders | Class-to-ref converter | `stadiaref_class_converter` | `1`, `0` | `0` | `classConverter` |
| Page builders | Auto-address | `stadiaref_auto_address` | `1`, `0` | `0` | `autoAddress` |

Minimum role maps to a capability: Administrator is `manage_options`, Editor is `edit_others_posts`, Author is `publish_posts`. Visitors who aren't signed in never get the script.

## How the settings reach the script

The plugin enqueues `assets/stadiaref.min.js` in the footer for users who pass the role check, and adds an inline script before it that sets `window.stadiarefConfig` from the settings, with `startHidden`, `classConverter` and `autoAddress` as real booleans. The page wins: any key the page has already set in `window.stadiarefConfig`, or in the 2.x `window.seguruDebugConfig`, is left as the page set it.

## Settings from Seguru Debug Toolbar 2.x

When StadiaRef is activated, and on the next admin page load after it (which covers the mu-plugin and network activation), each setting is copied once from its 2.x option. A flag option, `stadiaref_migrated_2x`, makes sure it happens once. The 2.x options are left in place.

| 3.0 option | From | Mapping |
|---|---|---|
| `stadiaref_enabled` | `sdt_enabled` | as is |
| `stadiaref_labels` | `sdt_default_mode` | `2` → `full`, `0` → `icons`, `1` → `off` |
| `stadiaref_start_hidden` | `sdt_start_hidden` | as is |
| `stadiaref_dock` | `sdt_position` | as is |
| `stadiaref_min_role` | `sdt_min_role` | as is |
| `stadiaref_class_converter` | `sdt_class_converter` | as is |
| `stadiaref_auto_address` | `sdt_auto_ref` | as is |
| `stadiaref_profile` | (new) | starts at `generic` |

A setting already saved in 3.0 is never overwritten.

## Notices

- **After activation:** "StadiaRef is active. Turn it on and choose who sees it under Settings, StadiaRef."
- **While Seguru Debug Toolbar is still active:** a warning that asks for it to be deactivated. Until it is, StadiaRef doesn't load on the front end, so the page never has two copies.
- **On sites still on 2.x**, the 2.5.1 release of Seguru Debug Toolbar shows one dismissible notice: "Seguru Debug Toolbar is now StadiaRef", with a **Get StadiaRef** button.

## Updates

The plugin checks the latest release of `segurudigital/stadiaref` on GitHub (cached for six hours) and offers it through WordPress's normal update screens when it carries an asset named `stadiaref-wp-v<version>.zip`.

## The mu-plugin

[`wordpress/stadiaref.php`](../wordpress/stadiaref.php) is a drop-in for `wp-content/mu-plugins/`. It reads the same options, copies the 2.x settings the same way, and hands the settings to the script the same way. It has no settings page of its own: use the plugin's, or set the options with WP-CLI (`wp option update stadiaref_enabled 1`).
