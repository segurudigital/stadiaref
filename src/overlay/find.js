import { S } from './state.js';
import { copyAddress } from './copy.js';
import { openHostModal } from './dialogs.js';
import { applyDockPosition } from './dock.js';
import { highlight, placeHighlights, unhighlight } from './highlight.js';
import { tierTag } from './tree.js';
import { isEffectivelyVisible } from './visibility.js';

// ─── Find ───────────────────────────────────────────────────
// Go to an address you already have. Matching is by substring against
// every address in the DOM, including tiers Show is hiding and automatic
// addresses; while a host dialog is open, only inside it. A match inside a
// closed container is listed as hidden and can't be jumped to. When exactly
// one address equals the query, the addresses nested inside it are listed
// too. Jumping scrolls to the element, frames it and dims the rest of the
// page with one fixed layer that takes no pointer events.

function ensurePanel() {
  if (S.findPanel) return S.findPanel;
  var panel = document.createElement('div');
  panel.className = 'stadiaref-find';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Find an address');
  panel.innerHTML =
    '<label class="stadiaref-find__label">Find an address' +
      '<input class="stadiaref-find__input" type="search" autocomplete="off" spellcheck="false" aria-controls="stadiaref-find-list">' +
    '</label>' +
    '<div class="stadiaref-find__list" id="stadiaref-find-list" role="listbox" aria-label="Matches"></div>' +
    '<div class="stadiaref-find__status" role="status" aria-live="polite"></div>';
  S.shadowRoot.appendChild(panel);
  S.findPanel = panel;
  var input = panel.querySelector('input');
  input.addEventListener('input', function () { search(input.value); });
  input.addEventListener('keydown', onInputKey);
  return panel;
}

function scope() {
  var modal = openHostModal();
  return modal || document;
}

// Every addressed element in scope, in document order, that contains q.
export function matchAddresses(q) {
  var query = String(q || '').trim().toLowerCase();
  if (!query) return [];
  var root = scope();
  var all = Array.prototype.slice.call(root.querySelectorAll('[data-ref]'));
  if (root !== document && root.hasAttribute('data-ref')) all.unshift(root);
  return all.filter(function (el) { return el.getAttribute('data-ref').toLowerCase().indexOf(query) !== -1; });
}

function search(q) {
  var f = S.findState;
  f.query = q;
  var query = String(q || '').trim().toLowerCase();
  var matches = matchAddresses(query);
  var rows = matches.map(function (el) { return { el: el, nested: false }; });
  var exact = matches.filter(function (el) { return el.getAttribute('data-ref').toLowerCase() === query; });
  var nestedCount = 0;
  if (exact.length === 1) {
    var inside = Array.prototype.slice.call(exact[0].querySelectorAll('[data-ref]'));
    rows = [{ el: exact[0], nested: false }];
    inside.forEach(function (el) { rows.push({ el: el, nested: true }); });
    nestedCount = inside.length;
  }
  f.matches = matches;
  f.rows = rows.map(function (r) { r.hidden = !isEffectivelyVisible(r.el); return r; });
  f.active = firstJumpable();
  render(exact.length === 1 ? 1 : matches.length, nestedCount, query);
  return matches.map(function (el) { return el.getAttribute('data-ref'); });
}

function firstJumpable() {
  var rows = S.findState.rows;
  for (var i = 0; i < rows.length; i++) if (!rows[i].hidden) return i;
  return -1;
}

function render(count, nestedCount, query) {
  var f = S.findState;
  var list = S.findPanel.querySelector('.stadiaref-find__list');
  var status = S.findPanel.querySelector('.stadiaref-find__status');
  list.innerHTML = '';
  f.rows.forEach(function (r, i) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'stadiaref-find__row';
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', i === f.active ? 'true' : 'false');
    row.tabIndex = -1;
    if (r.nested) row.style.paddingLeft = '26px';
    row.appendChild(tierTag(r.el));
    var a = document.createElement('span');
    a.className = 'stadiaref-find__address';
    a.textContent = r.el.getAttribute('data-ref');
    row.appendChild(a);
    if (r.hidden) {
      var note = document.createElement('span');
      note.className = 'stadiaref-find__note';
      note.textContent = 'hidden';
      row.appendChild(note);
      row.setAttribute('aria-disabled', 'true');
      row.title = 'Inside something that is closed. Open it to jump there.';
    }
    row.addEventListener('click', function () {
      if (r.hidden) return;
      f.active = i;
      jump(r.el);
      copyAddress(r.el, r.el.getAttribute('data-ref'), row, 'find');
      markActive();
    });
    list.appendChild(row);
  });
  if (!query) status.textContent = 'Type or paste an address.';
  else if (!count) status.textContent = 'No address contains “' + query + '”.';
  else if (nestedCount) status.textContent = '1 match, plus the ' + nestedCount + ' address' + (nestedCount === 1 ? '' : 'es') + ' inside it. Enter jumps to the first.';
  else status.textContent = count + (count === 1 ? ' match.' : ' matches.') + ' Enter jumps to the first.';
}

function markActive() {
  var list = S.findPanel.querySelector('.stadiaref-find__list');
  Array.prototype.forEach.call(list.children, function (row, i) {
    row.setAttribute('aria-selected', i === S.findState.active ? 'true' : 'false');
    if (i === S.findState.active && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
  });
}

function move(step) {
  var f = S.findState;
  if (!f.rows.length) return;
  var i = f.active;
  for (var n = 0; n < f.rows.length; n++) {
    i = (i + step + f.rows.length) % f.rows.length;
    if (!f.rows[i].hidden) break;
  }
  f.active = i;
  markActive();
}

function onInputKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    var r = S.findState.rows[S.findState.active];
    if (r && !r.hidden) jump(r.el);
  } else if (e.key === 'Escape') {
    // Leave Find, and keep Esc from also closing a host dialog underneath.
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    closeFind();
  }
}

// Scroll to the element, frame it and dim the rest of the page.
export function jump(el) {
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (err) { el.scrollIntoView(); }
  highlight('find', el);
  var started = Date.now();
  (function follow() {
    placeHighlights();
    if (Date.now() - started < 700) requestAnimationFrame(follow);
  })();
}

export function isFinding() {
  return !!(S.findState && S.findState.open);
}

// Open Find with `query` and return the matching addresses.
export function openFind(query, focus) {
  if (S.stopPick) S.stopPick();
  if (S.presentationMode && S.showToolbar) S.showToolbar();
  if (!S.findState) S.findState = { open: false, query: '', rows: [], matches: [], active: -1 };
  var panel = ensurePanel();
  if (S.treeOpen && S.toggleTree) S.toggleTree();
  S.findState.open = true;
  panel.classList.add('stadiaref-find--open');
  setPressed(true);
  applyDockPosition();
  var input = panel.querySelector('input');
  if (typeof query === 'string') input.value = query;
  var found = search(input.value);
  if (focus !== false) {
    try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  }
  // A full address pasted or passed in goes straight to it.
  var rows = S.findState.rows;
  if (typeof query === 'string' && rows.length && rows[0].el.getAttribute('data-ref') === query.trim().toLowerCase() && !rows[0].hidden) jump(rows[0].el);
  return found;
}

export function closeFind() {
  if (!isFinding()) return;
  S.findState.open = false;
  S.findPanel.classList.remove('stadiaref-find--open');
  unhighlight('find');
  setPressed(false);
  var input = S.findPanel.querySelector('input');
  if (S.shadowRoot.activeElement === input) input.blur();
}

function setPressed(on) {
  var b = S.toolbar && S.toolbar.querySelector('[data-stadiaref-find]');
  if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
