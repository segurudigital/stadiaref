import { S } from './state.js';

// The toast is a status: assistive technology reads what was copied.
export function showToast(text, copied) {
  S.toast.setAttribute('role', 'status');
  S.toast.textContent = (copied === false ? 'Could not copy: ' : 'Copied: ') + text;
  S.toast.classList.add('stadiaref-toast--visible');
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(function () {
    S.toast.classList.remove('stadiaref-toast--visible');
  }, 1800);
}
