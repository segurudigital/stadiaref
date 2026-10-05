// stadiaref/vite: loads StadiaRef on the dev server only. `vite build`
// never includes it (apply: 'serve').
//
//   import stadiaref from 'stadiaref/vite';
//   export default defineConfig({ plugins: [stadiaref({ profile: 'app' })] });
//
// The plugin serves a virtual module holding the loader (see loader.js) and
// adds one module script tag to index.html that points at it.
import { OPTIMIZE_DEPS, loaderCode } from '../loader.js';

var VIRTUAL = 'virtual:stadiaref';
var RESOLVED = '\0' + VIRTUAL;

export default function stadiaref(options) {
  var opts = options || {};
  var root = process.cwd();
  var base = '/';
  return {
    name: 'stadiaref',
    apply: 'serve',
    config: function () {
      return { optimizeDeps: OPTIMIZE_DEPS };
    },
    configResolved: function (config) {
      root = config.root;
      base = config.base || '/';
    },
    resolveId: function (id) {
      if (id === VIRTUAL) return RESOLVED;
      return null;
    },
    load: function (id) {
      if (id === RESOLVED) return loaderCode(opts, root);
      return null;
    },
    transformIndexHtml: function () {
      return [{
        tag: 'script',
        attrs: { type: 'module', src: (base.charAt(base.length - 1) === '/' ? base : base + '/') + '@id/' + VIRTUAL },
        injectTo: 'head'
      }];
    }
  };
}
