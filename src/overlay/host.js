// ─── Hosts ──────────────────────────────────────────────────
// Normally StadiaRef draws its own floating toolbar. In Astro's Dev Toolbar
// the controls live in a panel instead (panel.js), and the floating toolbar
// isn't drawn. StadiaRef decides this itself, from the page: the Astro host
// is used when Astro's Dev Toolbar is there and holds the canvas of the app
// that the StadiaRef integration registers. Nothing in the page's code, the
// API or the config can switch it. If the developer has turned the Dev
// Toolbar off, or loaded StadiaRef without the integration, the floating
// toolbar is drawn as usual.

var APP_ID = 'stadiaref';

function astroBar() {
  return document.querySelector('astro-dev-toolbar');
}

// The shadow root of StadiaRef's app canvas in Astro's Dev Toolbar, or null.
export function astroCanvas() {
  var bar = astroBar();
  var root = bar && bar.shadowRoot;
  var canvas = root && root.querySelector('astro-dev-toolbar-app-canvas[data-app-id="' + APP_ID + '"]');
  return (canvas && canvas.shadowRoot) || null;
}

// True while the floating toolbar is replaced by a host's panel.
export function toolbarHosted() {
  return !!astroCanvas();
}

// How far Astro's dev bar reaches up from the bottom of the viewport, so the
// pieces docked at the bottom sit clear of it. 0 when it can't be measured.
export function astroBarReach() {
  var el = astroBar();
  var root = el && el.shadowRoot;
  var bar = root && root.querySelector('#dev-bar');
  if (!bar) return 0;
  var r = bar.getBoundingClientRect();
  if (!r.height) return 0;
  return Math.max(0, Math.round(window.innerHeight - r.top));
}
