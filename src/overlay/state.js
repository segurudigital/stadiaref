// The overlay's one state object. Every value that changes after load lives
// here; boot() fills it in. No other module keeps mutable module-level state.
export const S = {
  // Start-up: calls queued before start, the ready resolver, the 2.x event hook.
  booted: false,
  queue: [],
  resolveReady: null,
  legacyEmit: null,
  // Profile: the name selected, and the unregistered names already warned about.
  profile: 'generic',
  warnedProfiles: {},
  hostScriptEl: null,
  config: null,
  state: null,
  classConverterEnabled: null,
  autoRefEnabled: null,
  autoRefDepth: null,
  outlineMode: null,
  // Show: which tiers are drawn.
  tiers: { section: true, block: true, element: true },
  // Automatic addresses already given, by element, and the last number used.
  autoAddresses: null,
  autoCounter: 0,
  // Keymap.
  keys: null,
  // Hooks set by Pick and Find: leaveMode() leaves whichever is open and
  // returns true if one was; keyActions.pick / .find start them.
  leaveMode: null,
  keyActions: null,
  presentationMode: null,
  theme: null,
  resolvedTheme: 'light',
  darkMediaQuery: null,
  currentUser: null,
  _initialDock: null,
  position: null,
  labelCss: null,
  shadowHost: null,
  shadowRoot: null,
  // Mounted: the host and label stylesheet have been added to the page.
  mounted: false,
  // Per-element records (records.js).
  records: new WeakMap(),
  // StadiaRef's own nodes it has removed itself (records.js removeOwn).
  selfRemoved: new WeakSet(),
  shadowCss: null,
  toolbar: null,
  toast: null,
  toastTimer: null,
  visibilityRecheckScheduled: false,
  treeOpen: false,
  treeJumpTimer: null,
  // Frames drawn over page elements (highlight.js).
  highlights: null,
  highlightTracking: false,
  treePanel: null,
  activeRefTreeOpen: false,
  activeRefTreePinned: false,
  activeRefTreeHideTimer: null,
  activeRefTree: null,
  htmlClassObserver: null,
  // Watching the page (watch.js): the one observer, the work gathered for
  // the next frame, and whether the navigation listeners are attached.
  watch: true,
  observer: null,
  pendingWork: null,
  workScheduled: false,
  navListening: false,
  // The host modal StadiaRef is narrowed to and its status line (dialogs.js).
  scopeModal: null,
  dialogStatus: null,
  // Docking (dock.js): extra offsets from config, per side.
  dockOffset: null,
  // Pointer seen last, for touch Pick (pick.js).
  lastPointerType: null,
  finePointerSeen: false,
  pickSheet: null,
  // Host (host.js, panel.js): 'astro' while Astro's Dev Toolbar draws the
  // controls, the panel there, and what to run after each survey.
  hostMode: null,
  panel: null,
  afterSurvey: null,
};
