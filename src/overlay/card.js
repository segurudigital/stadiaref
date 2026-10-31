import { S } from './state.js';
import { tierOf } from './classify.js';
import { copyAddress, copyRef } from './copy.js';
import { emitAddressEvent, emitEvent } from './events.js';
import { highlight, unhighlight } from './highlight.js';
import { tierTag } from './tree.js';

// ─── The address card ───────────────────────────────────────
// A click on a label (or, in Pick, on anything) opens a card beside it: the
// address, its tier, the element's text, the addresses above and inside it,
// rows from the host (setLookup), and Copy, Copy for a brief, Parent and
// Show in Tree. It grew out of Pick's touch sheet. It sits below its anchor,
// above it when there is no room below, and inside the viewport. Esc, a
// click elsewhere or a scroll closes it. With `click: 'copy'` a label click
// copies, as in 3.2, and the card only opens from the API.

export var TEXT_LIMIT = 140;
export var CHILD_LIMIT = 14;
var GAP = 6;
var MARGIN = 8;

var TIER_WORDS = { section: 'section', block: 'block', element: 'element', unclassified: 'unclassified' };

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

// The element's own text, without StadiaRef's label nodes, on one line.
export function elementText(target) {
  var out = '';
  (function walk(node) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) out += c.nodeValue + ' ';
      else if (c.nodeType === 1) {
        var cls = c.getAttribute('class') || '';
        if (cls.indexOf('stadiaref-') !== -1 || c.tagName === 'SCRIPT' || c.tagName === 'STYLE') continue;
        walk(c);
      }
    }
  })(target);
  out = out.replace(/\s+/g, ' ').trim();
  if (!out) out = (target.getAttribute('aria-label') || target.getAttribute('alt') || target.getAttribute('title') || '').trim();
  return out.length > TEXT_LIMIT ? out.slice(0, TEXT_LIMIT - 1).trimEnd() + '…' : out;
}

// The addressed elements above `target`, outermost first.
export function chainAbove(target) {
  var chain = [];
  for (var cur = target.parentElement; cur; cur = cur.parentElement) {
    if (cur.hasAttribute('data-ref')) chain.unshift(cur);
  }
  return chain;
}

// The addressed elements directly inside `target`: those whose nearest
// addressed ancestor is `target`.
export function childrenOf(target) {
  var out = [];
  var all = target.querySelectorAll('[data-ref]');
  for (var i = 0; i < all.length; i++) {
    var p = all[i].parentElement;
    while (p && p !== target && !p.hasAttribute('data-ref')) p = p.parentElement;
    if (p === target) out.push(all[i]);
  }
  return out;
}

// One line for a brief: page, viewport width, address, tier, text.
export function briefFor(target) {
  var title = (document.title || '').trim();
  var parts = [title || location.href, window.innerWidth + 'px', target.getAttribute('data-ref'), tierOf(target)];
  var text = elementText(target);
  if (text) parts.push('"' + text.replace(/"/g, "'") + '"');
  return parts.join(' | ');
}

// What a host's onAddress() action receives along with the address.
export function contextFor(target) {
  return {
    tier: tierOf(target),
    element: target,
    text: elementText(target),
    chain: chainAbove(target).map(function (a) { return a.getAttribute('data-ref'); }),
    tag: target.tagName.toLowerCase(),
    url: location.href,
    title: document.title || '',
    viewport: { width: window.innerWidth, height: window.innerHeight },
    brief: briefFor(target)
  };
}

// A click on a label: open its card, or with `click: 'copy'` copy it.
export function labelClick(target, address, node) {
  if (S.clickMode === 'copy') return copyAddress(target, address, node, 'label');
  openCard(target, node);
}

export function isCardOpen() {
  return !!(S.card && S.card.target);
}

export function cardElement() {
  return S.card && S.card.target;
}

function ensureCard() {
  if (S.card) return S.card;
  var box = el('div', 'stadiaref-card');
  box.setAttribute('role', 'dialog');
  box.tabIndex = -1;
  box.hidden = true;
  box.addEventListener('keydown', onCardKey);
  S.shadowRoot.appendChild(box);
  S.card = { box: box, target: null, anchor: null, returnFocus: null, seq: 0 };
  return S.card;
}

function action(text, cls, onClick) {
  var b = el('button', 'stadiaref-card__btn' + (cls ? ' stadiaref-card__btn--' + cls : ''), text);
  b.type = 'button';
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    onClick(b);
  });
  return b;
}

function addressButton(target, cls) {
  var b = el('button', 'stadiaref-card__ref' + (cls ? ' ' + cls : ''));
  b.type = 'button';
  b.appendChild(tierTag(target));
  b.appendChild(el('span', 'stadiaref-card__ref-text', target.getAttribute('data-ref')));
  b.title = 'Open ' + target.getAttribute('data-ref');
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    openCard(target, null, { focus: true });
  });
  return b;
}

function section(title) {
  var s = el('div', 'stadiaref-card__section');
  s.appendChild(el('div', 'stadiaref-card__key', title));
  return s;
}

// A link from a lookup row: http, https and mailto only.
function safeHref(href) {
  if (typeof href !== 'string' || !href) return null;
  try {
    var u = new URL(href, location.href);
    return /^(https?|mailto):$/.test(u.protocol) ? u.href : null;
  } catch (e) { return null; }
}

var TONES = { ok: 1, warn: 1, error: 1, muted: 1 };

function renderRows(holder, rows) {
  holder.innerHTML = '';
  if (!Array.isArray(rows)) rows = [];
  rows.forEach(function (row) {
    if (!row || typeof row !== 'object') return;
    var r = el('div', 'stadiaref-card__row' + (TONES[row.tone] ? ' stadiaref-card__row--' + row.tone : ''));
    r.appendChild(el('span', 'stadiaref-card__row-label', row.label == null ? '' : String(row.label)));
    var href = safeHref(row.href);
    var value = el(href ? 'a' : 'span', 'stadiaref-card__row-value', row.value == null ? '' : String(row.value));
    if (href) {
      value.href = href;
      value.target = '_blank';
      value.rel = 'noopener noreferrer';
    }
    r.appendChild(value);
    holder.appendChild(r);
  });
  holder.hidden = !holder.firstChild;
  if (S.card && S.card.target) placeCard();
}

function lookupRows(holder, target, address, seq) {
  holder.hidden = true;
  if (typeof S.lookup !== 'function') return;
  var result;
  try { result = S.lookup(address, target); } catch (e) { warn('setLookup function threw', e); return; }
  if (result && typeof result.then === 'function') {
    renderRows(holder, [{ label: 'Looking up', value: '…', tone: 'muted' }]);
    result.then(function (rows) {
      if (S.card && S.card.seq === seq) renderRows(holder, rows);
    }, function (e) {
      warn('setLookup promise rejected', e);
      if (S.card && S.card.seq === seq) renderRows(holder, []);
    });
  } else {
    renderRows(holder, result);
  }
}

function warn(msg, e) {
  if (typeof console !== 'undefined' && console.warn) console.warn('[stadiaref] ' + msg, e);
}

function render(target) {
  var c = S.card;
  var box = c.box;
  var address = target.getAttribute('data-ref');
  var tier = tierOf(target);
  box.innerHTML = '';
  box.setAttribute('aria-label', 'Address ' + address);

  var head = el('div', 'stadiaref-card__head');
  head.appendChild(tierTag(target));
  head.appendChild(el('span', 'stadiaref-card__tier', TIER_WORDS[tier] + (target.hasAttribute('data-stadiaref-auto') ? ', automatic' : '')));
  var close = action('', 'close', function () { closeCard(); });
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>';
  head.appendChild(close);
  box.appendChild(head);

  box.appendChild(el('div', 'stadiaref-card__address', address));

  var text = elementText(target);
  if (text) box.appendChild(el('div', 'stadiaref-card__text', text));

  var rows = el('div', 'stadiaref-card__rows');
  box.appendChild(rows);
  lookupRows(rows, target, address, c.seq);

  var above = chainAbove(target);
  if (above.length) {
    var up = section('Inside');
    var upList = el('div', 'stadiaref-card__refs');
    above.forEach(function (a) { upList.appendChild(addressButton(a)); });
    up.appendChild(upList);
    box.appendChild(up);
  }

  var kids = childrenOf(target);
  if (kids.length) {
    var down = section('Contains ' + kids.length);
    var downList = el('div', 'stadiaref-card__refs');
    kids.slice(0, CHILD_LIMIT).forEach(function (k) { downList.appendChild(addressButton(k)); });
    if (kids.length > CHILD_LIMIT) downList.appendChild(el('span', 'stadiaref-card__more', '+' + (kids.length - CHILD_LIMIT) + ' more'));
    down.appendChild(downList);
    box.appendChild(down);
  }

  var actions = el('div', 'stadiaref-card__actions');
  actions.appendChild(action('Copy', 'copy', function (b) { copyAddress(target, address, b, 'card'); }));
  actions.appendChild(action('Copy for a brief', '', function (b) {
    copyRef(briefFor(target)).then(function (copied) {
      emitAddressEvent('click', target, address, b, { source: 'brief', copied: copied });
    });
  }));
  var parent = action('Parent', '', function () {
    if (above.length) openCard(above[above.length - 1], null, { focus: true });
  });
  if (!above.length) parent.disabled = true;
  actions.appendChild(parent);
  actions.appendChild(action('Show in Tree', '', function () {
    if (S.showInTree) S.showInTree(target);
  }));
  if (S.drillEnabled && S.drillInto) {
    actions.appendChild(action('Drill in', '', function () { S.drillInto(target); }));
  }
  if (S.onAddress && typeof S.onAddress.fn === 'function') {
    actions.appendChild(action(S.onAddress.label, 'host', function () {
      try { S.onAddress.fn(address, contextFor(target)); } catch (e) { warn('onAddress function threw', e); }
    }));
  }
  box.appendChild(actions);
}

// Below the anchor, left-aligned with it; above it when there is no room
// below; always inside the viewport.
export function placeCard() {
  var c = S.card;
  if (!c || !c.target || c.box.hidden) return;
  var anchor = c.anchor && c.anchor.isConnected && c.anchor.getClientRects().length ? c.anchor : c.target;
  var r = anchor.getBoundingClientRect();
  var w = c.box.offsetWidth;
  var h = c.box.offsetHeight;
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var top = r.bottom + GAP;
  var above = false;
  if (top + h > vh - MARGIN && r.top - GAP - h >= MARGIN) {
    top = r.top - GAP - h;
    above = true;
  }
  top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));
  var left = Math.max(MARGIN, Math.min(r.left, vw - w - MARGIN));
  c.box.style.top = Math.round(top) + 'px';
  c.box.style.left = Math.round(left) + 'px';
  c.box.setAttribute('data-placement', above ? 'above' : 'below');
}

// Open the card for an addressed element. `anchor` is the label (or other
// node) it opens beside; without one it opens beside the element.
export function openCard(target, anchor, opts) {
  if (!target || !target.getAttribute || !target.getAttribute('data-ref') || !S.shadowRoot) return false;
  var c = ensureCard();
  var was = c.target;
  if (was && was !== target) emitCard(false, was);
  if (!was) {
    var active = document.activeElement;
    c.returnFocus = active && active !== document.body ? active : null;
  }
  c.seq++;
  c.target = target;
  c.anchor = anchor || null;
  if (S.dismissChain) S.dismissChain();
  render(target);
  c.box.hidden = false;
  placeCard();
  highlight('card', target);
  if (opts && opts.focus) {
    var first = c.box.querySelector('.stadiaref-card__btn--copy');
    (first || c.box).focus({ preventScroll: true });
  } else {
    c.box.focus({ preventScroll: true });
  }
  if (was !== target) emitCard(true, target);
  return true;
}

// Open the card once `target` has stopped moving (after a smooth scroll),
// or after a second at most.
export function openCardWhenSettled(target) {
  var last = null;
  var still = 0;
  var started = Date.now();
  (function wait() {
    if (!target.isConnected) return;
    var top = target.getBoundingClientRect().top;
    still = last !== null && Math.abs(top - last) < 0.5 ? still + 1 : 0;
    last = top;
    if (still >= 3 || Date.now() - started > 1000) openCard(target, null);
    else requestAnimationFrame(wait);
  })();
}

export function closeCard() {
  var c = S.card;
  if (!c || !c.target) return false;
  var target = c.target;
  c.target = null;
  c.anchor = null;
  c.seq++;
  c.box.hidden = true;
  unhighlight('card');
  var back = c.returnFocus;
  c.returnFocus = null;
  if (back && back.isConnected && back.focus) { try { back.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  emitCard(false, target);
  return true;
}

function emitCard(open, target) {
  emitEvent('card', { open: open, address: target.getAttribute('data-ref'), tier: tierOf(target), element: target });
}

// Tab and Shift+Tab stay inside the card.
function onCardKey(e) {
  if (e.key !== 'Tab') return;
  var items = Array.prototype.filter.call(S.card.box.querySelectorAll('button, a[href]'), function (b) { return !b.disabled; });
  if (!items.length) return;
  var active = S.shadowRoot.activeElement;
  var i = items.indexOf(active);
  var next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === -1 || i === items.length - 1 ? 0 : i + 1);
  e.preventDefault();
  items[next].focus({ preventScroll: true });
}

function insideCard(e) {
  var path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
  return path.indexOf(S.card.box) !== -1;
}

// A press outside the card closes it; so does a scroll of the page or a
// resize. Attached once from init(), before Pick's listeners.
export function attachCardDismiss() {
  window.addEventListener('pointerdown', function (e) {
    if (isCardOpen() && !insideCard(e)) closeCard();
  }, true);
  window.addEventListener('scroll', function (e) {
    if (!isCardOpen() || (S.card.box.contains && e.target && S.card.box.contains(e.target))) return;
    closeCard();
  }, true);
  window.addEventListener('resize', function () { if (isCardOpen()) closeCard(); });
}
