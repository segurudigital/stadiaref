import { S } from './state.js';
import { persistTheme } from './config.js';
import { setClassState } from './dom.js';
import { emitEvent } from './events.js';

// ─── Theme management ───────────────────────────────────────
// 'auto' follows OS preference + the host's `html.dark` class. 'light' /
// 'dark' pin explicitly. The resolved theme drives the `stadiaref-theme-dark`
// class on the shadow host, which the CSS reads via `:host(.stadiaref-theme-dark)`.
export function detectAutoTheme() {
  if (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  if (window.matchMedia) {
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) { /* IE/Safari edge */ }
  }
  return 'light';
}

export function applyTheme() {
  var next = (S.theme === 'light' || S.theme === 'dark') ? S.theme : detectAutoTheme();
  setClassState(S.shadowHost, 'stadiaref-theme-dark', next === 'dark');
  var prev = S.resolvedTheme;
  S.resolvedTheme = next;
  if (prev !== next) emitEvent('theme-change', { theme: next, mode: S.theme });
}

export function setupThemeMediaListener() {
  if (S.darkMediaQuery || !window.matchMedia) return;
  try {
    S.darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  } catch (e) { S.darkMediaQuery = null; return; }
  var handler = function () { if (S.theme === 'auto') applyTheme(); };
  if (S.darkMediaQuery.addEventListener) S.darkMediaQuery.addEventListener('change', handler);
  else if (S.darkMediaQuery.addListener) S.darkMediaQuery.addListener(handler);
}
export function setupHtmlClassObserver() {
  if (S.htmlClassObserver || typeof MutationObserver === 'undefined') return;
  if (!document.documentElement) return;
  try {
    S.htmlClassObserver = new MutationObserver(function () {
      if (S.theme === 'auto') applyTheme();
    });
    S.htmlClassObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  } catch (e) { S.htmlClassObserver = null; }
}

export function setTheme(value) {
  if (value !== 'auto' && value !== 'light' && value !== 'dark') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setTheme expected "auto" | "light" | "dark", got', value);
    }
    return;
  }
  S.theme = value;
  persistTheme(value);
  applyTheme();
  setupThemeMediaListener();
}

export function getTheme() { return S.resolvedTheme; }
