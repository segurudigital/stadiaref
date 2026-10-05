// 2.x names (Seguru Debug Toolbar). Every one keeps its 2.x behaviour
// through 3.x and goes in 4.0. This is the only module that knows them.
//
// What lives here:
//   - the old config globals, window.seguruDebugConfig and window.sdtConfig
//   - the old config keys, mapped to the 3.0 keys on read
//   - the old global, window.seguruDebugToolbar, with a one-time notice
//   - the old methods: setState/getState, setDepth/getDepth,
//     setLevelFilter/getLevelFilter, classifyDataRef, setHotkey/getHotkey
//   - the sdt:* events, fired beside their stadiaref:* twins
//   - the old localStorage theme key, moved over once
import { S } from '../overlay/state.js';
import { THEME_STORAGE_KEY } from '../overlay/config.js';
import { classifyTitan } from '../core/profiles/titan.js';
import { dispatchWindowEvent } from '../overlay/events.js';
import { setHotkey } from '../overlay/keys.js';
import { setState } from '../overlay/mode.js';
import { setDepth, setLevelFilter } from '../overlay/tiers.js';

var OLD_GLOBAL = 'seguruDebugToolbar';
var OLD_EVENT_PREFIX = 'sdt:';
var OLD_THEME_KEY = 'seguru-debug-toolbar:theme';

// 2.x label mode numbers.
var LABELS_BY_STATE = { 0: 'icons', 1: 'off', 2: 'full' };

// 3.0 event name → 2.x event name. Events missing here have no 2.x twin.
var OLD_EVENTS = {
  'ready': 'ready',
  'show': 'show',
  'hide': 'hide',
  'theme-change': 'theme-change',
  'outline-change': 'outline-change',
  'user-change': 'user-change',
  'address-click': 'dataref-click',
  'address-hover': 'dataref-hover',
  'address-leave': 'dataref-leave',
  'depth-change': 'depth-change',
  'level-filter-change': 'level-filter-change'
};

// Config objects a 2.x page or the 2.x WordPress plugin may have set, in
// 2.x priority order: the per-page object wins over the WordPress one.
export function legacyConfigSources() {
  var out = [];
  if (typeof window.seguruDebugConfig !== 'undefined' && window.seguruDebugConfig) out.push(window.seguruDebugConfig);
  if (typeof window.sdtConfig !== 'undefined' && window.sdtConfig) out.push(window.sdtConfig);
  return out;
}

// Map 2.x config keys onto 3.0 keys. A 3.0 key in the same object wins.
// Keys whose 2.x meaning has no 3.0 key yet (hotkey, levelFilter, autoRef,
// autoRefDepth) pass through unchanged.
export function mapLegacyKeys(src) {
  var out = {};
  var k;
  for (k in src) {
    if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k];
  }
  if (!('labels' in src) && 'defaultMode' in src) {
    var mode = LABELS_BY_STATE[parseInt(src.defaultMode, 10)];
    if (mode) out.labels = mode;
  }
  if (!('outline' in src) && 'outlineMode' in src) out.outline = src.outlineMode;
  if (!('dock' in src) && 'position' in src) out.dock = src.position;
  delete out.defaultMode;
  delete out.outlineMode;
  delete out.position;
  return out;
}

// Move a theme saved under the 2.x key to the 3.0 key, once.
export function migrateLegacyStorage() {
  try {
    var ls = window.localStorage;
    if (!ls) return;
    var old = ls.getItem(OLD_THEME_KEY);
    if (old === null) return;
    if (ls.getItem(THEME_STORAGE_KEY) === null) ls.setItem(THEME_STORAGE_KEY, old);
    ls.removeItem(OLD_THEME_KEY);
  } catch (e) { /* storage may be blocked */ }
}

// Fire the 2.x twin of a 3.0 event. Address events pass their 2.x detail,
// { dataRef, element, current }, separately.
function emitLegacy(name, detail) {
  var old = OLD_EVENTS[name];
  if (old) dispatchWindowEvent(OLD_EVENT_PREFIX + old, detail);
}

export function installAliases(api, queueable) {
  api.setState = queueable(setState);
  api.getState = function () { return S.state; };
  api.setDepth = queueable(setDepth);
  api.getDepth = function () { return S.autoRefEnabled ? S.autoRefDepth : 'off'; };
  api.setLevelFilter = queueable(setLevelFilter);
  api.getLevelFilter = function () { return S.levelFilter; };
  // Always the Titan grammar, whatever profile is active, as in 2.x. The
  // core rules aren't applied: an old call returns what it returned in 2.5.0.
  api.classifyDataRef = classifyTitan;
  api.setHotkey = queueable(setHotkey);
  api.getHotkey = function () { return S.hotkey; };

  S.legacyEmit = emitLegacy;

  var noticed = false;
  try {
    Object.defineProperty(window, OLD_GLOBAL, {
      configurable: true,
      enumerable: false,
      get: function () {
        if (!noticed) {
          noticed = true;
          if (typeof console !== 'undefined' && console.info) {
            console.info('[stadiaref] window.' + OLD_GLOBAL + ' is now window.stadiaref. The old name keeps working through 3.x.');
          }
        }
        return api;
      },
      // A 2.x page may assign a stub before loading the script. The real
      // API stays in place.
      set: function () {}
    });
  } catch (e) {
    window[OLD_GLOBAL] = api;
  }
}
