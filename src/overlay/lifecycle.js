import { S } from './state.js';
import { dismissActiveRefTree } from './chain.js';
import { setClassState } from './dom.js';
import { emitEvent } from './events.js';
import { closeAllDropdowns } from './toolbar.js';
import { toggleTree } from './tree.js';

// ─── Lifecycle (hide / show / toggle) ───────────────────────
// hide()/show()/toggle() are the canonical visibility API. They're idempotent,
// safe to call before SDT has booted (the desired state is applied during
// init), and they fire sdt:show / sdt:hide events.
export function applyVisibility() {
  if (!document.body) return; // init() will re-apply once body exists
  S.shadowHost.style.display = S.presentationMode ? 'none' : '';
  setClassState(document.body, 'sdt-presentation', S.presentationMode);
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
