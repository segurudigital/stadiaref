// The Astro Dev Toolbar app. Astro bundles it into the page with the
// toolbar; it hands its canvas to the overlay already running on the page,
// which draws the panel there. It imports nothing, so it can't start a
// second copy of the overlay.
var ASTRO_HOST = Symbol.for('stadiaref.astroHost');

function attach(canvas) {
  var api = window.stadiaref;
  if (api && typeof api[ASTRO_HOST] === 'function') api[ASTRO_HOST](canvas);
}

export default {
  init: function (canvas) {
    if (window.stadiaref && window.stadiaref.ready) window.stadiaref.ready.then(function () { attach(canvas); });
    else window.addEventListener('stadiaref:ready', function () { attach(canvas); }, { once: true });
  }
};
