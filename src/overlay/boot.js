import { S } from './state.js';
import { S_MARK_SVG } from './brand.js';
import { hideActiveRefTree, showActiveRefTree } from './chain.js';
import { normalizeHotkey, readPersistedTheme, readScriptAttr } from './config.js';
import { DEPTH_LABELS, LEVEL_LABELS, MODE_LABELS, OUTLINE_LABELS, SDT_VERSION } from './constants.js';
import { applyDockPosition, normalizeDock, pickAutoDock } from './dock.js';
import { closestMatch, forEachNode } from './dom.js';
import { emitEvent } from './events.js';
import { attachKeys } from './keys.js';
import { MARKER, injectLabels, resolveLabelOverlaps, syncAllVoidHosts, syncVoidHost } from './labels.js';
import { applyVisibility } from './lifecycle.js';
import { setState } from './mode.js';
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

  // ─── Config merge: wpConfig (PHP-injected) + sdtConfig (per-page override) + script[data-*]
  // wpConfig is set by WordPress via wp_localize_script under the key 'sdtConfig'.
  // sdtConfig is a per-page override set directly on window (e.g. in wireframes).
  // The host script tag may also carry data-hotkey / data-theme / data-dock attributes.
  // Page-level sdtConfig overrides wpConfig; both fall back to defaults.
  S.wpConfig = (typeof window.sdtConfig !== 'undefined') ? window.sdtConfig : {};
  S.pageConfig = (typeof window.seguruDebugConfig !== 'undefined') ? window.seguruDebugConfig : {};

  // Capture the host <script> element (only valid during initial sync execution).
  S.hostScriptEl = document.currentScript || null;
  S.scriptConfig = {
    hotkey: readScriptAttr('data-hotkey'),
    theme: readScriptAttr('data-theme'),
    dock: readScriptAttr('data-dock'),
    position: readScriptAttr('data-position')
  };

  // Merge: pageConfig > wpConfig > scriptConfig
  S.config = {};
  var _keys = ['defaultMode', 'classConverter', 'autoRef', 'autoRefDepth', 'outlineMode', 'levelFilter', 'position', 'pageSlug', 'startHidden', 'hotkey', 'theme', 'dock', 'user'];
  for (var _i = 0; _i < _keys.length; _i++) {
    var _k = _keys[_i];
    if (_k in S.pageConfig) S.config[_k] = S.pageConfig[_k];
    else if (_k in S.wpConfig) S.config[_k] = S.wpConfig[_k];
    else if (_k in S.scriptConfig && typeof S.scriptConfig[_k] !== 'undefined') S.config[_k] = S.scriptConfig[_k];
  }

  // 0=icons, 1=off, 2=full. Default 2 (Full) when no config provided.
  var _parsedMode = parseInt(S.config.defaultMode, 10);
  S.state = isNaN(_parsedMode) ? 2 : _parsedMode;

  // Feature flags
  S.classConverterEnabled = S.config.classConverter === '1' || S.config.classConverter === true;
  // Auto-ref is OFF by default — only the WordPress plugin sets autoRef: true
  // via sdtConfig (wp_localize_script). Standard hosts label elements manually
  // with data-ref; auto-tagging is opt-in via seguruDebugConfig.autoRef = true.
  S.autoRefEnabled = S.config.autoRef === '1' || S.config.autoRef === true;
  S.autoRefDepth = S.config.autoRefDepth || 'all'; // section | block | element | all (default all)
  S.outlineMode = S.config.outlineMode || 'off'; // off | section | block
  S.levelFilter = S.config.levelFilter || 'all'; // all | section | section-block

  // Presentation mode — visibility hotkey toggles toolbar + label visibility.
  // Default ON so the toolbar stays out of screenshots, Chrome debug sessions
  // (e.g. captured by AI agents), and client demos until explicitly revealed.
  // Set seguruDebugConfig.startHidden = false to restore legacy "visible on load" behaviour.
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
    : (normalizeDock(S.config.dock) || normalizeDock(S.config.position));
  S.position = S._initialDock === 'auto' ? 'bottom-right' : (S._initialDock || 'bottom-right');

  // ─── Label CSS (injected into main document) ───────────────
  // Labels live inside data-ref elements, so they share the page DOM.
  // `all:initial` resets inherited page/builder styles (Elementor, Bricks, etc.)
  // before re-declaring our own properties.
  S.labelCss = document.createElement('style');
  S.labelCss.id = 'seguru-debug-toolbar-styles';
  S.labelCss.textContent = LABEL_CSS;

  document.head.appendChild(S.labelCss);


  // ─── Shadow DOM for toolbar + toast (isolated from page CSS) ─
  S.shadowHost = document.createElement('div');
  S.shadowHost.id = 'seguru-debug-toolbar-host';
  S.shadowHost.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99999;pointer-events:none;';
  S.shadowCss = buildShadowCss();


  var initModeLabel = MODE_LABELS[S.state] || 'Icons';
  var initDepthLabel = S.autoRefEnabled ? (DEPTH_LABELS[S.autoRefDepth] || 'All') : 'Off';
  var initOutlineLabel = OUTLINE_LABELS[S.outlineMode] || 'Off';
  var initLevelFilterLabel = LEVEL_LABELS[S.levelFilter] || 'All';

  // ─── Build toolbar DOM ──────────────────────────────────────
  S.toolbar = document.createElement('div');
  S.toolbar.className = 'sdt-toolbar';
  S.toolbar.setAttribute('role', 'toolbar');
  S.toolbar.setAttribute('aria-label', 'Element reference labels');
  S.toolbar.innerHTML =
    '<a class="sdt-toolbar__badge" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="Powered by Seguru Digital">' +
      S_MARK_SVG +
      '<span class="sdt-toolbar__badge-tip">Powered by Seguru Digital</span>' +
    '</a>' +
    '<div class="sdt-toolbar__user" data-sdt-user-pill role="status">' +
      '<span class="sdt-toolbar__user-avatar" data-sdt-user-avatar aria-hidden="true"></span>' +
      '<span class="sdt-toolbar__user-name" data-sdt-user-name></span>' +
      '<span class="sdt-toolbar__user-role" data-sdt-user-role></span>' +
    '</div>' +
    '<div class="sdt-toolbar__cluster sdt-toolbar__cluster--primary">' +
      // ── Mode dropdown ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--primary" data-sdt-group="mode">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--active" data-sdt-toggle="mode">' +
          '<span class="sdt-toolbar__key">Labels</span>' +
          '<span class="sdt-toolbar__value">' + initModeLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="mode">' +
          '<div class="sdt-toolbar__hint" data-sdt-mode-hint>Press L to cycle</div>' +
          '<button class="sdt-toolbar__option' + (S.state === 2 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="2">' +
            '<span class="sdt-toolbar__option-dot"></span> Full' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.state === 0 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="0">' +
            '<span class="sdt-toolbar__option-dot"></span> Icons' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.state === 1 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="1">' +
            '<span class="sdt-toolbar__option-dot"></span> Off' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Target (depth) dropdown ──
      // The user-facing label is "Target"; internally we still call this
      // "depth" — public API methods setDepth/getDepth keep their names so
      // existing consumers don't break.
      '<div class="sdt-toolbar__group sdt-toolbar__group--primary" data-sdt-group="depth">' +
        '<button class="sdt-toolbar__select' + (S.autoRefEnabled ? ' sdt-toolbar__select--active' : '') + '" data-sdt-toggle="depth">' +
          '<span class="sdt-toolbar__key">Target</span>' +
          '<span class="sdt-toolbar__value">' + initDepthLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="depth">' +
          '<div class="sdt-toolbar__hint">Press T to cycle</div>' +
          '<button class="sdt-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'all' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="all">' +
            '<span class="sdt-toolbar__option-dot"></span> All — sections, blocks &amp; elements' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'element' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="element">' +
            '<span class="sdt-toolbar__option-dot"></span> Elements — headings, text, images, buttons only' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="block">' +
            '<span class="sdt-toolbar__option-dot"></span> Blocks — containers only' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.autoRefEnabled && S.autoRefDepth === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="section">' +
            '<span class="sdt-toolbar__option-dot"></span> Sections — top-level page sections only' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (!S.autoRefEnabled ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="off">' +
            '<span class="sdt-toolbar__option-dot"></span> Off — manual labels only' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Level filter dropdown ──
      // Controls which grammar classes are shown: All (default), Sections only,
      // Sections + Blocks. Filters by sdt-ref-class-* applied in injectLabels().
      '<div class="sdt-toolbar__group sdt-toolbar__group--primary" data-sdt-group="level">' +
        '<button class="sdt-toolbar__select' + (S.levelFilter !== 'all' ? ' sdt-toolbar__select--active' : '') + '" data-sdt-toggle="level">' +
          '<span class="sdt-toolbar__key">Level</span>' +
          '<span class="sdt-toolbar__value">' + initLevelFilterLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="level">' +
          '<div class="sdt-toolbar__hint">Press F to cycle</div>' +
          '<button class="sdt-toolbar__option' + (S.levelFilter === 'all' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-level="all">' +
            '<span class="sdt-toolbar__option-dot"></span> All — sections, blocks, elements' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.levelFilter === 'section-block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-level="section-block">' +
            '<span class="sdt-toolbar__option-dot"></span> Sec + Blk — sections and blocks' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.levelFilter === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-level="section">' +
            '<span class="sdt-toolbar__option-dot"></span> Sections — top-level sections only' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="sdt-toolbar__cluster sdt-toolbar__cluster--utility">' +
      // ── Outline dropdown ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--utility" data-sdt-group="outline">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--utility sdt-toolbar__select--diagnostic' + (S.outlineMode !== 'off' ? ' sdt-toolbar__select--active' : '') + '" data-sdt-toggle="outline">' +
          '<span class="sdt-toolbar__key">Outline</span>' +
          '<span class="sdt-toolbar__value">' + initOutlineLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="outline">' +
          '<div class="sdt-toolbar__hint">Press O to cycle</div>' +
          '<button class="sdt-toolbar__option' + (S.outlineMode === 'block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="block">' +
            '<span class="sdt-toolbar__option-dot"></span> Blocks — sections plus inner containers' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.outlineMode === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="section">' +
            '<span class="sdt-toolbar__option-dot"></span> Sections — top-level wrappers only' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (S.outlineMode === 'off' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="off">' +
            '<span class="sdt-toolbar__option-dot"></span> Off — no spacing guides' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Tree toggle ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--tree sdt-toolbar__group--utility" data-sdt-group="tree">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--utility sdt-toolbar__select--diagnostic" data-sdt-toggle-tree>' +
          '<span class="sdt-toolbar__value">\u229E Tree</span>' +
        '</button>' +
      '</div>' +
    '</div>';


  // ─── Toast element ──────────────────────────────────────────
  S.toast = document.createElement('div');
  S.toast.className = 'sdt-toast';
  S.toastTimer = null;

  S.visibilityRecheckScheduled = false;


  // ─── Tree panel ─────────────────────────────────────────────
  S.treeOpen = false;
  S.treeJumpTimer = null;
  S.treeJumpTarget = null;
  S.treePanel = document.createElement('div');
  S.treePanel.className = 'sdt-tree-panel';

  // Active-ref tree panel — shows data-ref breadcrumb chain on hover.
  // Positioned at the opposite vertical edge from the toolbar.
  // Can be pinned to stay open; Escape closes it when unpinned.
  S.activeRefTreeOpen = false;
  S.activeRefTreePinned = false;
  S.activeRefTreeHideTimer = null;
  S.activeRefTree = document.createElement('div');
  S.activeRefTree.className = 'sdt-active-ref-tree';

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

  if (S.state !== 0) setState(S.state);
  if (S.outlineMode !== 'off') setOutline(S.outlineMode);
  if (S.levelFilter !== 'all') applyLevelFilter();

  // Apply initial visibility (hidden by default — press the visibility
  // hotkey to reveal). hide()/show() called pre-boot have already updated
  // `presentationMode`, so this just reflects whatever state was queued.
  applyVisibility();

  // Dropdown toggle clicks
  forEachNode(S.toolbar.querySelectorAll('[data-sdt-toggle]'), function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(trigger.getAttribute('data-sdt-toggle'));
    });
  });

  // Mode option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-sdt-state]'), function (opt) {
    opt.addEventListener('click', function () {
      setState(parseInt(opt.getAttribute('data-sdt-state'), 10));
    });
  });

  // Depth option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-sdt-depth]'), function (opt) {
    opt.addEventListener('click', function () {
      setDepth(opt.getAttribute('data-sdt-depth'));
    });
  });

  // Outline option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-sdt-outline]'), function (opt) {
    opt.addEventListener('click', function () {
      setOutline(opt.getAttribute('data-sdt-outline'));
    });
  });

  // Level filter option clicks
  forEachNode(S.toolbar.querySelectorAll('[data-sdt-level]'), function (opt) {
    opt.addEventListener('click', function () {
      setLevelFilter(opt.getAttribute('data-sdt-level'));
    });
  });

  // Tree panel toggle
  var treeToggleBtn = S.toolbar.querySelector('[data-sdt-toggle-tree]');
  if (treeToggleBtn) {
    treeToggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTree();
    });
  }

  // Close dropdowns on click outside (shadow root)
  shadow.addEventListener('click', function (e) {
    if (!closestMatch(e.target, '[data-sdt-toggle]') && !closestMatch(e.target, '.sdt-toolbar__dropdown')) {
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

  // Active-ref tree hover wiring via sdt:dataref-hover window event.
  // Both icon mouseenter and fullLabel mouseenter fire this event, so the
  // tree updates smoothly when moving between label variants on the same el.
  window.addEventListener('sdt:dataref-hover', function (e) {
    if (S.presentationMode || S.state === 1) return;
    showActiveRefTree(e.detail);
  });
  window.addEventListener('sdt:dataref-leave', function () {
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
      var sawNonSdtMutation = false;
      for (var i = 0; i < mutations.length; i++) {
        var t = mutations[i].target;
        // Ignore mutations on SDT's own label nodes (toggling
        // .sdt-ref-hidden / .sdt-visible-host would otherwise loop).
        if (t && t.classList && (
          t.classList.contains('sdt-ref-icon') ||
          t.classList.contains('sdt-ref-tooltip') ||
          t.classList.contains('sdt-ref-full-label') ||
          t.classList.contains('sdt-ref-link')
        )) continue;
        sawNonSdtMutation = true;
        // Eager-hide all [data-ref] descendants of the mutated node
        // before rAF schedules. This closes the ~16ms window between
        // the mutation firing and applyLabelVisibilityState running
        // where labels would otherwise still be pointer-events:auto.
        eagerHideDescendantLabels(t);
      }
      if (sawNonSdtMutation) scheduleVisibilityRecheck();
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

  emitEvent('ready', { version: SDT_VERSION });
}
