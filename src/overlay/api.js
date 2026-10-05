import { S } from './state.js';
import { VERSION } from './constants.js';
import { setDock } from './dock.js';
import { getKeys, setKeys } from './keys.js';
import { injectLabels, resolveLabelOverlaps } from './labels.js';
import { hide, show, toggleVisibility } from './lifecycle.js';
import { getLabels, setLabels } from './mode.js';
import { applyOutlineMode, setOutline } from './outline.js';
import { autoRefSections, convertClassRefs } from './survey.js';
import { getTheme, setTheme } from './theme.js';
import { applyAutoAddress, getAutoAddress, getTiers, setAutoAddress, setTiers } from './tiers.js';
import { buildTreePanel, toggleTree } from './tree.js';
import { getUser, setUser } from './user.js';
import { activeProfile, classifyAddress } from './classify.js';
import { registerSelected, selectProfile } from './profile.js';
import { validate as coreValidate } from '../core/index.js';
import { mapLegacyKeys } from '../compat/aliases.js';

// ─── Public init() ──────────────────────────────────────────
// Applies any config key at any time. Before start the call is queued and
// applied once StadiaRef has started, after the config it loaded with.
export function publicInit(opts) {
  if (!opts || typeof opts !== 'object') return api;
  var o = mapLegacyKeys(opts);
  if ('keys' in o) setKeys(o.keys);
  if ('theme' in o && (o.theme === 'auto' || o.theme === 'light' || o.theme === 'dark')) {
    setTheme(o.theme);
  }
  if ('dock' in o) setDock(o.dock);
  if ('user' in o) setUser(o.user);
  if ('labels' in o) setLabels(o.labels);
  if ('outline' in o) setOutline(o.outline);
  if ('tiers' in o) setTiers(o.tiers);
  if ('profile' in o) setProfile(o.profile);
  if ('pageSlug' in o) S.config.pageSlug = o.pageSlug;
  if ('classConverter' in o) S.classConverterEnabled = o.classConverter === true || o.classConverter === '1';
  if ('autoAddress' in o || 'autoRefDepth' in o) {
    // A 2.x autoRefDepth of section, block or element keeps its single-tier
    // meaning; anything else is the 3.0 switch.
    var on = 'autoAddress' in o ? (o.autoAddress === true || o.autoAddress === '1') : S.autoRefEnabled;
    applyAutoAddress(on ? (o.autoRefDepth || 'all') : 'off');
  } else if ('pageSlug' in o || o.classConverter === true || o.classConverter === '1') {
    refresh();
  }
  if ('startHidden' in o && (o.startHidden === false || o.startHidden === '0')) show();
  return api;
}

// ─── Profiles ───────────────────────────────────────────────
// Switching profile re-classifies everything on the screen. Not queued:
// before start it only records the choice, which start then uses.
export function setProfile(name) {
  if (typeof name !== 'string' || !name) {
    if (typeof console !== 'undefined' && console.warn) console.warn('[stadiaref] setProfile expected a profile name, got', name);
    return;
  }
  selectProfile(name);
  if (S.booted) refresh();
}

// Not queued: errors (a taken name, a malformed profile) throw to the caller.
export function registerProfile(profile) {
  var selected = registerSelected(profile);
  if (selected && S.booted) refresh();
  return profile.name;
}

export function refresh() {
  convertClassRefs();
  autoRefSections();
  injectLabels();
  resolveLabelOverlaps();
  applyOutlineMode();
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
  setTiers: queueable(setTiers),
  getTiers: getTiers,
  setAutoAddress: queueable(setAutoAddress),
  getAutoAddress: getAutoAddress,
  setOutline: queueable(setOutline),
  getOutline: function () { return S.outlineMode; },
  toggleTree: queueable(toggleTree),
  setTheme: queueable(setTheme),
  getTheme: getTheme,
  setDock: queueable(setDock),
  getDock: function () { return S.position; },
  setKeys: queueable(setKeys),
  getKeys: getKeys,
  setUser: queueable(setUser),
  getUser: getUser,
  setProfile: setProfile,
  getProfile: function () { return S.profile; },
  registerProfile: registerProfile,
  classify: classifyAddress,
  validate: function (address) { return coreValidate(address, { profile: activeProfile() }); }
};
api.init = queueable(publicInit, api);
