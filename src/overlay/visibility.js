import { S } from './state.js';
import { rec } from './records.js';
import { forEachNode } from './dom.js';
import { isLabelled, resolveLabelOverlaps } from './labels.js';
import { isLive } from './mount.js';

// ─── Background luminance detection ────────────────────────
// Walks up the DOM to find the first non-transparent background,
// then returns its relative luminance (0=black, 1=white).
export function getEffectiveBgLuminance(el) {
  var current = el;
  while (current && current !== document.documentElement) {
    var bg = window.getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      var match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        var r = parseInt(match[1]) / 255;
        var g = parseInt(match[2]) / 255;
        var b = parseInt(match[3]) / 255;
        // WCAG relative luminance formula
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
    }
    current = current.parentElement;
  }
  return 1; // default: assume light
}

// ─── Effective visibility detection ────────────────────────
// Walks ancestors to detect display:none / visibility:hidden / opacity:0,
// which are common patterns for hidden mega-menus, dropdowns, modals, and
// tabs. Returns false for any element whose ancestor chain makes it
// visually hidden so we can suppress its labels — otherwise invisible
// .stadiaref-ref-icon nodes would intercept clicks on the visible content
// beneath them (mitigated structurally by the .stadiaref-visible-host gate
// below; this check is what controls when the gate is added). Stops at
// <html> to avoid measuring the document itself.
//
// Mid-transition guard — when an ancestor has a configured opacity (or
// visibility / all) transition with non-zero duration AND its current
// computed opacity is between 0 and 1 exclusive, we treat the chain as
// hidden. The reason: getComputedStyle reads the live *animated* value
// during a transition, so a panel fading 1 → 0 reports ~0.62 at t=50ms
// — large enough to look visible to the simple `=== 0` check, but the
// panel is on its way to opacity:0 and clicks on the visible content
// beneath are about to land there, not on the panel. Treating
// mid-transition values as untrusted closes the 16–200ms click-intercept
// race on the close path. The transitionend listener re-evaluates once
// opacity has settled (seen with a 200ms opacity ease-out on a mega-menu).
export function isEffectivelyVisible(el) {
  var cur = el;
  while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
    var cs;
    try { cs = window.getComputedStyle(cur); } catch (e) { return true; }
    if (!cs) return true;
    if (cs.display === 'none') return false;
    if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    var opacity = parseFloat(cs.opacity);
    if (opacity === 0) return false;
    if (opacity < 1 && isOpacityTransitioning(cs)) return false;
    cur = cur.parentElement;
  }
  return true;
}

// True when the computed style carries a non-zero transition-duration for
// opacity, visibility, or `all`. Used by isEffectivelyVisible to know
// when to distrust mid-flight opacity values. transitionProperty and
// transitionDuration are returned as comma-separated lists when the host
// sets multiple — we compare them index-by-index, falling back to the
// first duration if the list is shorter than the property list (the
// CSS spec rule for missing values).
export function isOpacityTransitioning(cs) {
  if (!cs) return false;
  var props = (cs.transitionProperty || '').split(',');
  var durs = (cs.transitionDuration || '').split(',');
  for (var i = 0; i < props.length; i++) {
    var p = (props[i] || '').replace(/\s+/g, '');
    var rawDur = durs[i] != null ? durs[i] : (durs[0] || '0s');
    var d = parseFloat(rawDur);
    if (d > 0 && (p === 'opacity' || p === 'visibility' || p === 'all')) {
      return true;
    }
  }
  return false;
}

export function applyLabelVisibilityState() {
  if (!isLive()) return false;
  var refs = document.querySelectorAll('[data-ref]');
  var anyChanged = false;
  forEachNode(refs, function (el) {
    if (!isLabelled(el)) return;
    var visible = isEffectivelyVisible(el);
    if (rec(el).visible === visible) return;
    rec(el).visible = visible;
    anyChanged = true;
    var nodes = [rec(el).icon, rec(el).tooltip, rec(el).fullLabel, rec(el).link];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n) continue;
      if (visible) {
        n.classList.remove('stadiaref-ref-hidden');
        // Only icon and full-label opt in to pointer-events:auto — the
        // tooltip stays pointer-events:none until the icon is hovered
        // (existing :hover + .stadiaref-ref-tooltip rule), and the link is
        // pointer-events:none by design.
        if (n === rec(el).icon || n === rec(el).fullLabel) {
          n.classList.add('stadiaref-visible-host');
        }
      } else {
        n.classList.add('stadiaref-ref-hidden');
        n.classList.remove('stadiaref-visible-host');
      }
    }
  });
  return anyChanged;
}

// Eager-hide on mutation — the timing brace to the .stadiaref-visible-host gate.
// The MutationObserver fires synchronously after an ancestor's class or
// style changes. Without this, the next rAF tick is the first chance to
// re-evaluate visibility, leaving a ~16ms window in which labels stay
// pointer-events:auto and intercept clicks on visible content that's
// about to be revealed. Adding .stadiaref-ref-hidden and removing
// .stadiaref-visible-host eagerly is safe: the worst case is a brief 1-frame
// flicker for labels that turn out to still be visible (rAF re-eval will
// unhide them). Restricted to subtrees that actually contain [data-ref]
// descendants so unrelated DOM churn doesn't pay the cost.
export function eagerHideDescendantLabels(node) {
  if (!isLive() || !node || node.nodeType !== 1) return;
  var refs = [];
  if (node.hasAttribute && node.hasAttribute('data-ref') && isLabelled(node)) refs.push(node);
  if (node.querySelectorAll) {
    var inner = node.querySelectorAll('[data-ref]');
    for (var i = 0; i < inner.length; i++) {
      if (isLabelled(inner[i])) refs.push(inner[i]);
    }
  }
  for (var j = 0; j < refs.length; j++) {
    var el = refs[j];
    var nodes = [rec(el).icon, rec(el).tooltip, rec(el).fullLabel, rec(el).link];
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      if (!n) continue;
      n.classList.add('stadiaref-ref-hidden');
      n.classList.remove('stadiaref-visible-host');
    }
    // Clear cached visibility so the rAF tick definitely re-runs the
    // check rather than skipping due to the "visible === visible" early
    // return.
    rec(el).visible = null;
  }
}
export function scheduleVisibilityRecheck() {
  if (S.visibilityRecheckScheduled) return;
  S.visibilityRecheckScheduled = true;
  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
  raf(function () {
    S.visibilityRecheckScheduled = false;
    if (applyLabelVisibilityState()) resolveLabelOverlaps();
  });
}
