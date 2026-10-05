import { S } from './state.js';
import { MODE_LABELS } from './constants.js';
import { resolveLabelOverlaps } from './labels.js';
import { updateDropdown } from './toolbar.js';

// ─── State management ───────────────────────────────────────
export function setState(newState) {
  S.state = newState;
  document.body.classList.remove('sdt-hide', 'sdt-full');

  if (S.state === 1) {
    document.body.classList.add('sdt-hide');
  } else if (S.state === 2) {
    document.body.classList.add('sdt-full');
  }

  updateDropdown('mode', 'data-sdt-state', S.state, MODE_LABELS[S.state]);
  resolveLabelOverlaps();
}
