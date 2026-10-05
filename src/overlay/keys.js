import { S } from './state.js';
import { isHostModalOpen } from './dialogs.js';
import { hide, toggleVisibility } from './lifecycle.js';
import { setState } from './mode.js';
import { setOutline } from './outline.js';
import { toggleTier } from './tiers.js';
import { updateKeyHints } from './toolbar.js';

// ─── Keymap ─────────────────────────────────────────────────
// Every action can be rebound or turned off with false. Bindings match
// event.key: a single character case-insensitively (so layouts where a
// digit or / needs Shift still work), a named key such as Escape exactly.
export const DEFAULT_KEYS = {
  toggle: 'D',
  labels: 'L',
  section: '1',
  block: '2',
  element: '3',
  pick: 'P',
  find: '/',
  outline: 'O',
  hide: 'Escape'
};

export function defaultKeys() {
  var out = {};
  for (var k in DEFAULT_KEYS) out[k] = DEFAULT_KEYS[k];
  return out;
}

// Apply a partial keymap on top of the current one. Unknown actions and
// values other than a non-empty string or false are ignored with a warning.
export function mergeKeys(current, partial) {
  var out = {};
  var k;
  for (k in current) out[k] = current[k];
  if (!partial || typeof partial !== 'object') return out;
  for (k in partial) {
    if (!Object.prototype.hasOwnProperty.call(partial, k)) continue;
    var v = partial[k];
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_KEYS, k)) {
      warn('unknown key action "' + k + '"');
      continue;
    }
    if (v === false || (typeof v === 'string' && v.length > 0)) out[k] = v;
    else warn('key "' + k + '" expected a key name or false, got ' + String(v));
  }
  return out;
}

function warn(msg) {
  if (typeof console !== 'undefined' && console.warn) console.warn('[stadiaref] ' + msg);
}

export function setKeys(partial) {
  S.keys = mergeKeys(S.keys, partial);
  updateKeyHints();
}

export function getKeys() {
  return mergeKeys(S.keys, null);
}

function matches(binding, e) {
  if (binding === false || typeof binding !== 'string' || typeof e.key !== 'string') return false;
  if (binding.length === 1) return e.key.length === 1 && e.key.toLowerCase() === binding.toLowerCase();
  return e.key.toLowerCase() === binding.toLowerCase();
}

// The element the key went to. Inside StadiaRef's shadow root event.target
// is retargeted to the host, so read the real one from the composed path.
function keyTarget(e) {
  var path = typeof e.composedPath === 'function' ? e.composedPath() : null;
  return path && path.length ? path[0] : e.target;
}

function isTypingTarget(target) {
  if (!target || target.nodeType !== 1) return false;
  var tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

// Keyboard shortcuts. Attached once from init().
export function attachKeys() {
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(keyTarget(e))) return;
    var k = S.keys;

    // The toggle key takes priority, so a toggle bound to a letter another
    // action uses toggles instead of doing both.
    if (matches(k.toggle, e)) {
      e.preventDefault();
      toggleVisibility();
      return;
    }

    // Esc (hide): leave Pick or Find first; otherwise leave Esc to an open
    // modal dialog of the host page; otherwise close every menu and panel
    // and hide everything in one press.
    if (matches(k.hide, e)) {
      if (S.leaveMode && S.leaveMode()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isHostModalOpen()) return;
      if (!S.presentationMode) {
        e.preventDefault();
        hide();
      }
      return;
    }

    if (matches(k.labels, e)) {
      e.preventDefault();
      // Off → Icons → Full
      var MODE_CYCLE = [1, 0, 2];
      setState(MODE_CYCLE[(MODE_CYCLE.indexOf(S.state) + 1) % MODE_CYCLE.length]);
      return;
    }

    if (matches(k.section, e)) { e.preventDefault(); toggleTier('section'); return; }
    if (matches(k.block, e)) { e.preventDefault(); toggleTier('block'); return; }
    if (matches(k.element, e)) { e.preventDefault(); toggleTier('element'); return; }

    if (matches(k.outline, e)) {
      e.preventDefault();
      // Off → Sections → Blocks
      var OUTLINE_CYCLE = ['off', 'section', 'block'];
      var oIdx = OUTLINE_CYCLE.indexOf(S.outlineMode);
      if (oIdx < 0) oIdx = 0;
      setOutline(OUTLINE_CYCLE[(oIdx + 1) % OUTLINE_CYCLE.length]);
      return;
    }

    if (S.keyActions) {
      if (matches(k.pick, e) && S.keyActions.pick) { e.preventDefault(); S.keyActions.pick(); return; }
      if (matches(k.find, e) && S.keyActions.find) { e.preventDefault(); S.keyActions.find(); return; }
    }
  });
}
