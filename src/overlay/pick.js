import { S } from './state.js';
import { tierOf } from './classify.js';
import { copyAddress } from './copy.js';
import { highlight, unhighlight } from './highlight.js';
import { applyRootState } from './mount.js';

// ─── Pick ───────────────────────────────────────────────────
// Point at something to get its address. Labels step aside; a chip follows
// the pointer with the chain (section / block / element) of the element
// under it. Click copies the highlighted level; up and down arrows move it
// between the element and its addressed ancestors. Clicks while picking
// never reach the page. Esc or P leaves.
//
// On touch there is no pointer to follow: a tap picks the element and a
// sheet rises from the bottom with the chain, the full address and three
// buttons, Copy address, Parent and Close. An interaction is touch when
// its pointerType is touch, or when the pointer is coarse and no fine
// pointer has been seen.

var TIER_WORDS = { section: 'section', block: 'block', element: 'element', unclassified: 'address' };

function addressedChain(el) {
  var chain = [];
  for (var cur = el; cur && cur.nodeType === 1; cur = cur.parentElement) {
    if (cur.hasAttribute('data-ref')) chain.unshift(cur);
  }
  return chain;
}

function insideStadiaRef(node) {
  return !!(S.shadowHost && node && (node === S.shadowHost || S.shadowHost.contains(node)));
}

// The page element under the pointer, ignoring StadiaRef's own nodes.
function pointTarget(e) {
  var path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
  if (path.indexOf(S.shadowHost) !== -1) return null;
  var t = path[0];
  return t && t.nodeType === 1 ? t : (t && t.parentElement) || null;
}

// The address without the hyphen-separated prefix it shares with `prev`.
export function shortPart(address, prev) {
  if (!prev) return address;
  var a = address.split('-');
  var b = prev.split('-');
  var n = 0;
  while (n < a.length - 1 && n < b.length && a[n] === b[n]) n++;
  return n ? a.slice(n).join('-') : address;
}

// Called for every pointer event (boot.js): remembers what kind of pointer
// is in use.
export function notePointer(e) {
  if (!e || !e.pointerType) return;
  S.lastPointerType = e.pointerType;
  if (e.pointerType === 'mouse' || e.pointerType === 'pen') S.finePointerSeen = true;
}

export function isTouch() {
  if (S.lastPointerType === 'touch') return true;
  if (S.lastPointerType === 'mouse' || S.lastPointerType === 'pen') return false;
  var coarse = false;
  try { coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches; } catch (e) { /* ignore */ }
  return coarse && !S.finePointerSeen;
}

function ensureChip() {
  if (S.pickChip) return S.pickChip;
  var chip = document.createElement('div');
  chip.className = 'stadiaref-pick-chip';
  chip.setAttribute('role', 'status');
  chip.setAttribute('aria-live', 'polite');
  chip.hidden = true;
  S.shadowRoot.appendChild(chip);
  S.pickChip = chip;
  return chip;
}

// The chain as parts: section / block / element, shared prefixes dropped.
function chainParts() {
  var p = S.pickState;
  var parts = document.createElement('div');
  parts.className = 'stadiaref-pick-chip__parts';
  var prev = null;
  for (var i = 0; i < p.chain.length; i++) {
    if (i) {
      var sep = document.createElement('span');
      sep.className = 'stadiaref-pick-chip__sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      parts.appendChild(sep);
    }
    var address = p.chain[i].getAttribute('data-ref');
    var part = document.createElement('span');
    part.className = 'stadiaref-pick-chip__part stadiaref-pick-chip__part--' + tierOf(p.chain[i]) + (i === p.level ? ' stadiaref-pick-chip__part--current' : '');
    part.textContent = shortPart(address, prev);
    parts.appendChild(part);
    prev = address;
  }
  return parts;
}

function renderChip() {
  var chip = ensureChip();
  var p = S.pickState;
  if (p.touch) { chip.hidden = true; return; }
  chip.innerHTML = '';
  var parts;
  var hint = document.createElement('div');
  hint.className = 'stadiaref-pick-chip__hint';
  if (!p.chain.length) {
    parts = document.createElement('div');
    parts.className = 'stadiaref-pick-chip__parts';
    parts.textContent = 'No address here';
    hint.textContent = 'Point at something with an address. Esc leaves pick mode.';
  } else {
    parts = chainParts();
    var chosen = p.chain[p.level];
    var moves = [];
    if (p.level > 0) moves.push('up arrow selects the ' + TIER_WORDS[tierOf(p.chain[p.level - 1])]);
    if (p.level < p.chain.length - 1) moves.push('down arrow goes back');
    moves.push('Esc leaves pick mode');
    var rest = moves.join(', ');
    hint.textContent = 'Click copies ' + chosen.getAttribute('data-ref') + '. ' + rest.charAt(0).toUpperCase() + rest.slice(1) + '.';
  }
  chip.appendChild(parts);
  chip.appendChild(hint);
  chip.hidden = false;
  placeChip();
}

// ─── The sheet (touch) ──────────────────────────────────────
function sheetButton(cls, text, onTap) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'stadiaref-pick-sheet__btn' + (cls ? ' stadiaref-pick-sheet__btn--' + cls : '');
  b.textContent = text;
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    onTap(b);
  });
  return b;
}

function ensureSheet() {
  if (S.pickSheet) return S.pickSheet;
  var sheet = document.createElement('div');
  sheet.className = 'stadiaref-pick-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Picked address');
  sheet.hidden = true;
  S.shadowRoot.appendChild(sheet);
  S.pickSheet = sheet;
  return sheet;
}

function renderSheet() {
  var p = S.pickState;
  var sheet = ensureSheet();
  var el = p.chain[p.level];
  if (!el) { sheet.hidden = true; return; }
  sheet.innerHTML = '';
  sheet.appendChild(chainParts());
  var address = document.createElement('div');
  address.className = 'stadiaref-pick-sheet__address';
  address.textContent = el.getAttribute('data-ref');
  sheet.appendChild(address);
  var actions = document.createElement('div');
  actions.className = 'stadiaref-pick-sheet__actions';
  actions.appendChild(sheetButton('copy', 'Copy address', function (b) {
    var chosen = S.pickState.chain[S.pickState.level];
    if (chosen) copyAddress(chosen, chosen.getAttribute('data-ref'), b, 'pick');
  }));
  var parent = sheetButton('', 'Parent', function () {
    if (S.pickState.level > 0) {
      S.pickState.level--;
      renderSheet();
      drawFrames();
    }
  });
  if (p.level <= 0) parent.disabled = true;
  actions.appendChild(parent);
  actions.appendChild(sheetButton('', 'Close', closeSheet));
  sheet.appendChild(actions);
  sheet.hidden = false;
}

function closeSheet() {
  if (S.pickSheet) S.pickSheet.hidden = true;
  for (var i = 0; i < 6; i++) unhighlight('pick-' + i);
  unhighlight('pick-current');
}

function placeChip() {
  var chip = S.pickChip;
  var p = S.pickState;
  if (!chip || chip.hidden) return;
  var w = chip.offsetWidth;
  var h = chip.offsetHeight;
  var x = Math.min(p.x + 14, window.innerWidth - w - 8);
  var y = p.y + 22;
  if (y + h > window.innerHeight - 8) y = p.y - h - 14;
  chip.style.left = Math.max(8, x) + 'px';
  chip.style.top = Math.max(8, y) + 'px';
}

function drawFrames() {
  var p = S.pickState;
  for (var i = 0; i < 6; i++) unhighlight('pick-' + i);
  unhighlight('pick-current');
  for (var j = 0; j < p.chain.length && j < 6; j++) {
    if (j === p.level) highlight('pick-current', p.chain[j]);
    else highlight('pick-' + j, p.chain[j]);
  }
}

function setTarget(el) {
  var p = S.pickState;
  var chain = el ? addressedChain(el) : [];
  var same = chain.length === p.chain.length && chain.every(function (c, i) { return c === p.chain[i]; });
  if (!same) {
    p.chain = chain;
    p.level = chain.length - 1;
  }
  renderChip();
  drawFrames();
}

function onMove(e) {
  var p = S.pickState;
  if (e.pointerType === 'touch') return;
  if (p.touch) { p.touch = false; closeSheet(); }
  p.x = e.clientX;
  p.y = e.clientY;
  var t = pointTarget(e);
  if (!t) return; // over StadiaRef's own toolbar or panels
  setTarget(t);
}

// Clicks while picking choose an address and never reach the page.
function swallow(e) {
  if (insideStadiaRef(e.target) && pointTarget(e) === null) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
}

function onClick(e) {
  if (pointTarget(e) === null) return; // a click on the toolbar works as usual
  swallow(e);
  // Touch and keyboard clicks come without a move first; take the target
  // from the click (the level is kept when the chain is the same).
  S.pickState.touch = isTouch();
  setTarget(pointTarget(e));
  if (S.pickState.touch) { renderSheet(); return; }
  var el = S.pickState.chain[S.pickState.level];
  if (el) copyAddress(el, el.getAttribute('data-ref'), S.pickChip, 'pick');
}

function onKey(e) {
  var p = S.pickState;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'ArrowUp' && p.level > 0) { p.level--; }
  else if (e.key === 'ArrowDown' && p.level < p.chain.length - 1) { p.level++; }
  else return;
  e.preventDefault();
  e.stopPropagation();
  renderChip();
  if (p.touch && S.pickSheet && !S.pickSheet.hidden) renderSheet();
  drawFrames();
}

var LISTENERS = [
  ['pointermove', onMove],
  ['pointerdown', swallow],
  ['mousedown', swallow],
  ['mouseup', swallow],
  ['pointerup', swallow],
  ['auxclick', swallow],
  ['click', onClick]
];

export function isPicking() {
  return !!(S.pickState && S.pickState.active);
}

export function startPick() {
  if (isPicking()) return;
  if (S.closeFind) S.closeFind();
  if (S.presentationMode && S.showToolbar) S.showToolbar();
  S.pickState = { active: true, touch: isTouch(), chain: [], level: -1, x: window.innerWidth / 2, y: window.innerHeight / 2 };
  S.pickMode = true;
  applyRootState();
  for (var i = 0; i < LISTENERS.length; i++) window.addEventListener(LISTENERS[i][0], LISTENERS[i][1], true);
  window.addEventListener('keydown', onKey, true);
  setPressed(true);
  renderChip();
}

export function stopPick() {
  if (!isPicking()) return;
  S.pickState.active = false;
  S.pickMode = false;
  for (var i = 0; i < LISTENERS.length; i++) window.removeEventListener(LISTENERS[i][0], LISTENERS[i][1], true);
  window.removeEventListener('keydown', onKey, true);
  for (var j = 0; j < 6; j++) unhighlight('pick-' + j);
  unhighlight('pick-current');
  if (S.pickChip) S.pickChip.hidden = true;
  if (S.pickSheet) S.pickSheet.hidden = true;
  setPressed(false);
  applyRootState();
}

export function togglePick() {
  if (isPicking()) stopPick(); else startPick();
}

function setPressed(on) {
  var b = S.toolbar && S.toolbar.querySelector('[data-stadiaref-pick]');
  if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
