import { S } from './state.js';
import { S_MARK_SVG } from './brand.js';
import { hideActiveRefTree, showActiveRefTree } from './chain.js';
import { normalizeHotkey, readConfig, readPersistedTheme } from './config.js';
import { migrateLegacyStorage } from '../compat/aliases.js';
import { DEPTH_LABELS, LEVEL_LABELS, MODE_LABELS, OUTLINE_LABELS, VERSION } from './constants.js';
import { applyDockPosition, normalizeDock, pickAutoDock } from './dock.js';
import { closestMatch, forEachNode } from './dom.js';
import { emitEvent } from './events.js';
import { attachKeys } from './keys.js';
import { selectProfile } from './profile.js';
import { MARKER, injectLabels, resolveLabelOverlaps, syncAllVoidHosts, syncVoidHost } from './labels.js';
import { applyVisibility } from './lifecycle.js';
import { LABEL_MODES, applyState, setState } from './mode.js';
import { applyOutlineMode, setOutline } from './outline.js';
import { LABEL_CSS } from './styles/labels.js';
import { buildShadowCss } from './styles/shadow.js';
import { autoRefSections, convertClassRefs } from './survey.js';
import { applyTheme, setupHtmlClassObserver, setupThemeMediaListener } from './theme.js';
import { applyLevelFilter, setDepth, setLevelFilter } from './tiers.js';
import { closeAllDropdowns, toggleDropdown, updateModeHint } from './toolbar.js';
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
  S.autoRefEnabled = S.config.autoRef === '1' || S.config.autoRef === true;
  S.autoRefDepth = S.config.autoRefDepth || 'all'; // section | block | element | all (default all)
  S.outlineMode = S.config.outline || 'off'; // off | section | block
  S.levelFilter = S.config.levelFilter || 'all'; // all | section | section-block

  // Presentation mode — visibility hotkey toggles toolbar + label visibility.
  // Default ON so the toolbar stays out of screenshots, Chrome debug sessions
  // (e.g. captured by AI agents), and client demos until explicitly revealed.
  // Set startHidden: false to start visible.
  S.presentationMode = !(S.config.startHidden === '0' || S.config.startHidden === false);
  S.hotkey = normalizeHotkey(S.config.hotkey);
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

  // ─── Label CSS (injected into main document) ───────────────
  // Labels live inside data-ref elements, so they share the page DOM.
  // `all:initial` resets inherited page/builder styles (Elementor, Bricks, etc.)
  // before re-declaring our own properties.
  S.labelCss = document.createElement('style');
  S.labelCss.id = 'stadiaref-styles';
  S.labelCss.textContent = LABEL_CSS;

  document.head.appendChild(S.labelCss);


  // ─── Shadow DOM for toolbar + toast (isolated from page CSS) ─
  S.shadowHost = document.createElement('div');
  S.shadowHost.id = 'stadiaref-host';
  S.shadowHost.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99999;pointer-events:none;';
  S.shadowCss = buildShadowCss();


  var initModeLabel = MODE_LABELS[S.state] || 'Icons';
  var initDepthLabel = S.autoRefEnabled ? (DEPTH_LABELS[S.autoRefDepth] || 'All') : 'Off';
  var initOutlineLabel = OUTLINE_LABELS[S.outlineMode] || 'Off';
  var initLevelFilterLabel = LEVEL_LABELS[S.levelFilter] || 'All';

  // ─── Build toolbar DOM ──────────────────────────────────────
  S.toolbar = document.createElement('div');
  S.toolbar.className = 'stadiaref-toolbar';
  S.toolbar.setAttribute('role', 'toolbar');
  S.toolbar.setAttribute('aria-label', 'StadiaRef');
  S.toolbar.innerHTML =
    '<a class="stadiaref-toolbar__badge" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="Powered by Seguru Digital">' +
      S_MARK_SVG +
      '<span class="stadiaref-toolbar__badge-tip">Powered by Seguru Digital</span>' +
    '</a>' +
    '<div class="stadiaref-toolbar__user" data-stadiaref-user-pill role="status">' +
      '<span class="stadiaref-toolbar__user-avatar" data-stadiaref-user-avatar aria-hidden="true"></span>' +
      '<span class="stadiaref-toolbar__user-name" data-stadiaref-user-name></span>' +
      '<span class="stadiaref-toolbar__user-role" data-stadiaref-user-role></span>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--primary">' +
      // ── Mode dropdown ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--primary" data-stadiaref-group="mode">' +
        '<button class="stadiaref-toolbar__select stadiaref-toolbar__select--active" data-stadiaref-toggle="mode">' +
          '<span class="stadiaref-toolbar__key">Labels</span>' +
          '<span class="stadiaref-toolbar__value">' + initModeLabel + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="mode">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-mode-hint>Press L to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 2 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="2">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Full' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 0 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="0">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Icons' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 1 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="1">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Off' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Target (depth) dropdown ──
      // The user-facing label is "Target"; internally we still call this
      // "depth" — public API methods setDepth/getDepth keep their names so
      // existing consumers don't break.
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--primary" data-stadiaref-group="depth">' +
        '<button class="stadiaref-toolbar__select' + (S.autoRefEnabled ? ' stadiaref-toolbar__select--active' : '') + '" data-stadiaref-toggle="depth">' +
          '<span class="stadiaref-toolbar__key">Target</span>' +
          '<span class="stadiaref-toolbar__value">' + initDepthLabel + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="depth">' +
          '<div class="stadiaref-toolbar__hint">Press T to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'all' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-depth="all">' +
            '<span class="stadiaref-toolbar__option-dot"></span> All — sections, blocks &amp; elements' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'element' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-depth="element">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Elements — headings, text, images, buttons only' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'block' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-depth="block">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Blocks — containers only' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'section' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-depth="section">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Sections — top-level page sections only' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (!S.autoRefEnabled ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-depth="off">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Off — manual labels only' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Level filter dropdown ──
      // Controls which grammar classes are shown: All (default), Sections only,
      // Sections + Blocks. Filters by stadiaref-ref-class-* applied in injectLabels().
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--primary" data-stadiaref-group="level">' +
        '<button class="stadiaref-toolbar__select' + (S.levelFilter !== 'all' ? ' stadiaref-toolbar__select--active' : '') + '" data-stadiaref-toggle="level">' +
          '<span class="stadiaref-toolbar__key">Level</span>' +
          '<span class="stadiaref-toolbar__value">' + initLevelFilterLabel + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="level">' +
          '<div class="stadiaref-toolbar__hint">Press F to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.levelFilter === 'all' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-level="all">' +
            '<span class="stadiaref-toolbar__option-dot"></span> All — sections, blocks, elements' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.levelFilter === 'section-block' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-level="section-block">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Sec + Blk — sections and blocks' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.levelFilter === 'section' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-level="section">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Sections — top-level sections only' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--utility">' +
      // ── Outline dropdown ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--utility" data-stadiaref-group="outline">' +
        '<button class="stadiaref-toolbar__select stadiaref-toolbar__select--utility stadiaref-toolbar__select--diagnostic' + (S.outlineMode !== 'off' ? ' stadiaref-toolbar__select--active' : '') + '" data-stadiaref-toggle="outline">' +
          '<span class="stadiaref-toolbar__key">Outline</span>' +
          '<span class="stadiaref-toolbar__value">' + initOutlineLabel + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="outline">' +
          '<div class="stadiaref-toolbar__hint">Press O to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'block' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="block">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Blocks — sections plus inner containers' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'section' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="section">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Sections — top-level wrappers only' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'off' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="off">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Off — no spacing guides' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Tree toggle ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--tree stadiaref-toolbar__group--utility" data-stadiaref-group="tree">' +
        '<button class="stadiaref-toolbar__select stadiaref-toolbar__select--utility stadiaref-toolbar__select--diagnostic" data-stadiaref-toggle-tree>' +
          '<span class="stadiaref-toolbar__value">\u229E Tree</span>' +
        '</button>' +
      '</div>' +
    '</div>';


  // ─── Toast element ──────────────────────────────────────────
  S.toast = document.createElement('div');
  S.toast.className = 'stadiaref-toast';
  S.toastTimer = null;

  S.visibilityRecheckScheduled = false;


  // ─── Tree panel ─────────────────────────────────────────────
  S.treeOpen = false;
  S.treeJumpTimer = null;
  S.treeJumpTarget = null;
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
  document.body.appendChild(S.shadowHost);
  var shadow = S.shadowHost.attachShadow({ mode: 'open' });
  var style = document.createElement('style');
  style.textContent = S.shadowCss;
  shadow.appendChild(style);
  shadow.appendChild(S.toolbar);
  shadow.appendChild(S.toast);
  shadow.appendChild(S.treePanel);
  shadow.appendChild(S.activeRefTree);

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

  // Reflect the configured hotkey in the mode dropdown hint.
  updateModeHint();

  convertClassRefs();
  autoRefSections();
  injectLabels();
  resolveLabelOverlaps();
  applyOutlineMode();

  if (S.state !== 0) applyState(S.state);
  if (S.outlineMode !== 'off') setOutline(S.outlineMode);
  if (S.levelFilter !== 'all') applyLevelFilter();

  // Apply initial visibility (hidden by default — press the visibility
  // hotkey to reveal). hide()/show() called pre-boot have already updated
  // `presentationMode`, so this just reflects whatever state was queued.
  applyVisibility();

  // Dropdown toggle clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-toggle]'), function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(trigger.getAttribute('data-stadiaref-toggle'));
    });
  });

  // Mode option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-state]'), function (opt) {
    opt.addEventListener('click', function () {
      setState(parseInt(opt.getAttribute('data-stadiaref-state'), 10));
    });
  });

  // Depth option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-depth]'), function (opt) {
    opt.addEventListener('click', function () {
      setDepth(opt.getAttribute('data-stadiaref-depth'));
    });
  });

  // Outline option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-outline]'), function (opt) {
    opt.addEventListener('click', function () {
      setOutline(opt.getAttribute('data-stadiaref-outline'));
    });
  });

  // Level filter option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-level]'), function (opt) {
    opt.addEventListener('click', function () {
      setLevelFilter(opt.getAttribute('data-stadiaref-level'));
    });
  });

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
    syncAllVoidHosts();
    applyLabelVisibilityState();
    resolveLabelOverlaps();
  });
  // Images settle their box after load; keep the void hosts on them.
  window.addEventListener('load', syncAllVoidHosts);
  forEachNode(document.querySelectorAll('img'), function (img) {
    if (!img.complete) img.addEventListener('load', function () { syncVoidHost(img); }, { once: true });
  });

  // Live visibility re-check. Mega menus, dropdowns, modals, and tabs flip
  // between hidden/visible via class or inline-style mutations on
  // ancestors — usually with opacity or display transitions. Watch the
  // body for style/class changes (debounced via rAF) and re-check on
  // transitionend for opacity/visibility transitions so labels appear
  // exactly when their container does.
  if (typeof window.MutationObserver === 'function') {
    var visibilityObserver = new window.MutationObserver(function (mutations) {
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
  // elements that already have the MARKER, so only genuinely new refs
  // are processed. The early-return check avoids the layout work entirely
  // when nothing new was added.
  // When the script is loaded after window.load has already fired
  // (e.g. dynamically injected), fall back to a rAF so at least
  // synchronous post-init stamps are caught.
  function lateRescan() {
    var refs = document.querySelectorAll('[data-ref]');
    var hasNew = false;
    forEachNode(refs, function (el) {
      if (!el[MARKER]) hasNew = true;
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
