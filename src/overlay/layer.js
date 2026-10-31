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
  placeSlot(el, slot, el.getBoundingClientRect(), S.layer.getBoundingClientRect());
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

function placeSlot(el, slot, r, origin) {
  // The layer is fixed at the viewport's origin unless a transformed
  // ancestor of the host (a modal centred with a transform) moves it.
  var x = Math.round((r.left - origin.left) * 100) / 100;
  var y = Math.round((r.top - origin.top) * 100) / 100;
  slot.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  slot.style.width = r.width + 'px';
  slot.style.height = r.height + 'px';
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
  var rects = els.map(function (el) { return el.getBoundingClientRect(); });
  for (var i = 0; i < els.length; i++) placeSlot(els[i], rec(els[i]).slot, rects[i], origin);
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
