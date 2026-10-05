import { S } from './state.js';
import { S_MARK_SVG } from './brand.js';
import { MODE_LABELS, OUTLINE_LABELS } from './constants.js';
import { forEachNode, setClassState } from './dom.js';
import { showText, tierShown } from './tiers.js';

// ─── Toolbar markup ──────────────────────────────────────────
// Order: brand, user pill, Labels, Show, AUTO chip, | Outline, Tree.
var SHOW_ROWS = [
  { tier: 'section', name: 'Sections', note: 'top-level sections' },
  { tier: 'block', name: 'Blocks', note: 'containers inside a section' },
  { tier: 'element', name: 'Elements', note: 'headings, text, images, buttons' }
];

export function toolbarHtml() {
  var showRows = '';
  for (var i = 0; i < SHOW_ROWS.length; i++) {
    var r = SHOW_ROWS[i];
    showRows +=
      '<button type="button" class="stadiaref-toolbar__option stadiaref-toolbar__check" role="menuitemcheckbox" aria-checked="false" data-stadiaref-tier="' + r.tier + '">' +
        '<span class="stadiaref-toolbar__tick" aria-hidden="true"></span>' +
        '<span class="stadiaref-toolbar__check-name">' + r.name + '</span>' +
        '<span class="stadiaref-toolbar__note">' + r.note + '</span>' +
      '</button>';
  }
  return '' +
    '<a class="stadiaref-toolbar__badge" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="Powered by Seguru Digital">' +
      S_MARK_SVG +
      '<span class="stadiaref-toolbar__badge-tip">Powered by Seguru Digital</span>' +
    '</a>' +
    '<div class="stadiaref-toolbar__user" data-stadiaref-user-pill role="status">' +
      '<span class="stadiaref-toolbar__user-avatar" data-stadiaref-user-avatar aria-hidden="true"></span>' +
      '<span class="stadiaref-toolbar__user-name" data-stadiaref-user-name></span>' +
      '<span class="stadiaref-toolbar__user-role" data-stadiaref-user-role></span>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--primary">' +
      // ── Labels ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--primary" data-stadiaref-group="mode">' +
        '<button class="stadiaref-toolbar__select' + (S.state !== 1 ? ' stadiaref-toolbar__select--active' : '') + '" data-stadiaref-toggle="mode">' +
          '<span class="stadiaref-toolbar__key">Labels</span>' +
          '<span class="stadiaref-toolbar__value">' + (MODE_LABELS[S.state] || 'Icons') + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="mode">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-mode-hint>Press L to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 2 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="2">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Full' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 0 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="0">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Icons' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.state === 1 ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-state="1">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Off' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Show ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--primary" data-stadiaref-group="show">' +
        '<button class="stadiaref-toolbar__select" data-stadiaref-toggle="show">' +
          '<span class="stadiaref-toolbar__key">Show</span>' +
          '<span class="stadiaref-toolbar__value">' + showText() + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="show" role="menu">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-show-hint>Tick any mix. Keys 1, 2 and 3</div>' +
          showRows +
        '</div>' +
      '</div>' +
      // ── AUTO chip: only while auto-address is on ──
      '<span class="stadiaref-toolbar__auto" data-stadiaref-auto-chip role="status" aria-label="Auto-address is on" hidden>AUTO</span>' +
    '</div>' +
    '<div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--utility">' +
      // ── Outline ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--utility" data-stadiaref-group="outline">' +
        '<button class="stadiaref-toolbar__select stadiaref-toolbar__select--utility stadiaref-toolbar__select--diagnostic' + (S.outlineMode !== 'off' ? ' stadiaref-toolbar__select--active' : '') + '" data-stadiaref-toggle="outline">' +
          '<span class="stadiaref-toolbar__key">Outline</span>' +
          '<span class="stadiaref-toolbar__value">' + (OUTLINE_LABELS[S.outlineMode] || 'Off') + '</span>' +
          '<span class="stadiaref-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="stadiaref-toolbar__dropdown" data-stadiaref-menu="outline">' +
          '<div class="stadiaref-toolbar__hint" data-stadiaref-outline-hint>Press O to cycle</div>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'block' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="block">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Blocks — sections plus inner containers' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'section' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="section">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Sections — top-level wrappers only' +
          '</button>' +
          '<button class="stadiaref-toolbar__option' + (S.outlineMode === 'off' ? ' stadiaref-toolbar__option--active' : '') + '" data-stadiaref-outline="off">' +
            '<span class="stadiaref-toolbar__option-dot"></span> Off — no spacing guides' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Tree toggle ──
      '<div class="stadiaref-toolbar__group stadiaref-toolbar__group--tree stadiaref-toolbar__group--utility" data-stadiaref-group="tree">' +
        '<button class="stadiaref-toolbar__select stadiaref-toolbar__select--utility stadiaref-toolbar__select--diagnostic" data-stadiaref-toggle-tree>' +
          '<span class="stadiaref-toolbar__value">\u229E Tree</span>' +
        '</button>' +
      '</div>' +
    '</div>';
}

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
    setClassState(opt, 'stadiaref-toolbar__option--active', opt.getAttribute(activeAttr) === String(activeValue));
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
  var outline = S.toolbar.querySelector('[data-stadiaref-outline-hint]');
  if (outline) {
    outline.textContent = keyName(k.outline) ? 'Press ' + keyName(k.outline) + ' to cycle' : '';
    outline.hidden = !keyName(k.outline);
  }
}
