import { S } from './state.js';

export function showToast(text) {
  S.toast.textContent = 'Copied: ' + text;
  S.toast.classList.add('sdt-toast--visible');
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(function () {
    S.toast.classList.remove('sdt-toast--visible');
  }, 1800);
}
