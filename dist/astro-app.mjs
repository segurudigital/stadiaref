// src/integrations/astro/app.js
var app_default = {
  init: function() {
    window.dispatchEvent(new Event("stadiaref:astro-app"));
  }
};
export {
  app_default as default
};
