#!/usr/bin/env bash
# Builds the bridge for Seguru Debug Toolbar 2.x installs:
# Output: dist/seguru-debug-toolbar-wp-v2.5.1.zip, which unpacks to
# seguru-debug-toolbar/. The version in the name is fixed: the 2.x updater
# only accepts assets named seguru-debug-toolbar-wp-v*.zip, so a 3.0 release
# that carries this file is how old installs hear about StadiaRef.
#
# It is the 2.5.0 plugin with its updater removed and a notice added
# (wordpress/bridge/seguru-debug-toolbar.php), the frozen 2.5.0 script
# (wordpress/bridge/assets/seguru-debug-toolbar.min.js, never rebuilt from
# 3.0 source), its readme and the licence.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist"
BRIDGE_DIR="$ROOT_DIR/wordpress/bridge"
TMP_DIR=$(mktemp -d)
ZIP_NAME="seguru-debug-toolbar-wp-v2.5.1.zip"

mkdir -p "$TMP_DIR/seguru-debug-toolbar/assets" "$DIST_DIR"
cp "$BRIDGE_DIR/seguru-debug-toolbar.php" "$TMP_DIR/seguru-debug-toolbar/"
cp "$BRIDGE_DIR/readme.txt" "$TMP_DIR/seguru-debug-toolbar/"
cp "$BRIDGE_DIR/assets/seguru-debug-toolbar.min.js" "$TMP_DIR/seguru-debug-toolbar/assets/"
cp "$ROOT_DIR/LICENSE" "$TMP_DIR/seguru-debug-toolbar/"

rm -f "$DIST_DIR/$ZIP_NAME"
cd "$TMP_DIR"
zip -rq "$DIST_DIR/$ZIP_NAME" seguru-debug-toolbar/
rm -rf "$TMP_DIR"

echo "Built: dist/$ZIP_NAME ($(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1) compressed)"
