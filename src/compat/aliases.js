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
import { setKeys } from '../overlay/keys.js';
import { setState } from '../overlay/mode.js';
import { applyAutoAddress, getTiers, setTiers } from '../overlay/tiers.js';

var OLD_GLOBAL = 'seguruDebugToolbar';
var OLD_EVENT_PREFIX = 'sdt:';
var OLD_THEME_KEY = 'seguru-debug-toolbar:theme';

// The 2.x hotkey: one letter A-Z, upper-cased; false, 'false' or null turn
// it off; anything else falls back to D with a warning.
function normalizeHotkey(value) {
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

// 2.x label mode numbers.
var LABELS_BY_STATE = { 0: 'icons', 1: 'off', 2: 'full' };

// 2.x Level filter values and the Show tiers each one means.
var LEVEL_TIERS = {
  'all': ['section', 'block', 'element'],
  'section-block': ['section', 'block'],
  'section': ['section']
};

function levelFilterOf(tiers) {
  for (var name in LEVEL_TIERS) {
    if (LEVEL_TIERS[name].join(' ') === tiers.join(' ')) return name;
  }
  return 'all';
}

// What the 2.x getDepth() returns: the Target value last set.
function getDepth() {
  return S.autoRefEnabled ? S.autoRefDepth : 'off';
}

// 2.x Target. 'off' and 'all' are auto-address off and on. 'section',
// 'block' and 'element' turn auto-address on for that tier only, with the
// 2.x target lists. Show (tiers) is left alone, so authored addresses stay
// on screen at every tier, as they did in 2.x.
function setDepth(depth) {
  applyAutoAddress(depth);
}

// 2.x Level: 'all', 'section-block', 'section', mapped to Show.
function setLevelFilter(value) {
  if (!Object.prototype.hasOwnProperty.call(LEVEL_TIERS, value)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setLevelFilter expected all/section/section-block, got', value);
    }
    return;
  }
  setTiers(LEVEL_TIERS[value]);
}

// 3.0 event name → 2.x event name. Events missing here have no 2.x twin.
// A function builds the 2.x detail where it differs.
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
  'auto-address-change': ['depth-change', function () { return { depth: getDepth() }; }],
  'tiers-change': ['level-filter-change', function () { return { levelFilter: levelFilterOf(getTiers()) }; }]
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
  if (!('tiers' in src) && 'levelFilter' in src && LEVEL_TIERS[src.levelFilter]) out.tiers = LEVEL_TIERS[src.levelFilter].slice();
  if (!('autoAddress' in src) && 'autoRef' in src) out.autoAddress = src.autoRef === true || src.autoRef === '1';
  if ('hotkey' in src && !(src.keys && 'toggle' in src.keys)) {
    out.keys = {};
    if (src.keys && typeof src.keys === 'object') {
      for (var a in src.keys) out.keys[a] = src.keys[a];
    }
    out.keys.toggle = normalizeHotkey(src.hotkey);
  }
  delete out.defaultMode;
  delete out.outlineMode;
  delete out.position;
  delete out.levelFilter;
  delete out.autoRef;
  delete out.hotkey;
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
  if (!old) return;
  if (typeof old === 'string') dispatchWindowEvent(OLD_EVENT_PREFIX + old, detail);
  else dispatchWindowEvent(OLD_EVENT_PREFIX + old[0], old[1](detail));
}

export function installAliases(api, queueable) {
  api.setState = queueable(setState);
  api.getState = function () { return S.state; };
  api.setDepth = queueable(setDepth);
  api.getDepth = getDepth;
  api.setLevelFilter = queueable(setLevelFilter);
  // The 2.x value when the current tiers match one, otherwise 'all'.
  api.getLevelFilter = function () { return levelFilterOf(getTiers()); };
  // Always the Titan grammar, whatever profile is active, as in 2.x. The
  // core rules aren't applied: an old call returns what it returned in 2.5.0.
  api.classifyDataRef = classifyTitan;
  // The 2.x hotkey is the toggle key, normalised as 2.x did: one letter,
  // upper-cased, or false.
  api.setHotkey = queueable(function (value) { setKeys({ toggle: normalizeHotkey(value) }); });
  api.getHotkey = function () { return S.keys.toggle; };

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

// True when a 2.x copy of the overlay is already running on the page: it
// sets the old global (index.js then doesn't start a second overlay).
export function legacyRunning() {
  return !!window[OLD_GLOBAL];
}
