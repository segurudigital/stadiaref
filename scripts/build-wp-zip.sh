#!/usr/bin/env bash
# Builds the ready-to-install WordPress plugin.
# Output: dist/stadiaref-wp-vX.Y.Z.zip, which unpacks to stadiaref/.
# (For the Seguru Debug Toolbar 2.x bridge see build-wp-bridge.sh.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist"
TMP_DIR=$(mktemp -d)
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
ZIP_NAME="stadiaref-wp-v${VERSION}.zip"
PLUGIN_DIR="$TMP_DIR/stadiaref"

mkdir -p "$PLUGIN_DIR/assets"

# Build the overlay first
cd "$ROOT_DIR"
npm run build --silent

# Assemble plugin contents
cp "$ROOT_DIR/wordpress/stadiaref/stadiaref.php" "$PLUGIN_DIR/"
cp "$ROOT_DIR/wordpress/stadiaref/assets/icon.svg" "$PLUGIN_DIR/assets/"
cp "$DIST_DIR/stadiaref.min.js" "$PLUGIN_DIR/assets/"
cp "$ROOT_DIR/LICENSE" "$PLUGIN_DIR/"
cp "$ROOT_DIR/NOTICE" "$PLUGIN_DIR/"

# readme.txt, in the WordPress plugin directory format
cat > "$PLUGIN_DIR/readme.txt" << 'EOF'
=== StadiaRef ===
Contributors: segurudigital
Tags: data-ref, overlay, qa, design review, developer tools
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: __VERSION__
License: MIT
License URI: https://opensource.org/licenses/MIT

An address for every part of the screen. Shows each data-ref address as a label you can point at and copy.

== Description ==

StadiaRef turns the `data-ref` attributes on your pages into labels. Each label is an address, such as `home-hero` or `home-plans-card-02`. Click a label and its address is on your clipboard, ready to paste into a note, an email or a ticket. A developer searches the code for that address and finds the exact element.

* **Labels by tier.** Sections, blocks and elements each have their own style. **Show** picks which tiers you see.
* **Pick.** Point at anything and see its section, block and element. Click to copy.
* **Find.** Type or paste an address and jump to it.
* **Tree.** Every address on the page, in order.
* **Address profiles.** Generic (tiers from nesting), Titan and App.
* **Page builders.** A class-to-ref converter for builders that only let you add a class, and temporary automatic addresses for pages that have none yet.
* **Only for your team.** It loads for signed-in users with the role you choose. Visitors never see it.
* One self-contained script. No external requests.

Keys: D shows or hides the toolbar. L cycles labels. 1, 2 and 3 switch sections, blocks and elements. P starts Pick. / opens Find. O cycles Outline. Esc leaves Pick or Find, then hides everything.

== Installation ==

1. Upload the plugin via Plugins → Add New → Upload Plugin.
2. Activate it.
3. Go to Settings → StadiaRef, enable it and choose who sees it.
4. Visit the front end while signed in and press D.

Coming from Seguru Debug Toolbar? Your settings carry over when you activate StadiaRef. Then deactivate and remove the old plugin.

== Frequently Asked Questions ==

= Will visitors see the toolbar? =

No. It only loads for signed-in users who meet the minimum role you set.

= What are data-ref attributes? =

Ordinary HTML attributes, such as `data-ref="home-hero"`. Visitors don't see them and they cost nothing.

= Does it work with page builders? =

Yes. Add a `data-ref` attribute where your builder allows custom attributes (Elementor Pro, Bricks, Oxygen, Breakdance), or turn on the class-to-ref converter and add a class starting with `dataref-`, which every builder allows.

= Can a page override the settings? =

Yes. Keys set in `window.stadiarefConfig` on the page win over the settings.

== Changelog ==

= 3.0.0 =
* Seguru Debug Toolbar is now StadiaRef. Settings from 2.x are copied over once when StadiaRef is activated.
* New toolbar with Labels, Show, Pick, Find, Outline and Tree. Labels coded by tier.
* Address profiles: Generic, Titan and App.
* Nothing is added to the page until the toolbar is first shown.
* Works with dialogs, single-page apps and touch screens.
EOF

# Inject version into readme.txt.
# perl -i is portable across BSD (macOS) and GNU (Linux CI) sed.
perl -i -pe "s/__VERSION__/${VERSION}/" "$PLUGIN_DIR/readme.txt"

# Create the zip
mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"
cd "$TMP_DIR"
zip -rq "$DIST_DIR/$ZIP_NAME" stadiaref/

# Clean up
rm -rf "$TMP_DIR"

echo "Built: dist/$ZIP_NAME ($(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1) compressed)"
