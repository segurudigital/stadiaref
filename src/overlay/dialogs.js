// ─── Host dialogs ───────────────────────────────────────────
// A modal belonging to the host page is open when a <dialog> matches
// :modal, or a visible element has role="dialog" or role="alertdialog"
// together with aria-modal="true".
export function openHostModal() {
  var dialogs = document.querySelectorAll('dialog');
  for (var i = 0; i < dialogs.length; i++) {
    try {
      if (dialogs[i].matches(':modal')) return dialogs[i];
    } catch (e) { /* :modal unsupported */ }
  }
  var aria = document.querySelectorAll('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
  for (var j = 0; j < aria.length; j++) {
    if (aria[j].closest('#stadiaref-host')) continue;
    if (aria[j].getClientRects().length > 0 && getComputedStyle(aria[j]).visibility !== 'hidden') return aria[j];
  }
  return null;
}

export function isHostModalOpen() {
  return !!openHostModal();
}
