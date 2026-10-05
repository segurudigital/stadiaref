import { S } from './state.js';
import { api, queueable } from './api.js';
import { boot } from './boot.js';
import { installAliases, legacyRunning } from '../compat/aliases.js';

// Start-up order:
//   1. the global is assigned, so code that runs during start can see it
//   2. boot() reads config and builds the DOM; once the document is ready
//      init() applies queued calls, resolves `ready`, then fires
//      stadiaref:ready (and sdt:ready)

// Never boot twice: if StadiaRef 3.x, or a 2.x copy loaded by an old
// plugin or script tag, is already running on the page, this copy doesn't
// start (rule 7).
function alreadyRunning() {
  if (window.stadiaref && typeof window.stadiaref === 'object' && window.stadiaref.version) return 'StadiaRef ' + window.stadiaref.version;
  if (legacyRunning()) return 'Seguru Debug Toolbar 2.x';
  if (document.querySelector('[data-stadiaref-root]')) return 'StadiaRef';
  return null;
}

// Start the overlay once, in a browser. Returns the API running on the page:
// this one, or the 3.x copy that was already there. Outside a browser it
// does nothing and returns undefined.
export function start() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
  var running = alreadyRunning();
  if (running) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] ' + running + ' is already running on this page; this copy did not start.');
    }
    return window.stadiaref && window.stadiaref.version ? window.stadiaref : undefined;
  }
  api.ready = new Promise(function (resolve) {
    S.resolveReady = function () { resolve(api); };
  });
  installAliases(api, queueable);
  window.stadiaref = api;
  boot();
  return api;
}
