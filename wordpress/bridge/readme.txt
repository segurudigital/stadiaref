=== Seguru Debug Toolbar ===
Contributors: segurudigital
Tags: debug, data-ref, overlay, qa, wireframe, developer tools
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 2.5.1
License: MIT
License URI: https://opensource.org/licenses/MIT

Seguru Debug Toolbar is now StadiaRef. This is the last release under the old name: install StadiaRef from https://github.com/segurudigital/stadiaref/releases/latest and your settings carry over.

Visual overlay that makes data-ref section labels visible on your site. Built for QA, revision feedback, and bug reporting.

== Description ==

Seguru Debug Toolbar is a lightweight developer tool that turns `data-ref` attributes on your HTML elements into a clickable visual overlay. It helps designers, developers, and clients identify page sections by their reference codes — making QA, revision rounds, and bug reporting faster and more precise.

**How it works:** Add `data-ref` attributes to your page sections (e.g. `data-ref="home-01-hero"`). The toolbar displays these codes as visual labels you can see, hover, and click to copy.

**Three viewing modes:**

* **Icons** — Small dot on each section. Hover to see the full code.
* **Off** — Clean view for screenshots and presentations.
* **Full** — Always-visible labels on every section.

**Key features:**

* Press **L** to cycle label modes
* Press **T** to cycle auto-ref Target depth between Sections, Blocks, and Elements
* Press **O** to cycle Outline guides
* Press **D** to show / hide the toolbar (visibility hotkey is configurable)
* Press **Esc** to dismiss everything in one keystroke
* Toggle the **Tree** panel to browse all labeled elements in document order
* Click any label to copy the section code to your clipboard
* Configurable position (any corner of the screen, plus auto-pick)
* Role-based access control (Administrator, Editor, or Author)
* Light / Dark / Auto theme system (follows OS or pin explicitly)
* Adaptive label contrast on dark backgrounds
* Public events bus (`sdt:show`, `sdt:hide`, `sdt:dataref-click`, etc.) for integrating with custom review or feedback panels
* Optional identity pill in the toolbar chrome (`setUser()`) so reviewers see their context
* Zero external dependencies — one self-contained JavaScript file
* Built-in help docs on the settings page

**For agencies and freelancers:** Give clients the plugin so they can identify exactly which section has an issue. They click the label, copy the code, and paste it in their email. You search your codebase for that code and find the block in seconds. No more "the thing at the top needs to change."

== Installation ==

1. Upload the plugin via Plugins → Add New → Upload Plugin
2. Activate the plugin
3. Go to Settings → Debug Toolbar
4. Enable the toolbar and configure your preferences
5. Visit the front end while logged in to see the toolbar

== Frequently Asked Questions ==

= Will visitors see the toolbar? =

No. The toolbar only loads for logged-in users who meet the minimum role requirement you set in the settings. Anonymous visitors and lower-role users never see it.

= What are data-ref attributes? =

They're custom HTML attributes you add to page sections (like `data-ref="home-01-hero"`). They're invisible to visitors and have zero performance impact. The toolbar makes them visible as clickable labels for your team.

= Does it work with Elementor, Bricks, and Oxygen? =

Yes. All three builders support custom HTML attributes, so you can add `data-ref` to any section element:

* **Elementor Pro** — Advanced tab → Custom Attributes → `data-ref|home-01-hero`
* **Bricks Builder** — Style → Attributes → Name: `data-ref`, Value: `home-01-hero`
* **Oxygen Builder** (3.5+) — Advanced tab → Attributes → Add Attribute

The toolbar scans the rendered HTML after page load, so it works with any builder that outputs the attributes. A snippet-based workaround is included for Elementor Free users.

= Can I use it with Gutenberg blocks? =

Yes. Add `data-ref` attributes to Group block wrappers via custom block attributes or the Advanced panel. The toolbar reads them from the rendered HTML.

= Does it affect site performance? =

No. The entire plugin is a single ~52 KB minified JavaScript file that only loads for authorized logged-in users. It does one DOM scan, injects lightweight label elements, and uses CSS class toggles for mode switching.

== Screenshots ==

1. The toolbar in Icons mode — small dots on each section, hover to reveal
2. Full mode — all labels visible for QA passes
3. Tree panel — browse labeled elements in document order with copy buttons
4. Settings page in wp-admin — configure mode, position, and access
5. Dark-background page with adaptive label contrast

== Changelog ==

= 2.5.1 =
* Seguru Debug Toolbar is now StadiaRef. This release removes the self-updater and shows one notice that links to StadiaRef. Install StadiaRef and your settings carry over when you activate it. The toolbar itself is unchanged from 2.5.0.

= 2.3.0 =
* Public-API surface for SDT: `hide()` / `show()` / `toggle()`, configurable visibility hotkey, three-mode theme system (`auto` / `light` / `dark`), public `sdt:*` event bus, identity hook (`setUser()`), and configurable dock corner with `auto` heuristic.
* **Breaking — keymap:** default visibility hotkey changed from H to **D**. **T** now cycles Target depth (was D). **O** is a new fixed binding that cycles Outline. **Esc** is a global one-shot hide.
* **Breaking — Depth → Target:** the on-page dropdown is now labelled "Target". The public API methods `setDepth()` / `getDepth()` keep their names so existing scripts don't break.
* Auto-ref defaults to ON for non-WordPress consumers. **The WordPress plugin keeps `Enable auto-ref` off by default** — admins opt in via Settings → Debug Toolbar to avoid surprising perf cost on large pages.
* User-pill avatar uses neutral slate so the Seguru S badge stays the only blue mark in the chrome. S badge bumped 16 → 20px and centered symmetrically in its click target.
* WP self-update keeps working — installs on 2.2.x will see the 2.3.0 update notice automatically.

= 2.2.3 =
* Fixed: manual `workflow_dispatch` retries now resolve the requested tag in the npm publish job, so re-running `release-assets.yml` checks out the correct ref before publish.
* Fixed: README npm install docs no longer point bundled-app users at a nonexistent `/seguru-debug-toolbar.min.js` path right after `npm install`.
* Fixed: WordPress setup docs now reference the real `seguru-debug-toolbar-wp-vX.Y.Z.zip` build artifact.
* Changed: AI-agent rollout prompt now includes the scoped npm install path, the canonical npm-backed jsDelivr URL, and the corrected React/Next bundled-app example.

= 2.2.2 =
* Changed: npm package renamed to `@segurudigital/seguru-debug-toolbar` (scoped to the segurudigital org). The canonical install command is now `npm install @segurudigital/seguru-debug-toolbar`.
* Changed: mu-plugin drop-in auto-detects the JS file at the scoped `node_modules/@segurudigital/...` path, falling back to the unscoped path for local installs that predate the rename.
* Fixed: release workflow now picks the current version's WP zip correctly instead of an alphabetically-earlier historical zip.
* Added: first live npm publish on release (gated on NPM_TOKEN repo secret, signed with provenance).

= 2.2.1 =
* Fixed: WordPress self-update and jsDelivr URLs pointed at the wrong GitHub org slug (hyphen vs no-hyphen). Install 2.2.1 manually to replace a 2.2.0 install — self-update works correctly from 2.2.1 onward.
* Fixed: WordPress zip build on Linux CI (portable sed).
* Added: npm publish automation on release (ships `seguru-debug-toolbar` to npm).

= 2.2.0 =
* New default behaviour: toolbar loads hidden — press H to reveal. Keeps screenshots, Chrome debug captures, and client demos clean.
* New defaults: Labels = Full, Depth = Elements (densest auto-ref scan by default)
* Added GitHub-based self-update — wp-admin shows "Update available" notices when new releases ship, one-click install via normal WP upgrader
* Added "Start hidden" admin toggle under Settings → Debug Toolbar → Display
* Added `startHidden` per-page override via `window.seguruDebugConfig`
* Added jsDelivr install path for non-WordPress consumers (CDN-served, pin by major version)
* Added pasteable AI-agent rollout prompt for Claude Code / ChatGPT / Codex / Cursor
* Automated GitHub Actions workflow attaches plugin zip to every release

= 2.1.0 =
* Added Outline guides for sections and blocks
* Added leader lines and depth-aware label staggering for dense layouts
* Refreshed the toolbar hierarchy and interaction states
* Improved outline contrast on dark sections and nested layouts
* Upgraded the Tree panel with context chips and click-to-jump navigation

= 2.0.0 =
* Added presentation mode toggle with the H key
* Added auto-ref depth cycling with the D key
* Added Tree panel for browsing and copying labeled elements
* Improved tooltip hover behavior so it only opens from the icon
* Improved Full mode label contrast and dark-background label visibility
* Added dual-source config support for WordPress and per-page overrides
* Updated Seguru product branding and badge colour alignment

= 1.3.0 =
* Added auto-ref generation for supported builders and standard HTML sections
* Added class-to-ref conversion for builder workflows
* Added front-end depth controls for Sections, Blocks, and Elements
* Expanded WordPress settings-page documentation
