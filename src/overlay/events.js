import { S } from './state.js';
import { tierOf } from './classify.js';

// ─── Public events ──────────────────────────────────────────
// Every public event is dispatched on `window` with the `stadiaref:` prefix:
//   stadiaref:ready          → started and the API is callable { version }
//   stadiaref:show / hide    → toolbar revealed or dismissed {}
//   stadiaref:labels-change  → label mode changed { labels }
//   stadiaref:outline-change → outline mode changed { outline }
//   stadiaref:theme-change   → resolved theme changed { theme, mode }
//   stadiaref:user-change    → setUser() called { user }
//   stadiaref:address-click / -hover / -leave → { address, tier, element, … }
// compat/aliases.js fires the 2.x twin of each through S.legacyEmit.
export function dispatchWindowEvent(type, detail) {
  if (typeof window === 'undefined' || !window.dispatchEvent) return;
  try {
    var evt;
    if (typeof CustomEvent === 'function') {
      evt = new CustomEvent(type, { detail: detail || {}, bubbles: false, cancelable: false });
    } else if (document.createEvent) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(type, false, false, detail || {});
    } else {
      return;
    }
    window.dispatchEvent(evt);
  } catch (e) { /* swallow */ }
}

// Fire `stadiaref:<name>`, then its 2.x twin if it has one. `legacyDetail`
// replaces the detail for the twin where 2.x carried a different shape.
export function emitEvent(name, detail, legacyDetail) {
  dispatchWindowEvent('stadiaref:' + name, detail || {});
  if (S.legacyEmit) S.legacyEmit(name, legacyDetail || detail || {});
}

// Events that exist only under their 2.x name until the control behind them
// is replaced (Target and Level, in stage 4 of the 3.0 build).
export function emitLegacyEvent(name, detail) {
  if (S.legacyEmit) S.legacyEmit(name, detail || {});
}

// stadiaref:address-<kind> with { address, tier, element } plus `extra`.
// The 2.x twin carries { dataRef, element, current }, where `current` is the
// label node that was clicked or hovered.
export function emitAddressEvent(kind, el, address, current, extra) {
  var detail = { address: address, tier: tierOf(el), element: el };
  if (extra) {
    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) detail[k] = extra[k];
    }
  }
  emitEvent('address-' + kind, detail, { dataRef: address, element: el, current: current });
}
