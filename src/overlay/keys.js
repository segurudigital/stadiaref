import { S } from './state.js';
import { normalizeHotkey } from './config.js';
import { hide, toggleVisibility } from './lifecycle.js';
import { setState } from './mode.js';
import { setOutline } from './outline.js';
import { DEPTH_CYCLE, LEVEL_FILTER_CYCLE, setDepth, setLevelFilter } from './tiers.js';
import { updateModeHint } from './toolbar.js';

export function setHotkey(value) {
  S.hotkey = normalizeHotkey(value);
  updateModeHint();
}

// Keyboard shortcuts. Attached once from init().
export function attachKeys() {
  function isTypingTarget(target) {
    if (!target) return false;
    var tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
  }
  function hasModifier(e) {
    return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
  }

  document.addEventListener('keydown', function (e) {
    // Esc — global one-shot hide. hide() itself closes any open dropdown +
    // Tree panel + dismisses the toolbar, so a single Esc clears the whole
    // surface. Skipped while typing or when modifiers are held so it doesn't
    // compete with form / IME / app-level shortcuts.
    if (e.key === 'Escape') {
      if (isTypingTarget(e.target) || hasModifier(e)) return;
      if (!S.presentationMode) hide();
      return;
    }

    if (isTypingTarget(e.target)) return;
    if (hasModifier(e)) return;

    // Visibility hotkey (configurable, default D). Takes priority over the
    // fixed L / T / O cycle keys so a host that rebinds to one of those
    // letters consistently dismisses instead of doing both.
    if (S.hotkey && typeof e.key === 'string' && e.key.length === 1 && e.key.toUpperCase() === S.hotkey) {
      toggleVisibility();
      return;
    }

    // L — cycle Labels mode (Off → Icons → Full)
    if (e.key === 'l' || e.key === 'L') {
      var MODE_CYCLE = [1, 0, 2];
      var nextMode = MODE_CYCLE[(MODE_CYCLE.indexOf(S.state) + 1) % MODE_CYCLE.length];
      setState(nextMode);
      return;
    }

    // T — cycle Target / Depth (Off → Sections → Blocks → Elements → All)
    if (e.key === 't' || e.key === 'T') {
      var depthIdx = S.autoRefEnabled ? DEPTH_CYCLE.indexOf(S.autoRefDepth) : 0;
      var nextDepthIdx = (depthIdx + 1) % DEPTH_CYCLE.length;
      setDepth(DEPTH_CYCLE[nextDepthIdx]);
      return;
    }

    // O — cycle Outline (Off → Sections → Blocks)
    if (e.key === 'o' || e.key === 'O') {
      var OUTLINE_CYCLE = ['off', 'section', 'block'];
      var oIdx = OUTLINE_CYCLE.indexOf(S.outlineMode);
      if (oIdx < 0) oIdx = 0;
      setOutline(OUTLINE_CYCLE[(oIdx + 1) % OUTLINE_CYCLE.length]);
      return;
    }

    // F — cycle Level filter (All → Sec+Blk → Sections)
    if (e.key === 'f' || e.key === 'F') {
      var fIdx = LEVEL_FILTER_CYCLE.indexOf(S.levelFilter);
      if (fIdx < 0) fIdx = 0;
      setLevelFilter(LEVEL_FILTER_CYCLE[(fIdx + 1) % LEVEL_FILTER_CYCLE.length]);
      return;
    }
  });
}
