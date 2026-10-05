import { S } from './state.js';

// ─── Highlights over page elements ──────────────────────────
// A frame drawn in StadiaRef's shadow root over an element's box, so the
// element itself is never restyled. `kind` names the frame ('hover' and
// 'jump' for the Tree); each kind follows its element on scroll and resize.
export function highlight(kind, el) {
  if (!S.shadowRoot || !el) return;
  if (!S.highlights) S.highlights = {};
  var h = S.highlights[kind];
  if (!h) {
    h = { box: document.createElement('div'), el: null };
    h.box.className = 'stadiaref-highlight stadiaref-highlight--' + kind;
    h.box.setAttribute('aria-hidden', 'true');
    S.shadowRoot.appendChild(h.box);
    S.highlights[kind] = h;
  }
  h.el = el;
  h.box.hidden = false;
  placeHighlights();
  trackHighlights();
}

export function unhighlight(kind) {
  var h = S.highlights && S.highlights[kind];
  if (!h) return;
  h.el = null;
  h.box.hidden = true;
}

export function highlightedElement(kind) {
  var h = S.highlights && S.highlights[kind];
  return h ? h.el : null;
}

export function placeHighlights() {
  if (!S.highlights) return;
  for (var kind in S.highlights) {
    var h = S.highlights[kind];
    if (!h.el) continue;
    if (!h.el.isConnected) { unhighlight(kind); continue; }
    var r = h.el.getBoundingClientRect();
    h.box.style.top = r.top + 'px';
    h.box.style.left = r.left + 'px';
    h.box.style.width = r.width + 'px';
    h.box.style.height = r.height + 'px';
  }
}

function trackHighlights() {
  if (S.highlightTracking) return;
  S.highlightTracking = true;
  window.addEventListener('scroll', placeHighlights, true);
  window.addEventListener('resize', placeHighlights);
}
