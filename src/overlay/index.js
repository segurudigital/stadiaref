/**
 * Seguru Debug Toolbar — Element Reference Labels
 * https://github.com/segurudigital/seguru-debug-toolbar
 *
 * Visual overlay for `data-ref` element labels on wireframes,
 * dev builds, and live WordPress pages.
 *
 * Usage:
 *   <script src="seguru-debug-toolbar.js"></script>
 *   (auto-injects toolbar HTML, CSS, and binds keyboard shortcuts)
 *
 * Three modes cycled by clicking buttons or pressing L:
 *   0 = Icons   — small dot per element, hover to see full label
 *   1 = Off     — nothing shown, clean view for screenshots
 *   2 = Full    — always-visible text labels on every element (default)
 *
 * Press D to toggle presentation mode: hides toolbar + all labels.
 *   By default the toolbar loads in presentation mode (hidden) so it stays
 *   out of screenshots, AI/Chrome debug sessions, and client demos. Press D
 *   to reveal the toolbar and labels. Override with seguruDebugConfig.startHidden = false.
 * Press T to cycle auto-ref depth: Off → Sections → Blocks → Elements → All.
 *   Each depth shows only that level's auto-refs; All shows every level simultaneously.
 *   Auto-ref is OFF by default; enabled via the WordPress plugin (sdtConfig.autoRef)
 *   or explicitly with seguruDebugConfig.autoRef = true.
 * Use Outline to show section/block boundaries for spacing QA (off by default).
 *
 * Click any label to copy the data-ref value to clipboard.
 *
 * Programmatic API:
 *   window.seguruDebugToolbar.setState(0|1|2)
 *   window.seguruDebugToolbar.getState()
 *   window.seguruDebugToolbar.setDepth('off'|'section'|'block'|'element'|'all')
 *   window.seguruDebugToolbar.getDepth()
 *   window.seguruDebugToolbar.setOutline('off'|'section'|'block')
 *   window.seguruDebugToolbar.getOutline()
 *   window.seguruDebugToolbar.refresh()  // re-scan for new data-ref elements
 */

// Entry point. esbuild bundles this file and its imports into the single
// IIFE in dist/. Importing modules does no DOM work; boot() does all of it,
// in the order 2.5.0 did at load, then the API is published on window.
import { boot } from './boot.js';
import { api } from './api.js';

boot();

window.seguruDebugToolbar = api;
