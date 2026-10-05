// stadiaref/astro: loads StadiaRef while `astro dev` runs and at no other
// time. It registers a Dev Toolbar app (app.js) whose panel holds the
// controls, and adds the loader (see loader.js) to every page.
//
//   import stadiaref from 'stadiaref/astro';
//   export default defineConfig({ integrations: [stadiaref({ profile: 'titan' })] });
import { fileURLToPath } from 'node:url';
import { ICON_SVG } from '../../overlay/brand.js';
import { OPTIMIZE_DEPS, loaderCode } from '../loader.js';

// The icon for Astro's bar, coloured inline (Astro's bar has none of
// StadiaRef's styles).
var ICON = ICON_SVG
  .replace(' width="20" height="20"', '')
  .replace(' class="stadiaref-brand__icon"', '')
  .replace('class="stadiaref-brand__disc"', 'fill="#F97316"');

export default function stadiaref(options) {
  var opts = options || {};
  return {
    name: 'stadiaref',
    hooks: {
      'astro:config:setup': function (params) {
        if (params.command !== 'dev') return;
        params.addDevToolbarApp({
          id: 'stadiaref',
          name: 'StadiaRef',
          icon: ICON,
          entrypoint: fileURLToPath(new URL('./astro-app.mjs', import.meta.url))
        });
        params.updateConfig({ vite: { optimizeDeps: OPTIMIZE_DEPS } });
        var root = fileURLToPath(params.config.root);
        params.injectScript('page', loaderCode(opts, root));
      }
    }
  };
}
