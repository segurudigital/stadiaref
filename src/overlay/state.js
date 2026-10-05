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
  shadowCss: null,
  toolbar: null,
  toast: null,
  toastTimer: null,
  visibilityRecheckScheduled: false,
  treeOpen: false,
  treeJumpTimer: null,
  treeJumpTarget: null,
  treePanel: null,
  activeRefTreeOpen: false,
  activeRefTreePinned: false,
  activeRefTreeHideTimer: null,
  activeRefTree: null,
  htmlClassObserver: null,
};
