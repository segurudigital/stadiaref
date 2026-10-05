import { S } from './state.js';
import { applyRootState, isLive, survey } from './mount.js';
import { applyDialogScope } from './dialogs.js';
import { resolveLabelOverlaps } from './labels.js';
import { eagerHideDescendantLabels, scheduleVisibilityRecheck } from './visibility.js';

// ─── Watching the page ───────────────────────────────────────
// One MutationObserver on <html> keeps StadiaRef in step with an app that
// owns its DOM: nodes added and removed, an address changed on a reused
// node, a late dataref- class, visibility changes, dialogs opening, a label
// deleted by a re-render, the host or the stylesheet removed by a router
// that swaps <body>. Changes are gathered and handled once per frame, so a
// page that adds a thousand nodes in one tick gets one survey. StadiaRef's
// own nodes are ignored, except a label node the page removed, which means
// its element needs relabelling. With `watch: false` only visibility,
// dialogs and self-repair are followed; call refresh() after changes.

var LABEL_NODE = /(^|\s)stadiaref-(ref-icon|ref-tooltip|ref-full-label|ref-link|ref-void-host)(\s|$)/;
var WATCHED_ATTRS = ['data-ref', 'class', 'style', 'hidden', 'open', 'role', 'aria-modal',
  'data-stadiaref-visible', 'data-stadiaref-labels', 'data-stadiaref-hidden-tiers', 'data-stadiaref-mode'];

function isOwn(node) {
  if (!node) return false;
  if (node === S.shadowHost || node === S.labelCss) return true;
  if (node.nodeType !== 1) return false;
  var c = node.getAttribute('class');
  return !!(c && /(^|\s)stadiaref-/.test(c));
}

function frame(fn) {
  return (window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); })(fn);
}

// Gather what a batch of mutations needs, and do it on the next frame.
function request(need) {
  var p = S.pendingWork || (S.pendingWork = {});
  for (var k in need) if (need[k]) p[k] = true;
  if (S.workScheduled) return;
  S.workScheduled = true;
  frame(function () {
    S.workScheduled = false;
    var work = S.pendingWork;
    S.pendingWork = null;
    if (!work || !S.mounted) return;
    if (work.heal) heal();
    if (!isLive()) return;
    if (work.root) applyRootState();
    if (work.survey) { survey(); return; }
    if (work.visibility) scheduleVisibilityRecheck();
    else if (work.layout) resolveLabelOverlaps();
    applyDialogScope();
    quiet();
  });
}

function onMutations(mutations) {
  if (!S.mounted) return;
  var need = {};
  for (var i = 0; i < mutations.length; i++) {
    var m = mutations[i];
    if (m.type === 'childList') {
      if (isOwn(m.target)) {
        // Inside StadiaRef's own nodes (a badge's list, a void host): nothing
        // of the page's.
        continue;
      }
      for (var a = 0; a < m.addedNodes.length; a++) {
        var added = m.addedNodes[a];
        if (isOwn(added)) continue;
        if (added.nodeType === 1 || added.nodeType === 3) need.survey = true;
      }
      for (var r = 0; r < m.removedNodes.length; r++) {
        var removed = m.removedNodes[r];
        // The host moves into an open dialog and back (dialogs.js); only a
        // host or stylesheet that has left the page needs putting back.
        if (removed === S.shadowHost || removed === S.labelCss) {
          if (!removed.isConnected) need.heal = true;
          continue;
        }
        if (isOwn(removed)) {
          if (S.selfRemoved.has(removed)) continue;
          // The page removed one of StadiaRef's labels: relabel.
          if (LABEL_NODE.test(removed.getAttribute('class') || '')) need.survey = true;
          continue;
        }
        need.survey = true;
        if (removed.nodeType === 1 && S.shadowHost && removed.contains(S.shadowHost)) need.heal = true;
      }
    } else if (m.type === 'attributes') {
      var t = m.target;
      var name = m.attributeName;
      if (t === document.documentElement && name.indexOf('data-stadiaref-') === 0) { need.root = true; continue; }
      if (isOwn(t)) continue;
      if (name === 'data-ref') need.survey = true;
      else if (name === 'class') {
        need.visibility = true;
        if (S.classConverterEnabled) need.survey = true;
        // A class on <html> is a theme switch, not a container closing.
        if (t !== document.documentElement) eagerHideDescendantLabels(t);
      } else if (name === 'style' || name === 'hidden' || name === 'open') {
        need.visibility = true;
        need.layout = true;
        eagerHideDescendantLabels(t);
      } else if (name === 'role' || name === 'aria-modal') {
        need.layout = true;
      }
    }
  }
  if (S.shadowHost && !S.shadowHost.isConnected) need.heal = true;
  if (!S.watch) need.survey = false;
  if (need.heal || need.survey || need.visibility || need.root || need.layout) request(need);
}

export function startWatching() {
  if (S.observer || typeof window.MutationObserver !== 'function') return;
  S.observer = new window.MutationObserver(onMutations);
  S.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: WATCHED_ATTRS
  });
  if (!S.navListening) {
    S.navListening = true;
    var onNav = function () { if (S.watch && S.mounted) request({ survey: true }); };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    // Astro's client router swaps <body>; after it, put StadiaRef back.
    var onSwap = function () { if (S.mounted) request({ heal: true, survey: true }); };
    document.addEventListener('astro:after-swap', onSwap);
    document.addEventListener('astro:page-load', onSwap);
  }
}

// Forget the mutations StadiaRef's own writes just caused (stamping
// automatic addresses, adding labels), so a survey doesn't schedule another.
export function quiet() {
  if (!S.observer) return;
  S.observer.takeRecords();
  if (document.body && (!S.shadowHost.isConnected || !S.labelCss.isConnected)) request({ heal: true });
}

// Put the host and the label stylesheet back if the page removed them, and
// re-survey.
export function heal() {
  if (!S.mounted) return;
  var healed = false;
  if (!S.labelCss.isConnected && document.head) {
    document.head.appendChild(S.labelCss);
    healed = true;
  }
  if (!S.shadowHost.isConnected && document.body) {
    document.body.appendChild(S.shadowHost);
    S.scopeModal = null;
    healed = true;
  }
  if (healed && isLive()) {
    applyRootState();
    survey();
  }
}

// The test hook for rule 5: survey() leaves a performance mark each time.
// Old marks are dropped so long sessions don't collect them.
export function markSurvey() {
  if (typeof performance === 'undefined' || !performance.mark) return;
  try {
    if (performance.getEntriesByName('stadiaref:survey').length > 200) performance.clearMarks('stadiaref:survey');
    performance.mark('stadiaref:survey');
  } catch (e) { /* ignore */ }
}
