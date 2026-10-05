// The dev-only loader the Vite plugin and the Astro integration add to the
// page. It imports the overlay (which starts hidden, with defaults), then
// the user's setup module if there is one, awaits that module's default
// export with the API, then calls init() with the options. So setup always
// runs before the options are applied and before anything is surveyed.
import path from 'node:path';

// Vite pre-bundles dependencies it finds on the first page load and then
// reloads the page. StadiaRef is plain ES modules with no dependencies, so
// both integrations keep it out of that: no reload, and `stadiaref` and
// `stadiaref/core` are served as the same files, sharing one registry.
export var OPTIMIZE_DEPS = { exclude: ['stadiaref', 'stadiaref/core'] };

// Every option except `setup` is passed to init(). Values must survive JSON.
export function initOptions(options) {
  var out = {};
  for (var key in options || {}) {
    if (key !== 'setup' && Object.prototype.hasOwnProperty.call(options, key)) out[key] = options[key];
  }
  return out;
}

// The setup module as an absolute path with forward slashes, which Vite
// resolves on any platform.
export function setupPath(setup, root) {
  if (typeof setup !== 'string' || !setup) return null;
  return path.resolve(root, setup).split(path.sep).join('/');
}

// `before` is run after the overlay has loaded and before setup: the Astro
// integration uses it to ask for its host.
export function loaderCode(options, root, before) {
  var setup = setupPath(options && options.setup, root);
  var lines = ["import stadiaref from 'stadiaref';"];
  if (setup) lines.push('import setup from ' + JSON.stringify(setup) + ';');
  lines.push('(async function () {');
  lines.push('  if (!stadiaref) return;');
  if (before) lines.push('  ' + before);
  if (setup) lines.push("  if (typeof setup === 'function') await setup(stadiaref);");
  lines.push('  stadiaref.init(' + JSON.stringify(initOptions(options)) + ');');
  lines.push('})();');
  return lines.join('\n') + '\n';
}
