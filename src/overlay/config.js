import { S } from './state.js';

export function readScriptAttr(name) {
  if (!S.hostScriptEl) return undefined;
  var v = S.hostScriptEl.getAttribute(name);
  return v === null ? undefined : v;
}

// ─── Hotkey config ─────────────────────────────────────────
// Single letter (case-insensitive) toggles visibility. `false` disables binding.
// Default 'D' (for "Debug"). Esc is bound unconditionally as a global hide —
// it closes any open dropdown, the Tree panel, and the toolbar in one press.
// T (cycle Target) and O (cycle Outline) are fixed and not configurable.
export function normalizeHotkey(value) {
  if (value === false || value === 'false' || value === null) return false;
  if (typeof value === 'undefined' || value === '') return 'D';
  if (typeof value === 'string') {
    var trimmed = value.trim();
    if (!trimmed) return 'D';
    var ch = trimmed.charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(ch)) return ch;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[seguru-debug-toolbar] hotkey must be a single letter A–Z, got', value, '— falling back to D');
    }
    return 'D';
  }
  return 'D';
}

// ─── Theme config ──────────────────────────────────────────
// 'auto' (default) follows prefers-color-scheme + the host's `html.dark` class.
// 'light' / 'dark' pin explicitly. Persisted under THEME_STORAGE_KEY.
export const THEME_STORAGE_KEY = 'seguru-debug-toolbar:theme';
export function readPersistedTheme() {
  try {
    var stored = window.localStorage && window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  } catch (e) { /* localStorage may be blocked */ }
  return null;
}
export function persistTheme(value) {
  try {
    if (window.localStorage) window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch (e) { /* swallow */ }
}
