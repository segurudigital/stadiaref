import { emitAddressEvent } from './events.js';
import { showToast } from './toast.js';

// ─── Copying an address ──────────────────────────────────────
// Resolves true when the address reached the clipboard. The async clipboard
// API is tried first; browsers block it on pages that aren't served
// securely, so the older execCommand path is the fallback. Either way the
// toast says what happened.
export function copyRef(value) {
  function fallback() {
    var ok = fallbackCopyRef(value);
    showToast(value, ok);
    return ok;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      return navigator.clipboard.writeText(value).then(function () {
        showToast(value, true);
        return true;
      }, fallback);
    } catch (e) {
      return Promise.resolve(fallback());
    }
  }
  return Promise.resolve(fallback());
}

export function fallbackCopyRef(value) {
  var temp = document.createElement('textarea');
  var active = document.activeElement;
  temp.value = value;
  temp.setAttribute('readonly', '');
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(temp);
  if (active && active.focus) { try { active.focus(); } catch (e) { /* ignore */ } }
  return !!ok;
}

// Copy an address someone chose, then fire stadiaref:address-click with
// where the click came from and whether the copy worked. The toast shows
// before the event fires.
export function copyAddress(el, address, current, source) {
  return copyRef(address).then(function (copied) {
    emitAddressEvent('click', el, address, current, { source: source, copied: copied });
    return copied;
  });
}
