import { S } from './state.js';

export function showToast(text) {
  S.toast.textContent = 'Copied: ' + text;
  S.toast.classList.add('stadiaref-toast--visible');
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(function () {
    S.toast.classList.remove('stadiaref-toast--visible');
  }, 1800);
}
