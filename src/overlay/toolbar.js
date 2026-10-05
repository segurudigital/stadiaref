import { S } from './state.js';
import { forEachNode, setClassState } from './dom.js';

// ─── Dropdown helpers ────────────────────────────────────────
export function closeAllDropdowns() {
  var menus = S.toolbar.querySelectorAll('.stadiaref-toolbar__dropdown');
  forEachNode(menus, function (m) { m.classList.remove('stadiaref-toolbar__dropdown--open'); });
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-toggle]'), function (trigger) {
    trigger.classList.remove('stadiaref-toolbar__select--open');
  });
}

export function toggleDropdown(name) {
  var menu = S.toolbar.querySelector('[data-stadiaref-menu="' + name + '"]');
  var trigger = S.toolbar.querySelector('[data-stadiaref-toggle="' + name + '"]');
  var isOpen = menu.classList.contains('stadiaref-toolbar__dropdown--open');
  closeAllDropdowns();
  if (isOpen) return;

  menu.style.top = 'auto';
  menu.style.bottom = 'auto';
  menu.style.left = 'auto';
  menu.style.right = 'auto';
  menu.classList.add('stadiaref-toolbar__dropdown--open');
  if (trigger) trigger.classList.add('stadiaref-toolbar__select--open');

  var groupRect = menu.parentElement.getBoundingClientRect();
  var menuRect = menu.getBoundingClientRect();
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  if (groupRect.top > vh - groupRect.bottom) {
    menu.style.bottom = 'calc(100% + 6px)';
  } else {
    menu.style.top = 'calc(100% + 6px)';
  }

  if (groupRect.left + menuRect.width > vw) {
    menu.style.right = '0';
  } else {
    menu.style.left = '0';
  }
}

export function shouldTriggerAppearActive(name, activeValue) {
  if (name === 'mode') return String(activeValue) !== '1';
  if (name === 'depth') return String(activeValue) !== 'off';
  if (name === 'outline') return String(activeValue) !== 'off';
  if (name === 'level') return String(activeValue) !== 'all';
  return false;
}

export function updateDropdown(name, activeAttr, activeValue, label) {
  var trigger = S.toolbar.querySelector('[data-stadiaref-toggle="' + name + '"]');
  var valueNode = trigger.querySelector('.stadiaref-toolbar__value');
  if (valueNode) valueNode.textContent = label;
  setClassState(trigger, 'stadiaref-toolbar__select--active', shouldTriggerAppearActive(name, activeValue));

  var opts = S.toolbar.querySelectorAll('[data-stadiaref-menu="' + name + '"] .stadiaref-toolbar__option');
  forEachNode(opts, function (opt) {
    setClassState(opt, 'stadiaref-toolbar__option--active', opt.getAttribute(activeAttr) === String(activeValue));
  });

  closeAllDropdowns();
}


// ─── Hotkey + dock helpers ──────────────────────────────────
export function updateModeHint() {
  if (!S.toolbar) return;
  var hint = S.toolbar.querySelector('[data-stadiaref-mode-hint]');
  if (!hint) return;
  hint.textContent = S.hotkey
    ? ('Press L to cycle · ' + S.hotkey + ' to hide all')
    : 'Press L to cycle';
}
