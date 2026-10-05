// The Astro Dev Toolbar app. Astro calls init() with the app's canvas once
// its toolbar is up. The overlay already running on the page finds that
// canvas itself and draws its panel there; this only tells it to look now.
// Nothing is handed over, so nothing on the page can stand in for Astro.
export default {
  init: function () {
    window.dispatchEvent(new Event('stadiaref:astro-app'));
  }
};
