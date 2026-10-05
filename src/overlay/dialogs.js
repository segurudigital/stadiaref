import { S } from './state.js';
import { forEachNode } from './dom.js';
import { hasRecord, rec } from './records.js';

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

// ─── Narrowing to an open modal ─────────────────────────────
// While a host modal is open, only the labels inside it show, a status line
// says how many there are, and the StadiaRef host is moved to the end of
// the modal: a <dialog> opened with showModal() makes the rest of the page
// inert, and a focus trap does much the same, so a toolbar left on <body>
// couldn't be clicked or typed into. When the modal closes the host goes
// back to <body>. If the move fails, the keys still work.

var OUTSIDE = 'stadiaref-ref-outside';

function labelNodes(el) {
  var r = rec(el);
  return [r.icon, r.tooltip, r.fullLabel, r.link, r.clusterBadge, r.groupBadge, r.host];
}

function markOutside(modal) {
  forEachNode(document.querySelectorAll('[data-ref]'), function (el) {
    if (!hasRecord(el)) return;
    var outside = !!modal && el !== modal && !modal.contains(el);
    var nodes = labelNodes(el);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n || !n.classList) continue;
      if (n.classList.contains(OUTSIDE) !== outside) n.classList.toggle(OUTSIDE, outside);
    }
  });
}

function placeHost(parent) {
  if (!S.shadowHost || S.shadowHost.parentNode === parent) return;
  try { parent.appendChild(S.shadowHost); } catch (e) { /* the keys still work */ }
}

function statusLine() {
  if (S.dialogStatus) return S.dialogStatus;
  var line = document.createElement('div');
  line.className = 'stadiaref-dialog-status';
  line.setAttribute('role', 'status');
  line.hidden = true;
  S.shadowRoot.appendChild(line);
  S.dialogStatus = line;
  return line;
}

export function countInside(modal) {
  return modal.querySelectorAll('[data-ref]').length + (modal.hasAttribute('data-ref') ? 1 : 0);
}

// Bring the narrowing in line with the modals open now. Called after every
// survey and whenever the watcher sees something that could open or close a
// dialog.
export function applyDialogScope() {
  if (!S.mounted) return;
  var modal = S.presentationMode ? null : openHostModal();
  var line = statusLine();
  if (modal) {
    var n = countInside(modal);
    var text = 'Dialog opened. Showing the ' + n + ' address' + (n === 1 ? '' : 'es') + ' inside it.';
    if (line.textContent !== text) line.textContent = text;
    line.hidden = false;
    if (S.scopeModal !== modal) S.scopeModal = modal;
    placeHost(modal);
  } else {
    line.hidden = true;
    if (S.scopeModal) {
      S.scopeModal = null;
      if (document.body) placeHost(document.body);
    }
  }
  markOutside(modal);
}
