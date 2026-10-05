// src/integrations/astro/app.js
var ASTRO_HOST = Symbol.for("stadiaref.astroHost");
function attach(canvas) {
  var api = window.stadiaref;
  if (api && typeof api[ASTRO_HOST] === "function")
    api[ASTRO_HOST](canvas);
}
var app_default = {
  init: function(canvas) {
    if (window.stadiaref && window.stadiaref.ready)
      window.stadiaref.ready.then(function() {
        attach(canvas);
      });
    else
      window.addEventListener("stadiaref:ready", function() {
        attach(canvas);
      }, { once: true });
  }
};
export {
  app_default as default
};
