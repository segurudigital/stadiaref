import { showToast } from './toast.js';

// ─── Clipboard helper ───────────────────────────────────────
export function copyRef(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(function () {
      showToast(value);
    }, function () {
      fallbackCopyRef(value);
    });
  } else {
    fallbackCopyRef(value);
  }
}

export function fallbackCopyRef(value) {
  var temp = document.createElement('textarea');
  temp.value = value;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  showToast(value);
}
