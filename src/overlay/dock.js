import { S } from './state.js';
import { closeAllDropdowns } from './toolbar.js';
import { isLive } from './mount.js';
import { astroBarReach, toolbarHosted } from './host.js';

// ─── Position config ────────────────────────────────────────
// `dock` is the canonical name; `position` is the legacy alias kept for back-compat.
// 'auto' is resolved at runtime (after the DOM exists) — boot() records it
// as a placeholder that init() resolves before applyDockPosition() runs.
export const DOCK_VALUES = { 'bottom-right': 1, 'bottom-left': 1, 'top-right': 1, 'top-left': 1 };
export function normalizeDock(value) {
  if (typeof value !== 'string') return null;
  var lower = value.toLowerCase();
  return DOCK_VALUES[lower] ? lower : null;
}
// Distance from the viewport edges, and the gap between the toolbar and the
// panels and toast that open beside it.
var EDGE = 20;
var GAP = 8;
export function applyStyleSnippet(el, snippet) {
  if (!el) return;
  el.style.top = '';
  el.style.bottom = '';
  el.style.left = '';
  el.style.right = '';
  if (!snippet) return;
  var parts = snippet.split(';');
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p) continue;
    var idx = p.indexOf(':');
    if (idx === -1) continue;
    var key = p.slice(0, idx).trim();
    var val = p.slice(idx + 1).trim();
    if (!key || !val) continue;
    var camel = key.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    try { el.style[camel] = val; } catch (e) { /* ignore unknown */ }
  }
}

// The dock offsets: the device's safe-area inset on every side, plus either
// the configured dockOffset for that side or, failing that, the height of a
// full-width fixed bar on the edge the toolbar is docked on.
var SIDES = ['top', 'right', 'bottom', 'left'];

export function normalizeDockOffset(value) {
  if (!value || typeof value !== 'object') return null;
  var out = {};
  var any = false;
  for (var i = 0; i < SIDES.length; i++) {
    var n = Number(value[SIDES[i]]);
    if (typeof value[SIDES[i]] !== 'undefined' && isFinite(n)) { out[SIDES[i]] = n; any = true; }
  }
  return any ? out : null;
}

function isOwnNode(el) {
  return !!S.shadowHost && (el === S.shadowHost || S.shadowHost.contains(el));
}

// A fixed or sticky element at least 80% of the viewport wide that touches
// `edge` (top or bottom): how far it reaches into the viewport, or 0.
// Sampled with elementsFromPoint along that edge, so only what is actually
// there is measured.
export function fixedBarOffset(edge) {
  var w = window.innerWidth || document.documentElement.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight;
  if (!w || !h || typeof document.elementsFromPoint !== 'function') return 0;
  var y = edge === 'top' ? 1 : h - 2;
  var best = 0;
  var seen = [];
  var xs = [0.1, 0.5, 0.9];
  for (var i = 0; i < xs.length; i++) {
    var stack = document.elementsFromPoint(Math.round(w * xs[i]), y);
    for (var j = 0; j < stack.length; j++) {
      for (var el = stack[j]; el && el.nodeType === 1 && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        if (seen.indexOf(el) !== -1 || isOwnNode(el)) continue;
        seen.push(el);
        var cs = window.getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        var r = el.getBoundingClientRect();
        if (r.width < w * 0.8) continue;
        var reach = edge === 'top' ? (r.top <= 1 ? r.bottom : 0) : (r.bottom >= h - 1 ? h - r.top : 0);
        if (reach > best && reach < h / 2) best = reach;
      }
    }
  }
  return Math.round(best);
}

// The CSS length of the gap between the viewport edge `side` and StadiaRef's
// docked pieces, before the base EDGE distance.
function sideOffset(side, dockedV) {
  var set = S.dockOffset && typeof S.dockOffset[side] === 'number';
  var extra = 0;
  if (set) extra = S.dockOffset[side];
  else if (side === dockedV && isLive()) {
    extra = fixedBarOffset(side);
    // In Astro's Dev Toolbar, keep clear of Astro's bar too.
    if (side === 'bottom' && toolbarHosted()) extra = Math.max(extra, astroBarReach());
  }
  return 'env(safe-area-inset-' + side + ', 0px) + ' + extra + 'px';
}

function at(px, side, dockedV) {
  return 'calc(' + px + 'px + ' + sideOffset(side, dockedV) + ')';
}

// Place the toolbar in its corner; the dialog status line, the toast and the
// panels open beside it, clear of its measured height (the compact toolbar
// wraps onto more rows); the address chain opens at the opposite edge so it
// never covers the toolbar.
export function applyDockPosition() {
  var pos = DOCK_VALUES[S.position] ? S.position : 'bottom-right';
  var parts = pos.split('-');
  var v = parts[0];
  var h = parts[1];
  var opposite = v === 'top' ? 'bottom' : 'top';
  // With the toolbar drawn by a host, the panels take its place in the corner.
  var near = toolbarHosted() ? EDGE : EDGE + ((S.toolbar && S.toolbar.offsetHeight) || 40) + GAP;
  var status = S.dialogStatus && !S.dialogStatus.hidden ? S.dialogStatus.offsetHeight + GAP : 0;
  var side = h + ':' + at(EDGE, h, v) + ';' + (h === 'left' ? 'right:auto;' : 'left:auto;');
  applyStyleSnippet(S.toolbar, v + ':' + at(EDGE, v, v) + ';' + opposite + ':auto;' + side);
  applyStyleSnippet(S.dialogStatus, v + ':' + at(near, v, v) + ';' + opposite + ':auto;' + side);
  applyStyleSnippet(S.toast, v + ':' + at(near + status, v, v) + ';' + opposite + ':auto;' + side);
  applyStyleSnippet(S.treePanel, v + ':' + at(near + status, v, v) + ';' + opposite + ':auto;' + side);
  applyStyleSnippet(S.findPanel, v + ':' + at(near + status, v, v) + ';' + opposite + ':auto;' + side);
  applyStyleSnippet(S.activeRefTree, opposite + ':' + at(EDGE, opposite, v) + ';' + v + ':auto;' + side);
  if (S.shadowHost && S.shadowHost.getAttribute('data-stadiaref-dock') !== pos) S.shadowHost.setAttribute('data-stadiaref-dock', pos);
}

// Heuristic for `dock: 'auto'` — pick the corner least likely to collide
// with a fixed sidebar / panel / banner / modal. Inspects fixed + sticky
// elements that are at least 100×100px and overlap a 220×60px box anchored
// at each corner. Preference order matches the static default
// (bottom-right > bottom-left > top-right > top-left). The choice is sticky
// — we don't re-evaluate on resize.
export function pickAutoDock() {
  var w = (window.innerWidth || document.documentElement.clientWidth || 1024);
  var h = (window.innerHeight || document.documentElement.clientHeight || 768);
  var corners = {
    'bottom-right': { x1: w - 220, y1: h - 60, x2: w,   y2: h },
    'bottom-left':  { x1: 0,       y1: h - 60, x2: 220, y2: h },
    'top-right':    { x1: w - 220, y1: 0,      x2: w,   y2: 60 },
    'top-left':     { x1: 0,       y1: 0,      x2: 220, y2: 60 }
  };
  var blocked = { 'bottom-right': false, 'bottom-left': false, 'top-right': false, 'top-left': false };

  if (!document.body) return 'bottom-right';
  var candidates = document.body.querySelectorAll('*');
  for (var i = 0; i < candidates.length; i++) {
    var el = candidates[i];
    if (el === S.shadowHost || (S.shadowHost && S.shadowHost.contains(el))) continue;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { continue; }
    if (!cs) continue;
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    var r;
    try { r = el.getBoundingClientRect(); } catch (e) { continue; }
    if (!r || r.width < 100 || r.height < 100) continue;
    for (var name in corners) {
      if (!Object.prototype.hasOwnProperty.call(corners, name)) continue;
      var c = corners[name];
      if (!(r.right < c.x1 || r.left > c.x2 || r.bottom < c.y1 || r.top > c.y2)) {
        blocked[name] = true;
      }
    }
  }
  var pref = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  for (var p = 0; p < pref.length; p++) {
    if (!blocked[pref[p]]) return pref[p];
  }
  return 'bottom-right';
}

export function setDock(value) {
  var normalized;
  if (value === 'auto') {
    normalized = pickAutoDock();
  } else {
    normalized = normalizeDock(value);
  }
  if (!normalized) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setDock expected auto/bottom-right/bottom-left/top-right/top-left, got', value);
    }
    return;
  }
  S.position = normalized;
  closeAllDropdowns();
  applyDockPosition();
}
