import { S } from './state.js';
import { dismissActiveRefTree } from './chain.js';
import { goHidden, goLive } from './mount.js';
import { emitEvent } from './events.js';
import { closeAllDropdowns } from './toolbar.js';
import { toggleTree } from './tree.js';

// ─── Lifecycle (hide / show / toggle) ───────────────────────
// hide()/show()/toggle() are the canonical visibility API. They're idempotent,
// queued when called before start (see queueable() in api.js), and they
// fire stadiaref:show / stadiaref:hide.
export function applyVisibility() {
  if (S.presentationMode) goHidden();
  else goLive();
}

export function hide() {
  if (S.presentationMode) return; // already hidden, no-op
  // Global hide — close every secondary surface so a single hide() (or Esc)
  // returns the page to a clean state.
  closeAllDropdowns();
  if (S.treeOpen) toggleTree();
  dismissActiveRefTree();
  S.presentationMode = true;
  applyVisibility();
  emitEvent('hide', {});
}

export function show() {
  if (!S.presentationMode) return; // already visible, no-op
  S.presentationMode = false;
  applyVisibility();
  emitEvent('show', {});
}

export function toggleVisibility() {
  if (S.presentationMode) show(); else hide();
}
