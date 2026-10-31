import { S } from './state.js';
import { hasRecord, rec } from './records.js';
import { tierOf } from './classify.js';
import { forEachNode } from './dom.js';
import { emitEvent } from './events.js';
import { highlight, unhighlight } from './highlight.js';
import { isLive } from './mount.js';
import { resolveLabelOverlaps } from './labels.js';

// ─── Drill-down (on by default; drill: false turns it off) ───
// Narrow the view to one section or block: labels outside it are hidden,
// the rest of the page is dimmed, and a breadcrumb at the top says where
// you are. Each crumb drills to that level; All leaves. Esc leaves too,
// after the card and Pick or Find.

var OUTSIDE = 'stadiaref-ref-outside-drill';

function labelNodes(el) {
  var r = rec(el);
  return [r.icon, r.tooltip, r.fullLabel, r.link, r.clusterBadge, r.groupBadge];
}

// Mark every label outside the drilled element. Called after each survey.
export function applyDrill() {
  var root = S.drillRoot;
  if (root && !root.isConnected) { exitDrill(); return; }
  forEachNode(document.querySelectorAll('[data-ref]'), function (el) {
    if (!hasRecord(el)) return;
    var outside = !!root && el !== root && !root.contains(el);
    var nodes = labelNodes(el);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n && n.classList && n.classList.contains(OUTSIDE) !== outside) n.classList.toggle(OUTSIDE, outside);
    }
  });
}

function crumbs() {
  if (S.drillBar) return S.drillBar;
  var bar = document.createElement('nav');
  bar.className = 'stadiaref-drill';
  bar.setAttribute('aria-label', 'Drill-down');
  bar.hidden = true;
  S.shadowRoot.appendChild(bar);
  S.drillBar = bar;
  return bar;
}

function crumb(text, onClick, current) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'stadiaref-drill__crumb';
  b.textContent = text;
  if (current) b.setAttribute('aria-current', 'true');
  b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
  return b;
}

function renderBar() {
  var bar = crumbs();
  bar.innerHTML = '';
  var root = S.drillRoot;
  if (!root) { bar.hidden = true; return; }
  bar.appendChild(crumb('All', exitDrill, false));
  var chain = [];
  for (var cur = root; cur; cur = cur.parentElement) if (cur.nodeType === 1 && cur.hasAttribute('data-ref')) chain.unshift(cur);
  chain.forEach(function (el) {
    var sep = document.createElement('span');
    sep.className = 'stadiaref-drill__sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '/';
    bar.appendChild(sep);
    bar.appendChild(crumb(el.getAttribute('data-ref'), function () { drillInto(el); }, el === root));
  });
  bar.hidden = false;
}

export function drillInto(el) {
  if (!S.drillEnabled || !el || !el.getAttribute || !el.getAttribute('data-ref') || !isLive()) return false;
  S.drillRoot = el;
  if (S.closeCard) S.closeCard();
  highlight('drill', el);
  renderBar();
  applyDrill();
  resolveLabelOverlaps();
  emitEvent('drill', { address: el.getAttribute('data-ref'), tier: tierOf(el), element: el });
  return true;
}

export function exitDrill() {
  if (!S.drillRoot) return false;
  S.drillRoot = null;
  unhighlight('drill');
  renderBar();
  applyDrill();
  resolveLabelOverlaps();
  emitEvent('drill', { address: null, tier: null, element: null });
  return true;
}

export function isDrilled() {
  return !!S.drillRoot;
}
