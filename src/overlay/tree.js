import { S } from './state.js';
import { OUTLINE_LABELS } from './constants.js';
import { tierOf } from './classify.js';
import { TAGS } from './styles/tokens.js';
import { showText } from './tiers.js';
import { copyAddress } from './copy.js';
import { forEachNode, setClassState, toArray } from './dom.js';
import { highlight, placeHighlights, unhighlight } from './highlight.js';
import { openCardWhenSettled } from './card.js';
import { emitEvent } from './events.js';
import { findProblems } from './problems.js';

export function clearTreeJumpHighlight() {
  if (S.treeJumpTimer) {
    clearTimeout(S.treeJumpTimer);
    S.treeJumpTimer = null;
  }
  unhighlight('jump');
}

export function clearTreeHoverHighlights() {
  unhighlight('hover');
  if (S.treePanel) {
    forEachNode(S.treePanel.querySelectorAll('.stadiaref-tree-row--active'), function (row) {
      row.classList.remove('stadiaref-tree-row--active');
    });
  }
}

export function jumpToTreeTarget(target) {
  clearTreeJumpHighlight();
  try {
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  } catch (err) {
    target.scrollIntoView();
  }
  highlight('jump', target);
  // Smooth scrolling moves the element; keep the frame on it.
  var started = Date.now();
  (function follow() {
    placeHighlights();
    if (Date.now() - started < 600) requestAnimationFrame(follow);
  })();
  S.treeJumpTimer = setTimeout(function () {
    unhighlight('jump');
    S.treeJumpTimer = null;
  }, 1400);
}

var CLOSE_SVG = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>';
var COPY_SVG = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>';

// A tier tag: SEC, BLK, EL or ?, or AUTO for an automatic address.
export function tierTag(el) {
  var tier = tierOf(el);
  var auto = el.hasAttribute('data-stadiaref-auto');
  var tag = document.createElement('span');
  tag.className = 'stadiaref-tag stadiaref-tag--' + tier + (auto ? ' stadiaref-tag--auto' : '');
  tag.textContent = auto ? 'AUTO' : TAGS[tier].tag;
  return tag;
}

function el(tag, className, text) {
  var n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

// The Tree's header (title, count, meta, search, tier filter and the
// Addresses / Problems tabs) is built once and kept, so a survey that
// rebuilds the list doesn't take focus from the search field.
var FILTERS = [['all', 'All'], ['section', 'Sections'], ['block', 'Blocks'], ['element', 'Elements']];

function view() {
  if (!S.treeView) S.treeView = { query: '', tier: 'all', tab: 'addresses' };
  return S.treeView;
}

function buildHeader() {
  var ui = {};
  var header = el('div', 'stadiaref-tree-panel__header');
  var headerMain = el('div', 'stadiaref-tree-panel__header-main');
  var titleWrap = el('div', 'stadiaref-tree-panel__title-wrap');
  titleWrap.appendChild(el('span', 'stadiaref-tree-panel__title', 'Address tree'));
  ui.count = el('span', 'stadiaref-tree-panel__count');
  titleWrap.appendChild(ui.count);
  var closeBtn = el('button', 'stadiaref-tree-panel__close');
  closeBtn.type = 'button';
  closeBtn.innerHTML = CLOSE_SVG;
  closeBtn.setAttribute('aria-label', 'Close tree panel');
  closeBtn.addEventListener('click', function () { toggleTree(); });
  headerMain.appendChild(titleWrap);
  headerMain.appendChild(closeBtn);
  header.appendChild(headerMain);
  ui.meta = el('div', 'stadiaref-tree-panel__meta');
  header.appendChild(ui.meta);
  ui.hint = el('div', 'stadiaref-tree-panel__hint');
  header.appendChild(ui.hint);

  ui.search = el('input', 'stadiaref-tree-search');
  ui.search.type = 'search';
  ui.search.placeholder = 'Filter addresses';
  ui.search.setAttribute('aria-label', 'Filter addresses');
  ui.search.setAttribute('autocomplete', 'off');
  ui.search.setAttribute('spellcheck', 'false');
  ui.search.addEventListener('input', function () {
    view().query = ui.search.value;
    renderBody();
  });
  header.appendChild(ui.search);

  var controls = el('div', 'stadiaref-tree-controls');
  var tabs = el('div', 'stadiaref-tree-tabs');
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'List');
  ui.tabs = {};
  [['addresses', 'Addresses'], ['problems', 'Problems']].forEach(function (t) {
    var b = el('button', 'stadiaref-tree-tab', t[1]);
    b.type = 'button';
    b.setAttribute('data-stadiaref-tree-tab', t[0]);
    b.addEventListener('click', function () {
      view().tab = t[0];
      syncHeader();
      renderBody();
    });
    ui.tabs[t[0]] = b;
    tabs.appendChild(b);
  });
  controls.appendChild(tabs);
  var filters = el('div', 'stadiaref-tree-filters');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Tier');
  ui.filters = {};
  FILTERS.forEach(function (f) {
    var b = el('button', 'stadiaref-tree-filter', f[1]);
    b.type = 'button';
    b.setAttribute('data-stadiaref-tree-filter', f[0]);
    b.addEventListener('click', function () {
      view().tier = f[0];
      syncHeader();
      renderBody();
    });
    ui.filters[f[0]] = b;
    filters.appendChild(b);
  });
  controls.appendChild(filters);
  header.appendChild(controls);

  ui.header = header;
  ui.body = el('div', 'stadiaref-tree-panel__body');
  S.treeUi = ui;
  S.treePanel.innerHTML = '';
  S.treePanel.setAttribute('role', 'dialog');
  S.treePanel.setAttribute('aria-label', 'Address tree');
  S.treePanel.appendChild(header);
  S.treePanel.appendChild(ui.body);
}

function syncHeader() {
  var ui = S.treeUi;
  var v = view();
  for (var t in ui.tabs) ui.tabs[t].setAttribute('aria-pressed', v.tab === t ? 'true' : 'false');
  for (var f in ui.filters) ui.filters[f].setAttribute('aria-pressed', v.tier === f ? 'true' : 'false');
  ui.filters.all.parentNode.hidden = v.tab !== 'addresses';
  ui.tabs.problems.textContent = 'Problems' + (S.treeProblems && S.treeProblems.length ? ' ' + S.treeProblems.length : '');
}

function sortedRefs() {
  var refs = toArray(document.querySelectorAll('[data-ref]'));
  refs.sort(function (a, b) {
    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });
  return refs;
}

function depthOf(target) {
  var depth = 0;
  for (var ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hasAttribute('data-ref')) depth++;
  }
  return depth;
}

// One row: hover frames the element, a click (or Enter) jumps there and
// opens its card, the copy button copies.
function treeRow(target, opts) {
  var address = target.getAttribute('data-ref');
  var row = el('div', 'stadiaref-tree-row' + (opts.problem ? ' stadiaref-tree-row--problem' : ''));
  row.tabIndex = 0;
  row.title = 'Jump to ' + address;
  row.style.paddingLeft = (12 + (opts.depth || 0) * 18) + 'px';
  if (opts.note) row.appendChild(el('span', 'stadiaref-tree-problem', opts.note));
  else row.appendChild(tierTag(target));
  row.appendChild(el('span', 'stadiaref-tree-ref', opts.label || address));

  var copyBtn = el('button', 'stadiaref-tree-copy');
  copyBtn.type = 'button';
  copyBtn.innerHTML = COPY_SVG;
  copyBtn.setAttribute('aria-label', 'Copy ' + address);
  copyBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    copyAddress(target, address, copyBtn, 'tree');
  });
  if (!opts.noCopy) row.appendChild(copyBtn);

  function on() { highlight('hover', target); row.classList.add('stadiaref-tree-row--active'); }
  function off() { unhighlight('hover'); row.classList.remove('stadiaref-tree-row--active'); }
  row.addEventListener('mouseenter', on);
  row.addEventListener('mouseleave', off);
  row.addEventListener('focus', on);
  row.addEventListener('blur', off);
  row.addEventListener('click', function () { openRow(target); });
  row.addEventListener('keydown', function (e) {
    if (e.target !== row) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openRow(target);
    }
  });
  if (!opts.problem) S.treeRows.push({ el: target, row: row });
  return row;
}

function renderBody() {
  var body = S.treeUi.body;
  var v = view();
  clearTreeHoverHighlights();
  body.innerHTML = '';
  S.treeRows = [];
  var refs = S.treeRefs || [];

  if (v.tab === 'problems') {
    var problems = S.treeProblems || [];
    if (!problems.length) body.appendChild(el('div', 'stadiaref-tree-empty', 'No problems: no duplicates, nothing unclassified, no gaps in numbering.'));
    problems.forEach(function (p) {
      if (p.kind === 'duplicate') {
        p.items.forEach(function (it, i) {
          body.appendChild(treeRow(it.el, { problem: true, note: 'DUP', label: p.address + ' (' + (i + 1) + ' of ' + p.count + ')' }));
        });
      } else if (p.kind === 'unclassified') {
        body.appendChild(treeRow(p.items[0].el, { problem: true, note: '?', label: p.address + ' (unclassified)' }));
      } else {
        var label = p.missing.join(', ') + (p.more ? ' and ' + p.more + ' more' : '') + ' missing, before ' + p.after.address;
        body.appendChild(treeRow(p.after.el, { problem: true, note: 'GAP', label: label, noCopy: true }));
      }
    });
    return;
  }

  if (refs.length === 0) {
    body.appendChild(el('div', 'stadiaref-tree-empty', 'No addresses on this screen yet.'));
    return;
  }
  var q = v.query.trim().toLowerCase();
  var shown = 0;
  forEachNode(refs, function (target) {
    var address = target.getAttribute('data-ref');
    if (q && address.toLowerCase().indexOf(q) === -1) return;
    if (v.tier !== 'all' && tierOf(target) !== v.tier) return;
    shown++;
    // While filtering, rows are flat: the nesting no longer lines up.
    body.appendChild(treeRow(target, { depth: q || v.tier !== 'all' ? 0 : depthOf(target) }));
  });
  if (!shown) body.appendChild(el('div', 'stadiaref-tree-empty', 'No address matches.'));
}

export function buildTreePanel() {
  if (!S.treeUi) buildHeader();
  var refs = sortedRefs();
  var ui = S.treeUi;
  S.treeRefs = refs;
  S.treeProblems = findProblems(refs.map(function (r) {
    return { address: r.getAttribute('data-ref'), tier: tierOf(r), auto: r.hasAttribute('data-stadiaref-auto'), el: r };
  }));
  var outlineLabel = OUTLINE_LABELS[S.outlineMode] || 'Off';
  ui.count.textContent = String(refs.length);
  ui.count.setAttribute('aria-label', refs.length + (refs.length === 1 ? ' address' : ' addresses'));
  ui.meta.innerHTML = '';
  ui.meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Show ' + showText()));
  ui.meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Auto-address ' + (S.autoRefEnabled ? 'on' : 'off')));
  ui.meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Outline ' + outlineLabel));
  ui.hint.textContent = refs.length
    ? 'Hover a row to find it on the page. Click to jump there.'
    : 'Add data-ref attributes, or turn on auto-address.';
  if (ui.search.value !== view().query) ui.search.value = view().query;
  syncHeader();
  renderBody();
}

function rowFor(target) {
  for (var i = 0; i < (S.treeRows || []).length; i++) if (S.treeRows[i].el === target) return S.treeRows[i].row;
  return null;
}

// A row jumps to its element; with the card on, the card opens there once
// the scroll has settled.
function openRow(target) {
  jumpToTreeTarget(target);
  if (S.clickMode !== 'copy') openCardWhenSettled(target);
}

// Open the Tree (if shut) at the row for `target`, and focus that row.
export function showInTree(target) {
  if (!S.treeOpen) toggleTree();
  var found = rowFor(target);
  if (!found && S.treeUi) {
    // Filtered out, or on the Problems tab: show every address.
    S.treeView = { query: '', tier: 'all', tab: 'addresses' };
    buildTreePanel();
    found = rowFor(target);
  }
  if (!found) return false;
  try { found.scrollIntoView({ block: 'center' }); } catch (e) { found.scrollIntoView(); }
  found.focus({ preventScroll: true });
  return true;
}

export function toggleTree() {
  S.treeOpen = !S.treeOpen;
  setClassState(S.treePanel, 'stadiaref-tree-panel--open', S.treeOpen);
  if (S.treeOpen) buildTreePanel();
  else {
    clearTreeJumpHighlight();
    clearTreeHoverHighlights();
  }
  var treeBtn = S.toolbar.querySelector('[data-stadiaref-toggle-tree]');
  if (treeBtn) {
    treeBtn.setAttribute('aria-pressed', S.treeOpen ? 'true' : 'false');
  }
  applyTreeWidth();
  if (S.applyDockPosition) S.applyDockPosition();
  emitEvent('tree', { open: S.treeOpen, width: S.treeWidth });
}

// ─── Push mode ──────────────────────────────────────────────
// tree: 'push' docks the Tree as a full-height column on the right and
// tells the host how wide it is, so the host can make room:
// --stadiaref-tree-w on <html> (0px when shut) and stadiaref:tree.
// tree: 'overlay' (the default) floats it over the page and sets nothing.
export function setTreeMode(value) {
  if (value !== 'overlay' && value !== 'push') {
    if (typeof console !== 'undefined' && console.warn) console.warn('[stadiaref] tree expected "overlay" or "push", got', value);
    return;
  }
  if (S.treeMode === value) return;
  S.treeMode = value;
  setClassState(S.treePanel, 'stadiaref-tree-panel--push', value === 'push');
  var was = S.treeWidth;
  applyTreeWidth();
  if (S.applyDockPosition) S.applyDockPosition();
  if (S.treeOpen && was !== S.treeWidth) emitEvent('tree', { open: true, width: S.treeWidth });
}

// The width the Tree takes from the page: its own in push mode while open.
export function applyTreeWidth() {
  var push = S.treeMode === 'push';
  S.treeWidth = push && S.treeOpen && S.treePanel ? S.treePanel.offsetWidth : 0;
  var root = document.documentElement;
  if (push && S.mounted) root.style.setProperty('--stadiaref-tree-w', S.treeWidth + 'px');
  else if (root.style.getPropertyValue('--stadiaref-tree-w')) root.style.removeProperty('--stadiaref-tree-w');
}

// After a resize the column may be narrower: tell the host.
export function refreshTreeWidth() {
  if (S.treeMode !== 'push' || !S.treeOpen) return;
  var was = S.treeWidth;
  applyTreeWidth();
  if (was !== S.treeWidth) {
    if (S.applyDockPosition) S.applyDockPosition();
    emitEvent('tree', { open: true, width: S.treeWidth });
  }
}
