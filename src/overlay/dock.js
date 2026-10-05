import { S } from './state.js';
import { closeAllDropdowns } from './toolbar.js';

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
export const posMap = {
  'bottom-right': 'bottom:20px;right:20px;',
  'bottom-left':  'bottom:20px;left:20px;right:auto;',
  'top-right':    'top:20px;bottom:auto;right:20px;',
  'top-left':     'top:20px;bottom:auto;left:20px;right:auto;'
};
export const toastPosMap = {
  'bottom-right': 'bottom:64px;right:20px;',
  'bottom-left':  'bottom:64px;left:20px;right:auto;',
  'top-right':    'top:64px;bottom:auto;right:20px;',
  'top-left':     'top:64px;bottom:auto;left:20px;right:auto;'
};
export const treePanelPosMap = {
  'bottom-right': 'bottom:64px;right:20px;',
  'bottom-left':  'bottom:64px;left:20px;right:auto;',
  'top-right':    'top:64px;bottom:auto;right:20px;',
  'top-left':     'top:64px;bottom:auto;left:20px;right:auto;'
};
// Active-ref tree anchors at the opposite vertical edge so it never
// overlaps the toolbar. Same horizontal side as the toolbar.
export const activeRefTreePosMap = {
  'bottom-right': 'top:20px;right:20px;',
  'bottom-left':  'top:20px;left:20px;right:auto;',
  'top-right':    'bottom:20px;top:auto;right:20px;',
  'top-left':     'bottom:20px;top:auto;left:20px;right:auto;'
};

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

export function applyDockPosition() {
  applyStyleSnippet(S.toolbar, posMap[S.position] || posMap['bottom-right']);
  applyStyleSnippet(S.toast, toastPosMap[S.position] || toastPosMap['bottom-right']);
  applyStyleSnippet(S.treePanel, treePanelPosMap[S.position] || treePanelPosMap['bottom-right']);
  applyStyleSnippet(S.activeRefTree, activeRefTreePosMap[S.position] || activeRefTreePosMap['bottom-right']);
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
      console.warn('[seguru-debug-toolbar] setDock expected auto/bottom-right/bottom-left/top-right/top-left, got', value);
    }
    return;
  }
  S.position = normalized;
  closeAllDropdowns();
  applyDockPosition();
}
