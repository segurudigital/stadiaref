/**
 * StadiaRef — an address for every part of the screen.
 * https://github.com/segurudigital/stadiaref
 *
 * Shows data-ref attributes as labels you can point at and copy.
 * Starts hidden: press D to show it. Labels (L), outline (O), the Tree,
 * click-to-copy and the JavaScript API on window.stadiaref.
 *
 * Usage:
 *   <script src="stadiaref.min.js"></script>
 *   window.stadiarefConfig = { … } before the tag to configure it.
 */

// Entry point. esbuild bundles this file and its imports into the single
// IIFE in dist/. Importing modules does no DOM work. Start-up order:
//   1. the global is assigned, so code that runs during start can see it
//   2. boot() reads config and builds the DOM; once the document is ready
//      init() applies queued calls, resolves `ready`, then fires
//      stadiaref:ready (and sdt:ready)
import { S } from './state.js';
import { api, queueable } from './api.js';
import { boot } from './boot.js';
import { installAliases, legacyRunning } from '../compat/aliases.js';

// Never boot twice: if StadiaRef 3.x, or a 2.x copy loaded by an old
// plugin or script tag, is already running on the page, this copy doesn't
// start (rule 7).
function alreadyRunning() {
  if (window.stadiaref && typeof window.stadiaref === 'object' && window.stadiaref.version) return 'StadiaRef ' + window.stadiaref.version;
  if (legacyRunning()) return 'Seguru Debug Toolbar 2.x';
  if (document.querySelector('[data-stadiaref-root]')) return 'StadiaRef';
  return null;
}

var running = alreadyRunning();
if (running) {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('[stadiaref] ' + running + ' is already running on this page; this copy did not start.');
  }
} else {
  api.ready = new Promise(function (resolve) {
    S.resolveReady = function () { resolve(api); };
  });
  installAliases(api, queueable);
  window.stadiaref = api;

  boot();
}
