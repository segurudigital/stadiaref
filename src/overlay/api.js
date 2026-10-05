import { S } from './state.js';
import { VERSION } from './constants.js';
import { setDock } from './dock.js';
import { setHotkey } from './keys.js';
import { injectLabels, resolveLabelOverlaps } from './labels.js';
import { hide, show, toggleVisibility } from './lifecycle.js';
import { getLabels, setLabels } from './mode.js';
import { applyOutlineMode, setOutline } from './outline.js';
import { autoRefSections, convertClassRefs } from './survey.js';
import { getTheme, setTheme } from './theme.js';
import { applyLevelFilter, setDepth, setLevelFilter } from './tiers.js';
import { buildTreePanel, toggleTree } from './tree.js';
import { getUser, setUser } from './user.js';
import { mapLegacyKeys } from '../compat/aliases.js';

// ─── Public init() ──────────────────────────────────────────
// Applies any config key at any time. Before start the call is queued and
// applied once StadiaRef has started, after the config it loaded with.
export function publicInit(opts) {
  if (!opts || typeof opts !== 'object') return api;
  var o = mapLegacyKeys(opts);
  if ('hotkey' in o) setHotkey(o.hotkey);
  if ('theme' in o && (o.theme === 'auto' || o.theme === 'light' || o.theme === 'dark')) {
    setTheme(o.theme);
  }
  if ('dock' in o) setDock(o.dock);
  if ('user' in o) setUser(o.user);
  if ('labels' in o) setLabels(o.labels);
  if ('outline' in o) setOutline(o.outline);
  if ('levelFilter' in o) setLevelFilter(o.levelFilter);
  if ('pageSlug' in o) S.config.pageSlug = o.pageSlug;
  if ('classConverter' in o) S.classConverterEnabled = o.classConverter === true || o.classConverter === '1';
  if ('autoRef' in o || 'autoRefDepth' in o) {
    var on = 'autoRef' in o ? (o.autoRef === true || o.autoRef === '1') : S.autoRefEnabled;
    setDepth(on ? (o.autoRefDepth || S.autoRefDepth || 'all') : 'off');
  } else if ('pageSlug' in o || o.classConverter === true || o.classConverter === '1') {
    refresh();
  }
  if ('startHidden' in o && (o.startHidden === false || o.startHidden === '0')) show();
  return api;
}

export function refresh() {
  convertClassRefs();
  autoRefSections();
  injectLabels();
  resolveLabelOverlaps();
  applyOutlineMode();
  applyLevelFilter();
  if (S.treeOpen) buildTreePanel();
}

// Calls made before StadiaRef has started are queued and applied in order
// once it has. Getters don't queue: they return the configured value.
export function queueable(fn, returnValue) {
  return function () {
    if (!S.booted) {
      S.queue.push([fn, arguments]);
      return returnValue;
    }
    return fn.apply(null, arguments);
  };
}

// ─── Public API ─────────────────────────────────────────────
// 2.x method names are added by compat/aliases.js.
export const api = {
  version: VERSION,
  ready: null,
  init: null,
  show: queueable(show),
  hide: queueable(hide),
  toggle: queueable(toggleVisibility),
  isVisible: function () { return !S.presentationMode; },
  refresh: queueable(refresh),
  setLabels: queueable(setLabels),
  getLabels: getLabels,
  setOutline: queueable(setOutline),
  getOutline: function () { return S.outlineMode; },
  toggleTree: queueable(toggleTree),
  setTheme: queueable(setTheme),
  getTheme: getTheme,
  setDock: queueable(setDock),
  getDock: function () { return S.position; },
  setUser: queueable(setUser),
  getUser: getUser
};
api.init = queueable(publicInit, api);
