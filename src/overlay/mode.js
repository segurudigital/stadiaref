import { S } from './state.js';
import { MODE_LABELS } from './constants.js';
import { emitEvent } from './events.js';
import { resolveLabelOverlaps } from './labels.js';
import { updateDropdown } from './toolbar.js';

// Label modes. Internally a number, as in 2.x: 0 icons, 1 off, 2 full.
export const LABEL_MODES = { icons: 0, off: 1, full: 2 };
export const LABEL_NAMES = { 0: 'icons', 1: 'off', 2: 'full' };

// ─── State management ───────────────────────────────────────
// setState() applies a mode and announces it; applyState() only applies it
// (used at start, where nothing has changed yet).
export function setState(newState) {
  applyState(newState);
  emitEvent('labels-change', { labels: getLabels() });
}

export function applyState(newState) {
  S.state = newState;
  document.body.classList.remove('stadiaref-hide', 'stadiaref-full');

  if (S.state === 1) {
    document.body.classList.add('stadiaref-hide');
  } else if (S.state === 2) {
    document.body.classList.add('stadiaref-full');
  }

  updateDropdown('mode', 'data-stadiaref-state', S.state, MODE_LABELS[S.state]);
  resolveLabelOverlaps();
}

export function setLabels(mode) {
  if (!Object.prototype.hasOwnProperty.call(LABEL_MODES, mode)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setLabels expected "full" | "icons" | "off", got', mode);
    }
    return;
  }
  setState(LABEL_MODES[mode]);
}

export function getLabels() {
  return LABEL_NAMES[S.state] || 'full';
}
