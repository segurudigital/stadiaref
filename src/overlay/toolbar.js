import { S } from './state.js';
import { ICON_SVG, LOGOTYPE_SVG } from './brand.js';
import { MODE_LABELS, OUTLINE_LABELS, VERSION } from './constants.js';
import { forEachNode, setClassState } from './dom.js';
import { showText, tierShown } from './tiers.js';

// ─── Toolbar markup ──────────────────────────────────────────
// Order: brand, reviewer pill, Labels, Show, AUTO chip, Pick, Find, a
// divider, Outline, Tree (Toolbar.dc.html).
var SHOW_ROWS = [
  { tier: 'section', name: 'Sections', note: 'top-level sections' },
  { tier: 'block', name: 'Blocks', note: 'containers inside a section' },
  { tier: 'element', name: 'Elements', note: 'headings, text, images, buttons' }
];
var LABEL_ROWS = [
  { state: 2, name: 'Full', note: 'every address shown' },
  { state: 0, name: 'Icons', note: 'a dot, hover to read' },
  { state: 1, name: 'Off', note: 'clean page' }
];
var OUTLINE_ROWS = [
  { mode: 'block', name: 'Blocks', note: 'sections plus inner containers' },
  { mode: 'section', name: 'Sections', note: 'top-level wrappers only' },
  { mode: 'off', name: 'Off', note: 'no guides' }
];
var PICK_SVG = '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="7"></circle><path d="M12 2v5"></path><path d="M12 17v5"></path><path d="M2 12h5"></path><path d="M17 12h5"></path></svg>';
var FIND_SVG = '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l5 5"></path></svg>';
var TREE_SVG = '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7"></path><path d="M8 12h12"></path><path d="M8 19h12"></path><path d="M5 5v14h3"></path></svg>';

function option(attr, value, name, note, role, on) {
  return '<button type="button" role="' + role + '" aria-checked="' + (on ? 'true' : 'false') + '" class="stadiaref-toolbar__option' + (on ? ' stadiaref-toolbar__option--active' : '') + '" ' + attr + '="' + value + '">' +
    '<span class="stadiaref-toolbar__option-dot" aria-hidden="true"></span>' +
    '<span>' + name + '</span>' +
    '<span class="stadiaref-toolbar__note">' + note + '</span>' +
  '</button>';
}

function menuTrigger(name, longKey, shortKey, value, extraClass, dot) {
  return '<button type="button" class="stadiaref-toolbar__select' + (extraClass || '') + '" data-stadiaref-toggle="' + name + '" aria-haspopup="menu" aria-expanded="false" aria-controls="stadiaref-menu-' + name + '">' +
    (dot ? '<span class="stadiaref-toolbar__dot" aria-hidden="true"></span>' : '') +
    '<span class="stadiaref-toolbar__key stadiaref-toolbar__key--long">' + longKey + '</span>' +
    '<span class="stadiaref-toolbar__key stadiaref-toolbar__key--short" data-stadiaref-short="' + name + '" aria-hidden="true">' + shortKey + '</span>' +
    '<span class="stadiaref-toolbar__value">' + value + '</span>' +
    '<span class="stadiaref-toolbar__caret" aria-hidden="true">&#9662;</span>' +
  '</button>';
}

export function toolbarHtml() {
  var labelRows = '';
  for (var i = 0; i < LABEL_ROWS.length; i++) {
    labelRows += option('data-stadiaref-state', LABEL_ROWS[i].state, LABEL_ROWS[i].name, LABEL_ROWS[i].note, 'menuitemradio', S.state === LABEL_ROWS[i].state);
  }
  var showRows = '';
  for (var j = 0; j < SHOW_ROWS.length; j++) {
    var r = SHOW_ROWS[j];
    showRows +=
      '<button type="button" class="stadiaref-toolbar__option stadiaref-toolbar__check" role="menuitemcheckbox" aria-checked="false" data-stadiaref-tier="' + r.tier + '">' +
        '<span class="stadiaref-toolbar__tick" aria-hidden="true"></span>' +
        '<span class="stadiaref-toolbar__check-name">' + r.name + '</span>' +
        '<span class="stadiaref-toolbar__note">' + r.note + '</span>' +
      '</button>';
  }
  var outlineRows = '';
  for (var k = 0; k < OUTLINE_ROWS.length; k++) {
    outlineRows += option('data-stadiaref-outline', OUTLINE_ROWS[k].mode, OUTLINE_ROWS[k].name, OUTLINE_ROWS[k].note, 'menuitemradio', S.outlineMode === OUTLINE_ROWS[k].mode);
  }
  return '' +
    // ── Brand: permanent ──
    '<a class="stadiaref-brand" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="StadiaRef by Seguru Digital">' +
      ICON_SVG + LOGOTYPE_SVG +
      '<span class="stadiaref-brand__tip" aria-hidden="true">StadiaRef ' + VERSION + ' by Seguru Digital</span>' +
    '</a>' +
    '<div class="stadiaref-toolbar__user" data-stadiaref-user-pill role="status">' +
      '<span class="stadiaref-toolbar__user-avatar" data-stadiaref-user-avatar aria-hidden="true"></span>' +
      '<span class="stadiaref-toolbar__user-name" data-stadiaref-user-name></span>' +
      '<span class="stadiaref-toolbar__user-role" data-stadiaref-user-role></span>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--primary">' +
      // ── Labels ──
      '<div class="stadiaref-toolbar__group" data-stadiaref-group="mode">' +
        menuTrigger('mode', 'Labels', 'L', MODE_LABELS[S.state] || 'Full', S.state !== 1 ? ' stadiaref-toolbar__select--active' : '') +
        '<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-mode" data-stadiaref-menu="mode" role="menu" aria-label="Labels">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-mode-hint>Press L to cycle</div>' +
          labelRows +
        '</div>' +
      '</div>' +
      // ── Show ──
      '<div class="stadiaref-toolbar__group" data-stadiaref-group="show">' +
        menuTrigger('show', 'Show', 'Show', showText(), '') +
        '<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-show" data-stadiaref-menu="show" role="menu" aria-label="Show">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-show-hint>Tick any mix. Keys 1, 2 and 3</div>' +
          showRows +
        '</div>' +
      '</div>' +
      // ── AUTO chip: only while auto-address is on ──
      '<span class="stadiaref-toolbar__auto" data-stadiaref-auto-chip role="status" aria-label="Auto-address is on" hidden>AUTO</span>' +
      // ── Pick and Find ──
      '<button type="button" class="stadiaref-toolbar__select" data-stadiaref-pick aria-pressed="false">' + PICK_SVG + '<span>Pick</span></button>' +
      '<button type="button" class="stadiaref-toolbar__select" data-stadiaref-find aria-pressed="false">' + FIND_SVG + '<span>Find</span></button>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--utility">' +
      // ── Outline ──
      '<div class="stadiaref-toolbar__group" data-stadiaref-group="outline">' +
        menuTrigger('outline', 'Outline', 'O', OUTLINE_LABELS[S.outlineMode] || 'Off', ' stadiaref-toolbar__select--utility' + (S.outlineMode !== 'off' ? ' stadiaref-toolbar__select--active' : ''), true) +
        '<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-outline" data-stadiaref-menu="outline" role="menu" aria-label="Outline">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-outline-hint>Press O to cycle</div>' +
          outlineRows +
        '</div>' +
      '</div>' +
      // ── Tree ──
      '<button type="button" class="stadiaref-toolbar__select stadiaref-toolbar__select--utility" data-stadiaref-toggle-tree aria-pressed="false">' +
        '<span class="stadiaref-toolbar__dot" aria-hidden="true"></span>' + TREE_SVG + '<span>Tree</span>' +
      '</button>' +
    '</div>';
}

// ─── Dropdown helpers ────────────────────────────────────────
export function closeAllDropdowns() {
  var menus = S.toolbar.querySelectorAll('.stadiaref-toolbar__dropdown');
  forEachNode(menus, function (m) { m.classList.remove('stadiaref-toolbar__dropdown--open'); });
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-toggle]'), function (trigger) {
    trigger.classList.remove('stadiaref-toolbar__select--open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

// Opened from the keyboard, focus moves to the first item; the arrow keys
// then move through the menu (attachMenuKeys).
export function toggleDropdown(name, fromKeyboard) {
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
  if (trigger) {
    trigger.classList.add('stadiaref-toolbar__select--open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  var groupRect = menu.parentElement.getBoundingClientRect();
  var menuRect = menu.getBoundingClientRect();
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  if (groupRect.top > vh - groupRect.bottom) {
    menu.style.bottom = 'calc(100% + 8px)';
  } else {
    menu.style.top = 'calc(100% + 8px)';
  }

  if (groupRect.left + menuRect.width > vw) {
    menu.style.right = '0';
  } else {
    menu.style.left = '0';
  }

  if (fromKeyboard) {
    var first = menu.querySelector('[role^="menuitem"]');
    if (first) first.focus();
  }
}

// Up and down arrows move through an open menu's items.
export function attachMenuKeys() {
  S.toolbar.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var menu = e.target.closest && e.target.closest('.stadiaref-toolbar__dropdown');
    if (!menu) return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('[role^="menuitem"]'));
    var at = items.indexOf(e.target);
    if (at === -1) return;
    e.preventDefault();
    var next = e.key === 'ArrowDown' ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
    items[next].focus();
  });
}

export function shouldTriggerAppearActive(name, activeValue) {
  if (name === 'mode') return String(activeValue) !== '1';
  if (name === 'outline') return String(activeValue) !== 'off';
  return false;
}

export function updateDropdown(name, activeAttr, activeValue, label) {
  var trigger = S.toolbar.querySelector('[data-stadiaref-toggle="' + name + '"]');
  var valueNode = trigger.querySelector('.stadiaref-toolbar__value');
  if (valueNode) valueNode.textContent = label;
  setClassState(trigger, 'stadiaref-toolbar__select--active', shouldTriggerAppearActive(name, activeValue));

  var opts = S.toolbar.querySelectorAll('[data-stadiaref-menu="' + name + '"] .stadiaref-toolbar__option');
  forEachNode(opts, function (opt) {
    var on = opt.getAttribute(activeAttr) === String(activeValue);
    setClassState(opt, 'stadiaref-toolbar__option--active', on);
    opt.setAttribute('aria-checked', on ? 'true' : 'false');
  });

  closeAllDropdowns();
}


// ─── Show control ────────────────────────────────────────────
// The button reads All, Sec + Blk, None, …, and takes the active wash
// whenever a tier is hidden. The menu stays open while you tick.
export function updateShowControl() {
  if (!S.toolbar) return;
  var trigger = S.toolbar.querySelector('[data-stadiaref-toggle="show"]');
  if (!trigger) return;
  trigger.querySelector('.stadiaref-toolbar__value').textContent = showText();
  setClassState(trigger, 'stadiaref-toolbar__select--active', !(S.tiers.section && S.tiers.block && S.tiers.element));
  forEachNode(S.toolbar.querySelectorAll('[data-stadiaref-tier]'), function (row) {
    var on = tierShown(row.getAttribute('data-stadiaref-tier'));
    row.setAttribute('aria-checked', on ? 'true' : 'false');
    setClassState(row, 'stadiaref-toolbar__option--active', on);
    row.querySelector('.stadiaref-toolbar__tick').textContent = on ? '\u2713' : '';
  });
}

// ─── AUTO chip ───────────────────────────────────────────────
export function updateAutoChip() {
  if (!S.toolbar) return;
  var chip = S.toolbar.querySelector('[data-stadiaref-auto-chip]');
  if (chip) chip.hidden = !S.autoRefEnabled;
}

// ─── Key hints in the menus ──────────────────────────────────
function keyName(k) {
  return k === false ? null : (k.length === 1 ? k.toUpperCase() : k);
}

export function updateKeyHints() {
  if (!S.toolbar || !S.keys) return;
  var k = S.keys;
  var labels = S.toolbar.querySelector('[data-stadiaref-mode-hint]');
  if (labels) {
    var parts = [];
    if (keyName(k.labels)) parts.push('Press ' + keyName(k.labels) + ' to cycle');
    if (keyName(k.toggle)) parts.push(keyName(k.toggle) + ' to hide all');
    labels.textContent = parts.join(' · ');
    labels.hidden = !parts.length;
  }
  var show = S.toolbar.querySelector('[data-stadiaref-show-hint]');
  if (show) {
    var tierKeys = [k.section, k.block, k.element].map(keyName).filter(Boolean);
    show.textContent = 'Tick any mix.' + (tierKeys.length ? ' Keys ' + tierKeys.slice(0, -1).join(', ') + (tierKeys.length > 1 ? ' and ' : '') + tierKeys[tierKeys.length - 1] : '');
  }
  var shortL = S.toolbar.querySelector('[data-stadiaref-short="mode"]');
  if (shortL) shortL.textContent = keyName(k.labels) || 'Labels';
  var shortO = S.toolbar.querySelector('[data-stadiaref-short="outline"]');
  if (shortO) shortO.textContent = keyName(k.outline) || 'Outline';
  var outline = S.toolbar.querySelector('[data-stadiaref-outline-hint]');
  if (outline) {
    outline.textContent = keyName(k.outline) ? 'Press ' + keyName(k.outline) + ' to cycle' : '';
    outline.hidden = !keyName(k.outline);
  }
}
