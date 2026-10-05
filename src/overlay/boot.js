import { S } from './state.js';
import { hideActiveRefTree, showActiveRefTree } from './chain.js';
import { readConfig, readPersistedTheme } from './config.js';
import { migrateLegacyStorage } from '../compat/aliases.js';
import { VERSION } from './constants.js';
import { applyDockPosition, normalizeDock, pickAutoDock } from './dock.js';
import { closestMatch, forEachNode } from './dom.js';
import { emitEvent } from './events.js';
import { attachKeys, defaultKeys, mergeKeys } from './keys.js';
import { isLive } from './mount.js';
import { selectProfile } from './profile.js';
import { injectLabels, isLabelled, resolveLabelOverlaps, syncAllVoidHosts, syncVoidHost } from './labels.js';
import { applyVisibility } from './lifecycle.js';
import { LABEL_MODES, applyState, setState } from './mode.js';
import { setOutline } from './outline.js';
import { LABEL_CSS } from './styles/labels.js';
import { buildShadowCss } from './styles/shadow.js';
import { autoRefSections, convertClassRefs } from './survey.js';
import { applyTheme, setupHtmlClassObserver, setupThemeMediaListener } from './theme.js';
import { parseTiers, toggleTier } from './tiers.js';
import { attachMenuKeys, closeAllDropdowns, toggleDropdown, toolbarHtml, updateAutoChip, updateKeyHints, updateShowControl } from './toolbar.js';
import { buildTreePanel, toggleTree } from './tree.js';
import { renderUser, snapshotUser } from './user.js';
import { applyLabelVisibilityState, eagerHideDescendantLabels, scheduleVisibilityRecheck } from './visibility.js';

export function boot() {

  // ─── Config ───────────────────────────────────────────────
  // Sources, highest first: window.stadiarefConfig, the 2.x config objects,
  // attributes on the script tag. See readConfig().
  // The host <script> element is only available during this first, synchronous run.
  S.hostScriptEl = document.currentScript || null;
  S.config = readConfig();
  migrateLegacyStorage();

  // Address profile. An unregistered name falls back to generic until it is
  // registered (see setProfile()).
  selectProfile(typeof S.config.profile === 'string' && S.config.profile ? S.config.profile : 'generic');

  // Label mode: 0=icons, 1=off, 2=full. Default 2 (Full).
  S.state = Object.prototype.hasOwnProperty.call(LABEL_MODES, S.config.labels) ? LABEL_MODES[S.config.labels] : 2;

  // Feature flags
  S.classConverterEnabled = S.config.classConverter === '1' || S.config.classConverter === true;
  // Auto-ref is OFF by default — only the WordPress plugin sets autoRef: true
  // via its injected config. Standard hosts label elements manually
  // with data-ref; auto-tagging is opt-in via the autoRef config key.
  // autoAddress is the 3.0 switch; the 2.x autoRef maps onto it. A 2.x
  // autoRefDepth of section, block or element keeps its single-tier meaning.
  S.autoRefEnabled = S.config.autoAddress === true || S.config.autoAddress === '1';
  S.autoRefDepth = S.config.autoRefDepth || 'all'; // section | block | element | all (default all)
  S.autoAddresses = new WeakMap();
  S.autoCounter = 0;
  S.outlineMode = S.config.outline || 'off'; // off | section | block
  S.tiers = parseTiers(S.config.tiers) || { section: true, block: true, element: true };

  // Presentation mode — visibility hotkey toggles toolbar + label visibility.
  // Default ON so the toolbar stays out of screenshots, Chrome debug sessions
  // (e.g. captured by AI agents), and client demos until explicitly revealed.
  // Set startHidden: false to start visible.
  S.presentationMode = !(S.config.startHidden === '0' || S.config.startHidden === false);
  S.keys = mergeKeys(defaultKeys(), S.config.keys);
  S.theme = (function () {
    var raw = S.config.theme;
    if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw;
    var persisted = readPersistedTheme();
    return persisted || 'auto';
  })();
  S.resolvedTheme = 'light'; // computed at applyTheme()
  S.darkMediaQuery = null;

  // ─── Identity ──────────────────────────────────────────────
  // currentUser holds a snapshot of the documented public fields only.
  S.currentUser = snapshotUser(S.config.user);
  S._initialDock = (typeof S.config.dock === 'string' && S.config.dock.toLowerCase() === 'auto')
    ? 'auto'
    : normalizeDock(S.config.dock);
  S.position = S._initialDock === 'auto' ? 'bottom-right' : (S._initialDock || 'bottom-right');

  // ─── Label CSS ──────────────────────────────────────────────
  // Built now, added to the page's <head> on first show (see mount.js).
  S.labelCss = document.createElement('style');
  S.labelCss.id = 'stadiaref-styles';
  S.labelCss.textContent = LABEL_CSS;


  // ─── Shadow DOM for toolbar + toast (isolated from page CSS) ─
  // The host carries data-stadiaref-root: the marker to search a production
  // build for. It is built in memory now and added to the page on first show.
  S.shadowHost = document.createElement('div');
  S.shadowHost.id = 'stadiaref-host';
  S.shadowHost.setAttribute('data-stadiaref-root', '');
  S.shadowHost.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99999;pointer-events:none;';
  S.shadowCss = buildShadowCss();
  S.shadowRoot = S.shadowHost.attachShadow({ mode: 'open' });


  // ─── Build toolbar DOM ──────────────────────────────────────
  S.toolbar = document.createElement('div');
  S.toolbar.className = 'stadiaref-toolbar';
  S.toolbar.setAttribute('role', 'toolbar');
  S.toolbar.setAttribute('aria-label', 'StadiaRef');
  S.toolbar.innerHTML = toolbarHtml();


  // ─── Toast element ──────────────────────────────────────────
  S.toast = document.createElement('div');
  S.toast.className = 'stadiaref-toast';
  S.toastTimer = null;

  S.visibilityRecheckScheduled = false;


  // ─── Tree panel ─────────────────────────────────────────────
  S.treeOpen = false;
  S.treeJumpTimer = null;
  S.treePanel = document.createElement('div');
  S.treePanel.className = 'stadiaref-tree-panel';

  // Active-ref tree panel — shows data-ref breadcrumb chain on hover.
  // Positioned at the opposite vertical edge from the toolbar.
  // Can be pinned to stay open; Escape closes it when unpinned.
  S.activeRefTreeOpen = false;
  S.activeRefTreePinned = false;
  S.activeRefTreeHideTimer = null;
  S.activeRefTree = document.createElement('div');
  S.activeRefTree.className = 'stadiaref-active-ref-tree';

  var shadowStyle = document.createElement('style');
  shadowStyle.textContent = S.shadowCss;
  S.shadowRoot.appendChild(shadowStyle);
  S.shadowRoot.appendChild(S.toolbar);
  S.shadowRoot.appendChild(S.toast);
  S.shadowRoot.appendChild(S.treePanel);
  S.shadowRoot.appendChild(S.activeRefTree);

  // Watch <html class> mutations so `theme: 'auto'` reacts when the host
  // toggles `html.dark` post-init. Without this, the legacy `:host-context`
  // selectors would update the visual theme correctly but `getTheme()` would
  // return a stale value until next setTheme() call.
  S.htmlClassObserver = null;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}



// ─── Init ───────────────────────────────────────────────────
function init() {
  var shadow = S.shadowRoot;

  // Resolve `dock: 'auto'` once the DOM exists, then apply dock position via
  // inline styles so setDock() can update at runtime.
  if (S._initialDock === 'auto') {
    S.position = pickAutoDock();
  }
  applyDockPosition();

  // Apply theme before any visible chrome lands.
  applyTheme();
  setupThemeMediaListener();
  setupHtmlClassObserver();

  // Render user pill if a user was supplied via init config.
  renderUser();

  // Reflect the configured keys in the menu hints and the AUTO chip state.
  updateKeyHints();
  updateAutoChip();

  // The class converter, when on, runs at start even while hidden, as in 2.x.
  convertClassRefs();

  applyState(S.state);
  if (S.outlineMode !== 'off') setOutline(S.outlineMode);
  updateShowControl();

  // Hidden by default: nothing more is written until the first show. With
  // startHidden: false this mounts StadiaRef and runs the first survey.
  applyVisibility();

  // Dropdown toggle clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-toggle]'), function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      // A click with no pointer detail came from the keyboard (Enter or Space).
      toggleDropdown(trigger.getAttribute('data-stadiaref-toggle'), e.detail === 0);
    });
  });

  // Mode option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-state]'), function (opt) {
    opt.addEventListener('click', function () {
      setState(parseInt(opt.getAttribute('data-stadiaref-state'), 10));
    });
  });

  // Outline option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-outline]'), function (opt) {
    opt.addEventListener('click', function () {
      setOutline(opt.getAttribute('data-stadiaref-outline'));
    });
  });

  // Show: tick boxes toggle a tier each and leave the menu open.
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-tier]'), function (opt) {
    opt.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTier(opt.getAttribute('data-stadiaref-tier'));
    });
  });

  // Pick and Find (stage 6 wires their actions through S.keyActions).
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-pick], [data-stadiaref-find]'), function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var action = btn.hasAttribute('data-stadiaref-pick') ? 'pick' : 'find';
      if (S.keyActions && S.keyActions[action]) S.keyActions[action]();
    });
  });

  attachMenuKeys();

  // Tree panel toggle
  var treeToggleBtn = S.toolbar.querySelector('[data-stadiaref-toggle-tree]');
  if (treeToggleBtn) {
    treeToggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTree();
    });
  }

  // Close dropdowns on click outside (shadow root)
  shadow.addEventListener('click', function (e) {
    if (!closestMatch(e.target, '[data-stadiaref-toggle]') && !closestMatch(e.target, '.stadiaref-toolbar__dropdown')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns on click outside (main document)
  document.addEventListener('click', function (e) {
    if (!S.shadowHost.contains(e.target) && e.target !== S.shadowHost) {
      closeAllDropdowns();
    }
  });

  // Keyboard shortcuts
  attachKeys();

  // Address chain hover wiring via the stadiaref:address-hover window event.
  // Both icon mouseenter and fullLabel mouseenter fire this event, so the
  // chain updates smoothly when moving between label variants on the same el.
  window.addEventListener('stadiaref:address-hover', function (e) {
    if (S.presentationMode || S.state === 1) return;
    showActiveRefTree({ dataRef: e.detail.address, element: e.detail.element });
  });
  window.addEventListener('stadiaref:address-leave', function () {
    hideActiveRefTree();
  });

  window.addEventListener('resize', function () {
    if (isLive()) applyDockPosition();
    syncAllVoidHosts();
    applyLabelVisibilityState();
    resolveLabelOverlaps();
  });
  // Images settle their box after load; keep the void hosts on them.
  window.addEventListener('load', syncAllVoidHosts);
  forEachNode(document.querySelectorAll('img'), function (img) {
    if (!img.complete) img.addEventListener('load', function () { if (isLive()) syncVoidHost(img); }, { once: true });
  });

  // Live visibility re-check. Mega menus, dropdowns, modals, and tabs flip
  // between hidden/visible via class or inline-style mutations on
  // ancestors — usually with opacity or display transitions. Watch the
  // body for style/class changes (debounced via rAF) and re-check on
  // transitionend for opacity/visibility transitions so labels appear
  // exactly when their container does.
  if (typeof window.MutationObserver === 'function') {
    var visibilityObserver = new window.MutationObserver(function (mutations) {
      if (!isLive()) return;
      var sawHostMutation = false;
      for (var i = 0; i < mutations.length; i++) {
        var t = mutations[i].target;
        // Ignore mutations on StadiaRef's own label nodes (toggling
        // .stadiaref-ref-hidden / .stadiaref-visible-host would otherwise loop).
        if (t && t.classList && (
          t.classList.contains('stadiaref-ref-icon') ||
          t.classList.contains('stadiaref-ref-tooltip') ||
          t.classList.contains('stadiaref-ref-full-label') ||
          t.classList.contains('stadiaref-ref-link')
        )) continue;
        sawHostMutation = true;
        // Eager-hide all [data-ref] descendants of the mutated node
        // before rAF schedules. This closes the ~16ms window between
        // the mutation firing and applyLabelVisibilityState running
        // where labels would otherwise still be pointer-events:auto.
        eagerHideDescendantLabels(t);
      }
      if (sawHostMutation) scheduleVisibilityRecheck();
    });
    visibilityObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
      subtree: true
    });
  }

  document.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'opacity' || e.propertyName === 'visibility' || e.propertyName === 'display') {
      scheduleVisibilityRecheck();
    }
  }, true);

  // Late data-ref re-scan — some hosts (WordPress blocks, page builders,
  // inline scripts) inject or stamp `data-ref` attributes after
  // DOMContentLoaded, so the initial injectLabels() call misses them.
  // A second pass on window.load is idempotent: injectLabels() skips
  // elements that are already labelled, so only genuinely new refs
  // are processed. The early-return check avoids the layout work entirely
  // when nothing new was added.
  // When the script is loaded after window.load has already fired
  // (e.g. dynamically injected), fall back to a rAF so at least
  // synchronous post-init stamps are caught.
  function lateRescan() {
    if (!isLive()) return;
    var refs = document.querySelectorAll('[data-ref]');
    var hasNew = false;
    forEachNode(refs, function (el) {
      if (!isLabelled(el)) hasNew = true;
    });
    if (!hasNew) return;
    convertClassRefs();
    if (S.autoRefEnabled) autoRefSections();
    injectLabels();
    resolveLabelOverlaps();
    if (S.treeOpen) buildTreePanel();
  }
  if (document.readyState === 'complete') {
    var _lateRaf = window.requestAnimationFrame || function (cb) { setTimeout(cb, 0); };
    _lateRaf(lateRescan);
  } else {
    window.addEventListener('load', lateRescan);
  }

  // Started: the API is live. Apply the calls made before start, in order,
  // then resolve `ready`, then announce it.
  S.booted = true;
  var queued = S.queue;
  S.queue = [];
  for (var q = 0; q < queued.length; q++) queued[q][0].apply(null, queued[q][1]);
  if (S.resolveReady) S.resolveReady();
  emitEvent('ready', { version: VERSION });
}
