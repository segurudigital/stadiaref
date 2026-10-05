# Install: WordPress

Once you turn it on, the StadiaRef plugin loads the toolbar on the front end for signed-in users at or above the role you choose (Administrator by default). Visitors never get it.

Needs WordPress 5.8 or later and PHP 8.1 or later.

## 1. Install the plugin

1. Download `stadiaref-wp-vX.Y.Z.zip` from the [latest release](https://github.com/segurudigital/stadiaref/releases/latest).
2. In wp-admin go to **Plugins → Add New → Upload Plugin**, choose the zip and activate it.
3. Go to **Settings → StadiaRef** and turn it on.

## 2. Open the site and press D

Visit any front-end page while signed in. Press **D**. The toolbar appears in the bottom-right corner.

## 3. Get addresses onto the page

Pick whichever fits how the site is built.

| Approach | Effort | How |
|---|---|---|
| **Auto-address** | None | Turn on **Auto-address** in settings. Every section, block and element without an address gets a temporary one, shown with a dashed **AUTO** label |
| **A CSS class** | Low | Turn on the **Class-to-ref converter**. Add a class like `dataref-home-hero` in any page builder, free tiers included |
| **A real attribute** | Most control | Add `data-ref="home-hero"` in your theme templates, block markup or the builder's custom attributes field |

Auto-address is the fastest way to start. Temporary addresses change when the page changes, so write real ones for anything you'll refer to again. A real `data-ref` always wins over a class, and a class always wins over auto-address.

In a theme template:

```php
<section data-ref="home-hero" class="hero">
  <?php // template content ?>
</section>
```

Step-by-step for Elementor, Bricks, Oxygen, Breakdance and Gutenberg: [Page builders](../page-builders.md).

## Settings

**Settings → StadiaRef** has six sections.

| Section | What it controls |
|---|---|
| **Status** | On or off. When off, no script loads |
| **Display** | Default label mode (Full, Icons, Off), whether it starts hidden, which corner it docks in |
| **Access** | The lowest role that sees the toolbar: Administrator (default), Editor or Author |
| **Addresses** | The address profile: Generic, Titan or App. See [Addressing](../addressing.md) |
| **Page builders** | The class-to-ref converter and auto-address |
| **How it works** | A short guide for whoever uses the toolbar on this site |

## Handing it to a client

Install the plugin on the client's site and show them two things: press **D**, then click a label. They paste the address into their email or ticket. You search the codebase for it.

The **How it works** panel on the settings page explains this in plain language, so a client can learn it without leaving wp-admin.

## Updates

The plugin updates itself from GitHub releases. WordPress checks every six hours and shows the usual "Update available" notice on the Plugins screen. Requests go straight to GitHub. There is no Seguru update server in between.

To force a check, clear the cached result and then visit **Dashboard → Updates**:

```bash
wp transient delete stadiaref_github_release
```

## WP-CLI

```bash
wp option update stadiaref_enabled 1
wp option update stadiaref_labels full            # full | icons | off
wp option update stadiaref_start_hidden 1
wp option update stadiaref_dock bottom-right      # any corner
wp option update stadiaref_min_role administrator # administrator | editor | author
wp option update stadiaref_profile generic        # generic | titan | app
wp option update stadiaref_class_converter 1
wp option update stadiaref_auto_address 1
```

## mu-plugin (for developers)

To load StadiaRef without an activation step:

1. Copy `wordpress/stadiaref.php` from the repo to `wp-content/mu-plugins/stadiaref.php`.
2. Copy `stadiaref.min.js` to `wp-content/mu-plugins/stadiaref/stadiaref.min.js`.
3. Turn it on with WP-CLI: `wp option update stadiaref_enabled 1`. The mu-plugin has no settings page of its own; if the installable plugin is also present, its **Settings → StadiaRef** page sets the same options.

The mu-plugin doesn't update itself. Replace the two files when you want a new version.

## Coming from the Seguru Debug Toolbar plugin

StadiaRef is a new plugin with a new folder, so WordPress treats it as a separate install.

1. Install and activate StadiaRef. It copies your Debug Toolbar settings across the first time it runs.
2. Deactivate and delete Seguru Debug Toolbar.

Don't leave both active. StadiaRef stands back while the old plugin is switched on, so you would keep getting the old toolbar. It shows a notice in wp-admin to remind you.

If you do nothing, the old plugin keeps working. It receives one last update, which adds a notice about StadiaRef and turns off its update check. After that it stays as it is.

The new plugin starts on the Generic address profile. If your addresses follow the Titan grammar, choose **Titan** under **Addresses**.

## Multisite

Settings are per site. Turn StadiaRef on for a staging site without it appearing on any other site in the network.

## Troubleshooting

**The toolbar doesn't appear.** Check it is turned on under Settings → StadiaRef, that you are signed in with a role that meets the Access setting, and that you pressed **D**. Then look in the browser's Network tab for `stadiaref.min.js`.

**The toolbar appears but there are no labels.** The page has no addresses yet. View source and search for `data-ref`, or turn on Auto-address.

**A chat widget or cookie banner covers it.** Change the dock corner under Display.

**Caches and visitors.** The script is only printed for signed-in users who meet the Access role. Most page caches skip signed-in users, so a visitor never receives a page with it. If your cache is set to store pages for signed-in users, exclude those roles, then check a signed-out page's source for `stadiaref.min.js`.
