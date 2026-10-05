import { S } from './state.js';
import { legacyConfigSources, mapLegacyKeys } from '../compat/aliases.js';

// Config keys read at start. 2.x keys are mapped onto these by
// mapLegacyKeys(); hotkey, levelFilter, autoRef and autoRefDepth keep their
// 2.x names until the controls behind them are replaced.
var CONFIG_KEYS = ['profile', 'labels', 'outline', 'startHidden', 'theme', 'dock', 'user', 'classConverter',
  'pageSlug', 'hotkey', 'levelFilter', 'autoRef', 'autoRefDepth'];

// Merge config from every source. For each key the first source that sets
// it wins: window.stadiarefConfig, then the 2.x objects (per-page before
// WordPress), then attributes on the script tag.
export function readConfig() {
  var sources = [];
  if (typeof window.stadiarefConfig !== 'undefined' && window.stadiarefConfig) sources.push(window.stadiarefConfig);
  sources = sources.concat(legacyConfigSources());
  sources = sources.map(mapLegacyKeys);
  sources.push(mapLegacyKeys(scriptAttrConfig()));
  var config = {};
  for (var i = 0; i < CONFIG_KEYS.length; i++) {
    var key = CONFIG_KEYS[i];
    for (var j = 0; j < sources.length; j++) {
      if (key in sources[j] && typeof sources[j][key] !== 'undefined') {
        config[key] = sources[j][key];
        break;
      }
    }
  }
  return config;
}

// Attributes on the <script> tag that loaded StadiaRef.
function scriptAttrConfig() {
  var out = {};
  var attrs = { profile: 'data-profile', labels: 'data-labels', hotkey: 'data-hotkey', theme: 'data-theme', dock: 'data-dock', position: 'data-position' };
  for (var key in attrs) {
    var v = readScriptAttr(attrs[key]);
    if (typeof v !== 'undefined') out[key] = v;
  }
  return out;
}

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
      console.warn('[stadiaref] hotkey must be a single letter A–Z, got', value, '— falling back to D');
    }
    return 'D';
  }
  return 'D';
}

// ─── Theme config ──────────────────────────────────────────
// 'auto' (default) follows prefers-color-scheme + the host's `html.dark` class.
// 'light' / 'dark' pin explicitly. Persisted under THEME_STORAGE_KEY.
export const THEME_STORAGE_KEY = 'stadiaref:theme';
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
