import { S } from './state.js';
import { VERSION, FONT_UI } from './constants.js';
import { ICON_SVG, LOGOTYPE_SVG } from './brand.js';
import { applyDockPosition } from './dock.js';
import { closeFind, isFinding, openFind } from './find.js';
import { show } from './lifecycle.js';
import { getLabels, setLabels } from './mode.js';
import { setOutline } from './outline.js';
import { isPicking, togglePick } from './pick.js';
import { getTiers, toggleTier } from './tiers.js';
import { toggleTree } from './tree.js';
import { astroCanvas, toolbarHosted } from './host.js';

// ─── The panel ──────────────────────────────────────────────
// The toolbar's controls laid out as a panel, for a host that has its own
// chrome: Astro's Dev Toolbar. The brand row (icon, logotype, version), the
// AUTO chip while auto-address is on, Labels (one of three), Show (three
// independent toggles), Outline (one of three), the address count, and
// Pick, Find and Tree. Using a control shows StadiaRef if it is hidden.

var PANEL_CSS = [
  ':host { all: initial; }',
  '.stadiaref-panel { position: fixed; left: 50%; bottom: 84px; transform: translateX(-50%); box-sizing: border-box; width: min(400px, calc(100vw - 24px)); padding: 16px; display: flex; flex-direction: column; gap: 14px; background: #13151A; color: #F4F4F5; border: 1px solid #343841; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); font-family: ' + FONT_UI + '; font-size: 12px; pointer-events: auto; z-index: 2000000010; }',
  '.stadiaref-panel__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
  '.stadiaref-panel__brand { display: flex; align-items: center; gap: 8px; }',
  '.stadiaref-panel__brand .stadiaref-brand__icon { width: 22px; height: 22px; }',
  '.stadiaref-brand__disc { fill: #F97316; }',
  '.stadiaref-brand__stadia { fill: #F4F4F5; }',
  '.stadiaref-brand__ref { fill: #FDBA74; }',
  '.stadiaref-panel__brand .stadiaref-brand__logotype { width: 74px; height: 13px; }',
  '.stadiaref-panel__version { font-size: 11px; color: #A1A1AA; }',
  '.stadiaref-panel__auto { padding: 1px 6px; border: 1px dashed #A1A1AA; border-radius: 4px; color: #E4E4E7; font-family: ui-monospace, monospace; font-size: 10px; font-weight: 700; }',
  '.stadiaref-panel__auto[hidden] { display: none; }',
  '.stadiaref-panel__grid { display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 10px 12px; }',
  '.stadiaref-panel__key { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #A1A1AA; }',
  '.stadiaref-panel__seg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; padding: 2px; background: #25272E; border-radius: 8px; }',
  '.stadiaref-panel button { font-family: inherit; font-size: 12px; cursor: pointer; }',
  '.stadiaref-panel__seg button { min-height: 32px; border: 0; border-radius: 6px; background: transparent; color: #E4E4E7; }',
  '.stadiaref-panel__seg button[aria-pressed="true"] { background: #F97316; color: #111827; font-weight: 700; }',
  '.stadiaref-panel__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid #343841; }',
  '.stadiaref-panel__count { color: #D4D4D8; }',
  '.stadiaref-panel__actions { display: flex; gap: 6px; }',
  '.stadiaref-panel__actions button { min-height: 32px; padding: 0 10px; border: 1px solid #52525B; border-radius: 6px; background: transparent; color: #F4F4F5; font-weight: 600; }',
  '.stadiaref-panel__actions button[aria-pressed="true"] { border-color: #F97316; color: #FDBA74; }',
  '.stadiaref-panel button:focus-visible { outline: 2px solid #FDBA74; outline-offset: 2px; }'
].join('\n');

var LABEL_ROWS = [['full', 'Full'], ['icons', 'Icons'], ['off', 'Off']];
var TIER_ROWS = [['section', 'Sections'], ['block', 'Blocks'], ['element', 'Elements']];
var OUTLINE_ROWS = [['off', 'Off'], ['section', 'Sections'], ['block', 'Blocks']];

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}

function button(text, onClick) {
  var b = el('button', '', text);
  b.type = 'button';
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    if (S.presentationMode) show();
    onClick();
    syncPanel();
  });
  return b;
}

function segment(label, rows, onPick) {
  var group = el('div', 'stadiaref-panel__seg');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label);
  rows.forEach(function (row) {
    var b = button(row[1], function () { onPick(row[0]); });
    b.setAttribute('data-value', row[0]);
    b.setAttribute('aria-pressed', 'false');
    group.appendChild(b);
  });
  return group;
}

function buildPanel(root) {
  var style = el('style');
  style.textContent = PANEL_CSS;
  var panel = el('div', 'stadiaref-panel');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'StadiaRef');

  var head = el('div', 'stadiaref-panel__head');
  var brand = el('div', 'stadiaref-panel__brand');
  brand.innerHTML = ICON_SVG + LOGOTYPE_SVG;
  var meta = el('div', 'stadiaref-panel__brand');
  var auto = el('span', 'stadiaref-panel__auto', 'AUTO');
  auto.title = 'Auto-address is on';
  meta.appendChild(auto);
  meta.appendChild(el('span', 'stadiaref-panel__version', VERSION + ' · dev only'));
  head.appendChild(brand);
  head.appendChild(meta);

  var grid = el('div', 'stadiaref-panel__grid');
  grid.appendChild(el('span', 'stadiaref-panel__key', 'Labels'));
  grid.appendChild(segment('Labels', LABEL_ROWS, setLabels)).setAttribute('data-stadiaref-panel', 'labels');
  grid.appendChild(el('span', 'stadiaref-panel__key', 'Show'));
  grid.appendChild(segment('Show tiers', TIER_ROWS, toggleTier)).setAttribute('data-stadiaref-panel', 'tiers');
  grid.appendChild(el('span', 'stadiaref-panel__key', 'Outline'));
  grid.appendChild(segment('Outline', OUTLINE_ROWS, setOutline)).setAttribute('data-stadiaref-panel', 'outline');

  var foot = el('div', 'stadiaref-panel__foot');
  var count = el('span', 'stadiaref-panel__count');
  count.setAttribute('aria-live', 'polite');
  var actions = el('div', 'stadiaref-panel__actions');
  var pick = button('Pick', togglePick);
  pick.setAttribute('data-stadiaref-panel', 'pick');
  var find = button('Find', function () { if (isFinding()) closeFind(); else openFind(); });
  find.setAttribute('data-stadiaref-panel', 'find');
  var tree = button('Tree', toggleTree);
  tree.setAttribute('data-stadiaref-panel', 'tree');
  actions.appendChild(pick);
  actions.appendChild(find);
  actions.appendChild(tree);
  foot.appendChild(count);
  foot.appendChild(actions);

  panel.appendChild(head);
  panel.appendChild(grid);
  panel.appendChild(foot);
  panel.insertBefore(style, panel.firstChild);
  root.appendChild(panel);
  return panel;
}

function pressed(selector, test) {
  var group = S.panel.querySelector('[data-stadiaref-panel="' + selector + '"]');
  if (!group) return;
  var buttons = group.tagName === 'BUTTON' ? [group] : group.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute('aria-pressed', test(buttons[i].getAttribute('data-value')) ? 'true' : 'false');
  }
}

// Bring the panel in line with the state. Called on every state event and
// after every survey.
export function syncPanel() {
  if (!S.panel) return;
  var labels = getLabels();
  var tiers = getTiers();
  pressed('labels', function (v) { return v === labels; });
  pressed('tiers', function (v) { return tiers.indexOf(v) !== -1; });
  pressed('outline', function (v) { return v === S.outlineMode; });
  pressed('pick', isPicking);
  pressed('find', isFinding);
  pressed('tree', function () { return !!S.treeOpen; });
  S.panel.querySelector('.stadiaref-panel__auto').hidden = !S.autoRefEnabled;
  var n = document.querySelectorAll('[data-ref]').length;
  S.panel.querySelector('.stadiaref-panel__count').textContent = n + (n === 1 ? ' address' : ' addresses');
}

var EVENTS = ['labels-change', 'tiers-change', 'outline-change', 'auto-address-change', 'show', 'hide'];

// Bring the host in line with the page: while StadiaRef's app canvas is in
// Astro's Dev Toolbar, draw the panel there and hide the floating toolbar;
// otherwise draw the floating toolbar. Called at start, when the Astro app
// starts, and on every survey. The panel lives in Astro's own canvas, so it
// is drawn even while StadiaRef is hidden.
export function applyHost() {
  var canvas = astroCanvas();
  if (canvas && (!S.panel || S.panel.getRootNode() !== canvas)) {
    if (S.panel && S.panel.parentNode) S.panel.parentNode.removeChild(S.panel);
    S.panel = buildPanel(canvas);
    S.afterSurvey = syncPanel;
    if (!S.panelListening) {
      S.panelListening = true;
      EVENTS.forEach(function (name) { window.addEventListener('stadiaref:' + name, syncPanel); });
    }
    syncPanel();
  }
  if (S.toolbar) {
    var display = toolbarHosted() ? 'none' : '';
    if (S.toolbar.style.display !== display) {
      S.toolbar.style.display = display;
      applyDockPosition();
    }
  }
}
