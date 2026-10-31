import { S } from './state.js';
import { hasRecord, rec } from './records.js';

// ─── The overlay layer ──────────────────────────────────────
// Labels, badges and outline frames are drawn in one layer of StadiaRef's
// own, inside its shadow root, never inside the page's elements. The layer
// is fixed over the viewport and takes no pointer events itself. Each page
// element that has something drawn for it gets a slot: a box placed over
// the element's border box. What is drawn for the element goes in its slot
// with the offsets it had inside the element before 3.4, so placement,
// overlaps, clusters and block groups work as they did.
//
// Slots follow their elements: one placement pass per frame at most, after
// a scroll (of the page or any scroll container), a resize, an element
// changing size, or a survey. All rects are read first, then all slots are
// moved, with transforms.

export function ensureLayer() {
  if (S.layer) return S.layer;
  var layer = document.createElement('div');
  layer.className = 'stadiaref-layer';
  // Under the toolbar, panels and card, which come later in the shadow root.
  var first = S.shadowRoot.firstChild;
  S.shadowRoot.insertBefore(layer, first ? first.nextSibling : null);
  S.layer = layer;
  S.slotted = new Set();
  if (typeof window.ResizeObserver === 'function') {
    S.slotObserver = new window.ResizeObserver(schedulePlace);
  }
  window.addEventListener('scroll', schedulePlace, { capture: true, passive: true });
  window.addEventListener('resize', schedulePlace);
  return layer;
}

// The slot for a page element, made on first use.
export function slotFor(el) {
  ensureLayer();
  var r = rec(el);
  if (r.slot && r.slot.parentNode === S.layer) return r.slot;
  var slot = document.createElement('div');
  slot.className = 'stadiaref-slot';
  var address = el.getAttribute('data-ref');
  if (address) slot.setAttribute('data-stadiaref-for', address);
  S.layer.appendChild(slot);
  r.slot = slot;
  S.slotted.add(el);
  if (S.slotObserver) S.slotObserver.observe(el);
  // Placed by the next pass (a survey runs one before measuring labels):
  // reading the element's box here, between writes, would force a layout
  // per element.
  schedulePlace();
  return slot;
}

export function hasSlot(el) {
  return hasRecord(el) && !!rec(el).slot;
}

// Remove an element's slot once nothing is drawn in it (or `force`).
export function dropSlot(el, force) {
  if (!hasRecord(el)) return;
  var r = rec(el);
  var slot = r.slot;
  if (!slot) return;
  if (!force && slot.firstChild) return;
  if (slot.parentNode) slot.parentNode.removeChild(slot);
  r.slot = null;
  if (S.slotted) S.slotted.delete(el);
  if (S.slotObserver) S.slotObserver.unobserve(el);
}

// Keep a slot's address in step with its element (a reused node).
export function syncSlotAddress(el) {
  var slot = hasRecord(el) && rec(el).slot;
  if (!slot) return;
  var address = el.getAttribute('data-ref');
  if (address && slot.getAttribute('data-stadiaref-for') !== address) slot.setAttribute('data-stadiaref-for', address);
}

// ─── Clipping ───────────────────────────────────────────────
// A label inside the page used to be clipped by any scroll container or
// overflow: hidden ancestor of its element. A slot is clipped the same way:
// to the intersection of those ancestors' client boxes, with clip-path, so
// what is scrolled out of a container doesn't show its label (or take a
// click). Which ancestors clip is worked out once per survey (clipVersion).
var CLIPS = { hidden: 1, scroll: 1, auto: 1, clip: 1 };

function clippers(el) {
  var r = rec(el);
  if (r.clipVersion === S.clipVersion) return r.clippers;
  var out = [];
  var root = document.documentElement;
  for (var cur = el; cur && cur !== root && cur !== document.body; cur = cur.parentElement) {
    var cs = window.getComputedStyle(cur);
    if (cur !== el && (CLIPS[cs.overflowX] || CLIPS[cs.overflowY])) out.push(cur);
    // A fixed element is placed on the viewport: nothing above it clips it.
    if (cs.position === 'fixed') break;
  }
  r.clippers = out;
  r.clipVersion = S.clipVersion;
  return out;
}

// Forget which ancestors clip, after the page has changed (mount.js survey).
export function invalidateClips() {
  S.clipVersion = (S.clipVersion || 0) + 1;
}

function clientBox(el, memo) {
  var box = memo.get(el);
  if (box) return box;
  var r = el.getBoundingClientRect();
  var left = r.left + el.clientLeft;
  var top = r.top + el.clientTop;
  box = { left: left, top: top, right: left + el.clientWidth, bottom: top + el.clientHeight };
  memo.set(el, box);
  return box;
}

function clipFor(el, memo) {
  var list = clippers(el);
  if (!list.length) return null;
  var c = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity };
  for (var i = 0; i < list.length; i++) {
    var b = clientBox(list[i], memo);
    c.left = Math.max(c.left, b.left);
    c.top = Math.max(c.top, b.top);
    c.right = Math.min(c.right, b.right);
    c.bottom = Math.min(c.bottom, b.bottom);
  }
  return c;
}

function px(n) {
  return (Math.round(n * 100) / 100) + 'px';
}

function placeSlot(el, slot, r, origin, clip) {
  // The layer is fixed at the viewport's origin unless a transformed
  // ancestor of the host (a modal centred with a transform) moves it.
  var x = Math.round((r.left - origin.left) * 100) / 100;
  var y = Math.round((r.top - origin.top) * 100) / 100;
  slot.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  slot.style.width = r.width + 'px';
  slot.style.height = r.height + 'px';
  var path = '';
  if (clip) {
    // inset() from the slot's own box; a side that reaches past the slot
    // is negative, so labels wider than their element still show.
    path = 'inset(' + px(clip.top - r.top) + ' ' + px(r.right - clip.right) + ' ' + px(r.bottom - clip.bottom) + ' ' + px(clip.left - r.left) + ')';
    var gone = clip.right <= clip.left || clip.bottom <= clip.top || clip.right <= r.left || clip.left >= r.right || clip.bottom <= r.top || clip.top >= r.bottom;
    if (gone !== slot.hasAttribute('data-clipped')) slot.toggleAttribute('data-clipped', gone);
  } else if (slot.hasAttribute('data-clipped')) {
    slot.removeAttribute('data-clipped');
  }
  if (slot.style.clipPath !== path) slot.style.clipPath = path;
}

// One pass: forget elements that have left the page, then read every rect
// and move every slot.
export function placeSlots() {
  if (!S.layer || !S.slotted) return;
  var els = [];
  S.slotted.forEach(function (el) {
    if (!el.isConnected) {
      var r = rec(el);
      var slot = r.slot;
      if (slot && slot.parentNode) slot.parentNode.removeChild(slot);
      r.slot = null;
      S.slotted.delete(el);
      if (S.slotObserver) S.slotObserver.unobserve(el);
      return;
    }
    els.push(el);
  });
  var origin = S.layer.getBoundingClientRect();
  var memo = new Map();
  var rects = els.map(function (el) { return el.getBoundingClientRect(); });
  var clips = els.map(function (el) { return clipFor(el, memo); });
  for (var i = 0; i < els.length; i++) placeSlot(els[i], rec(els[i]).slot, rects[i], origin, clips[i]);
  scheduleCoverCheck();
}

export function schedulePlace() {
  if (S.placeScheduled || !S.layer) return;
  S.placeScheduled = true;
  (window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); })(function () {
    S.placeScheduled = false;
    placeSlots();
    if (S.highlights && S.placeHighlights) S.placeHighlights();
  });
}

// True when nothing of the element's slot is shown (scrolled out of its
// container); the overlap solver leaves such labels out.
export function slotHidden(el) {
  var slot = hasRecord(el) && rec(el).slot;
  return !!(slot && slot.hasAttribute('data-clipped'));
}

// ─── Covered elements ───────────────────────────────────────
// Labels are drawn over everything, so a label whose element is under the
// page's own fixed or sticky UI (a header, a tab bar, a cookie banner)
// would float over that UI. Once scrolling settles, each label on the
// screen checks the point under its corner: if what is there sits inside
// a fixed or sticky box that isn't part of the element, the label hides
// until the element comes out. Other overlaps (a stretched link over a
// card) leave the label alone.
var COVER_DELAY = 150;

export function scheduleCoverCheck() {
  if (!S.layer) return;
  clearTimeout(S.coverTimer);
  S.coverTimer = setTimeout(checkCovered, COVER_DELAY);
}

function inFixedBox(node, el) {
  for (var cur = node; cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement; cur = cur.parentElement) {
    if (cur.contains(el)) return false;
    var pos = window.getComputedStyle(cur).position;
    if (pos === 'fixed' || pos === 'sticky') return true;
  }
  return false;
}

function isOwnHit(node) {
  return node === S.shadowHost || node === S.mountHost;
}

export function checkCovered() {
  S.coverTimer = null;
  if (!S.layer || !S.slotted || typeof document.elementsFromPoint !== 'function') return;
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  S.slotted.forEach(function (el) {
    var slot = rec(el).slot;
    if (!slot || !el.isConnected) return;
    var covered = false;
    if (!slot.hasAttribute('data-clipped')) {
      var r = el.getBoundingClientRect();
      var x = Math.min(r.left + 4, r.right - 1);
      var y = Math.min(r.top + 4, r.bottom - 1);
      if (x >= 0 && y >= 0 && x < vw && y < vh && r.width > 0 && r.height > 0) {
        var stack = document.elementsFromPoint(x, y);
        var top = null;
        for (var i = 0; i < stack.length; i++) if (!isOwnHit(stack[i])) { top = stack[i]; break; }
        covered = !!top && top !== el && !el.contains(top) && inFixedBox(top, el);
      }
    }
    if (covered !== slot.hasAttribute('data-covered')) slot.toggleAttribute('data-covered', covered);
  });
}

// Every node of a kind drawn in the layer.
export function layerAll(selector) {
  return S.layer ? S.layer.querySelectorAll(selector) : [];
}

// Global state for the layer's CSS, mirrored from <html> (mount.js).
export function setLayerAttr(name, value) {
  if (!S.layer) return;
  if (value === null) {
    if (S.layer.hasAttribute(name)) S.layer.removeAttribute(name);
  } else if (S.layer.getAttribute(name) !== value) {
    S.layer.setAttribute(name, value);
  }
}
