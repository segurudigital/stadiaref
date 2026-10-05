

// ─── Public events ──────────────────────────────────────────
// Every documented public event is dispatched on `window` with the `sdt:`
// prefix. Consumers listen with `window.addEventListener('sdt:<name>', ...)`.
// Catalogue:
//   sdt:ready         → SDT booted and the API is callable
//   sdt:show          → toolbar revealed (programmatic or hotkey)
//   sdt:hide          → toolbar dismissed
//   sdt:theme-change  → resolved theme changed { theme, mode }
//   sdt:user-change   → setUser() called
//   sdt:dataref-click → user clicked an SDT label/icon for a [data-ref]
//   sdt:dataref-hover → mouse entered an SDT label/icon for a [data-ref]
export function emitEvent(name, detail) {
  if (typeof window === 'undefined' || !window.dispatchEvent) return;
  try {
    var evt;
    if (typeof CustomEvent === 'function') {
      evt = new CustomEvent('sdt:' + name, { detail: detail || {}, bubbles: false, cancelable: false });
    } else if (document.createEvent) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('sdt:' + name, false, false, detail || {});
    } else {
      return;
    }
    window.dispatchEvent(evt);
  } catch (e) { /* swallow */ }
}
