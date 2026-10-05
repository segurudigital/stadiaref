import { S } from './state.js';

// ─── Hosts ──────────────────────────────────────────────────
// Normally StadiaRef draws its own floating toolbar. In Astro's Dev Toolbar
// the controls live in a panel instead (panel.js), and the floating toolbar
// isn't drawn. The host is decided at runtime: the Astro integration asks
// for the Astro host, and it is used only while Astro's Dev Toolbar is on
// the page. If the developer has turned the Dev Toolbar off, the floating
// toolbar is drawn as usual. There is no config key for this.

function astroBar() {
  return document.querySelector('astro-dev-toolbar');
}

// True while the floating toolbar is replaced by a host's panel.
export function toolbarHosted() {
  return S.hostMode === 'astro' && !!astroBar();
}

// How far Astro's dev bar reaches up from the bottom of the viewport, so the
// pieces docked at the bottom sit clear of it. 0 when it can't be measured.
export function astroBarReach() {
  var el = astroBar();
  var root = el && el.shadowRoot;
  var bar = root && (root.querySelector('#dev-bar') || root.querySelector('#dev-toolbar-root'));
  if (!bar) return 0;
  var r = bar.getBoundingClientRect();
  if (!r.height) return 0;
  return Math.max(0, Math.round(window.innerHeight - r.top));
}

// Hide the floating toolbar while a host draws the controls.
export function applyToolbarHost() {
  if (!S.toolbar) return;
  var display = toolbarHosted() ? 'none' : '';
  if (S.toolbar.style.display !== display) S.toolbar.style.display = display;
}
