import { S } from './state.js';
import { tierOf } from './classify.js';
import { isOwnHost } from './dom.js';
import { isLive } from './mount.js';
import { isTouch } from './pick.js';
import { tierTag } from './tree.js';

// ─── Hover hint ─────────────────────────────────────────────
// With labels off, resting the pointer on something for a moment shows its
// address and tier beside the pointer: the nearest addressed element under
// it. Never on touch, never in Pick or Find or with a card open. Turn it
// off with hint: false.

export var HINT_DELAY = 400;

function addressedAt(node) {
  for (var cur = node; cur && cur.nodeType === 1; cur = cur.parentElement) {
    if (cur.hasAttribute('data-ref')) return cur;
  }
  return null;
}

function wanted(e) {
  return S.hintEnabled && isLive() && S.state === 1 && !S.pickMode && !(S.findState && S.findState.open) &&
    !(S.card && S.card.target) && e.pointerType !== 'touch' && !isTouch();
}

function ensureHint() {
  if (S.hint) return S.hint;
  var box = document.createElement('div');
  box.className = 'stadiaref-hint';
  box.setAttribute('role', 'tooltip');
  box.hidden = true;
  S.shadowRoot.appendChild(box);
  S.hint = box;
  return box;
}

export function hideHint() {
  clearTimeout(S.hintTimer);
  S.hintTimer = null;
  S.hintTarget = null;
  if (S.hint) S.hint.hidden = true;
}

function place(x, y) {
  var box = S.hint;
  if (!box || box.hidden) return;
  var w = box.offsetWidth;
  var h = box.offsetHeight;
  var left = Math.min(x + 14, window.innerWidth - w - 8);
  var top = y + 18;
  if (top + h > window.innerHeight - 8) top = y - h - 10;
  box.style.left = Math.max(8, left) + 'px';
  box.style.top = Math.max(8, top) + 'px';
}

function show(target) {
  var box = ensureHint();
  box.innerHTML = '';
  box.appendChild(tierTag(target));
  var addr = document.createElement('span');
  addr.className = 'stadiaref-hint__address';
  addr.textContent = target.getAttribute('data-ref');
  box.appendChild(addr);
  var tier = document.createElement('span');
  tier.className = 'stadiaref-hint__tier';
  tier.textContent = tierOf(target);
  box.appendChild(tier);
  box.hidden = false;
  place(S.hintX, S.hintY);
}

function onMove(e) {
  if (!wanted(e)) { if (S.hintTarget || (S.hint && !S.hint.hidden)) hideHint(); return; }
  var path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
  var node = path[0];
  if (isOwnHost(node) || (S.shadowHost && path.indexOf(S.shadowHost) !== -1)) { hideHint(); return; }
  var target = addressedAt(node && node.nodeType === 1 ? node : node && node.parentElement);
  S.hintX = e.clientX;
  S.hintY = e.clientY;
  if (target === S.hintTarget) { place(e.clientX, e.clientY); return; }
  hideHint();
  if (!target) return;
  S.hintTarget = target;
  S.hintTimer = setTimeout(function () {
    if (S.hintTarget === target && target.isConnected && S.state === 1 && isLive()) show(target);
  }, HINT_DELAY);
}

// Reading pointer events writes nothing while hidden.
export function attachHint() {
  window.addEventListener('pointermove', onMove, { capture: true, passive: true });
  window.addEventListener('pointerdown', hideHint, true);
  window.addEventListener('scroll', function () { if (S.hintTarget) hideHint(); }, true);
  window.addEventListener('keydown', function () { if (S.hintTarget) hideHint(); }, true);
  document.addEventListener('pointerleave', hideHint);
}
