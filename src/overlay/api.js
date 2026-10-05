import { S } from './state.js';
import { classifyDataRef } from './classify.js';
import { SDT_VERSION } from './constants.js';
import { setDock } from './dock.js';
import { setHotkey } from './keys.js';
import { injectLabels, resolveLabelOverlaps } from './labels.js';
import { hide, show, toggleVisibility } from './lifecycle.js';
import { setState } from './mode.js';
import { applyOutlineMode, setOutline } from './outline.js';
import { autoRefSections, convertClassRefs } from './survey.js';
import { getTheme, setTheme } from './theme.js';
import { applyLevelFilter, setDepth, setLevelFilter } from './tiers.js';
import { buildTreePanel, toggleTree } from './tree.js';
import { getUser, setUser } from './user.js';

// ─── Public init() ──────────────────────────────────────────
// Optional explicit init — most hosts rely on the auto-init on load plus
// `window.seguruDebugConfig`, but init() lets a host pass config (or change
// it) after script load. Recognised keys: hotkey, theme, dock, user.
export function publicInit(opts) {
  if (!opts || typeof opts !== 'object') return api;
  if ('hotkey' in opts) setHotkey(opts.hotkey);
  if ('theme' in opts && (opts.theme === 'auto' || opts.theme === 'light' || opts.theme === 'dark')) {
    setTheme(opts.theme);
  }
  if ('dock' in opts) setDock(opts.dock);
  if ('user' in opts) setUser(opts.user);
  return api;
}


// ─── Public API ─────────────────────────────────────────────
// Existing API (setState/getState/setDepth/getDepth/setOutline/getOutline/
// refresh/toggleTree) is preserved verbatim — documented and in use.
// v2.4.0 additions (non-breaking):
//   - setLevelFilter() / getLevelFilter()  — data-ref v5.0 level filter
//   - classifyDataRef()                    — exported classifier
export const api = {
  version: SDT_VERSION,
  setState: setState,
  getState: function () { return S.state; },
  setDepth: setDepth,
  getDepth: function () { return S.autoRefEnabled ? S.autoRefDepth : 'off'; },
  setOutline: setOutline,
  getOutline: function () { return S.outlineMode; },
  refresh: function () {
    convertClassRefs();
    autoRefSections();
    injectLabels();
    resolveLabelOverlaps();
    applyOutlineMode();
    applyLevelFilter();
    if (S.treeOpen) buildTreePanel();
  },
  toggleTree: toggleTree,
  // Lifecycle
  hide: hide,
  show: show,
  toggle: toggleVisibility,
  isVisible: function () { return !S.presentationMode; },
  // Hotkey
  setHotkey: setHotkey,
  getHotkey: function () { return S.hotkey; },
  // Theme
  setTheme: setTheme,
  getTheme: getTheme,
  // Identity
  setUser: setUser,
  getUser: getUser,
  // Dock
  setDock: setDock,
  getDock: function () { return S.position; },
  // Level filter (v2.4.0 — data-ref v5.0)
  setLevelFilter: setLevelFilter,
  getLevelFilter: function () { return S.levelFilter; },
  // Classifier (v2.4.0 — exposed so hosts can interrogate refs)
  classifyDataRef: classifyDataRef,
  // Init
  init: publicInit
};
