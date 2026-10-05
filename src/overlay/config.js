import { S } from './state.js';
import { legacyConfigSources, mapLegacyKeys } from '../compat/aliases.js';

// Config keys read at start. 2.x keys are mapped onto these by
// mapLegacyKeys(). autoRefDepth has no 3.0 key: it is the 2.x single-tier
// auto-address state, kept for pages that still set it.
var CONFIG_KEYS = ['profile', 'labels', 'tiers', 'autoAddress', 'outline', 'startHidden', 'theme', 'dock',
  'keys', 'user', 'classConverter', 'pageSlug', 'autoRefDepth', 'watch', 'dockOffset'];

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
  // keys merges action by action: a higher source's binding for one action
  // doesn't discard a lower source's binding for another.
  var keys = {};
  for (var s = sources.length - 1; s >= 0; s--) {
    var k = sources[s].keys;
    if (k && typeof k === 'object') {
      for (var action in k) {
        if (Object.prototype.hasOwnProperty.call(k, action)) keys[action] = k[action];
      }
    }
  }
  if (Object.keys(keys).length) config.keys = keys;
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
