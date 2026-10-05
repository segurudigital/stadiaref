import { FONT_MONO, FONT_UI } from '../constants.js';
import { TAGS, TOOLBAR } from './tokens.js';

// ─── Shadow root CSS: toolbar, menus, panels, toast ──────────────
// Everything here renders inside StadiaRef's shadow root, so page CSS can't
// reach it. Colours are custom properties set from tokens.js: light on
// :host, dark on :host(.stadiaref-theme-dark) (theme.js resolves 'auto',
// including a `dark` class on <html>). Values follow the 3.0 wireframes.

function vars(t) {
  return Object.keys(t).map(function (k) { return '--sr-' + k + ': ' + t[k] + ';'; }).join(' ');
}

function tierTags() {
  return Object.keys(TAGS).map(function (tier) {
    var t = TAGS[tier];
    return '.stadiaref-tag--' + tier + ' { background: ' + t.bg + '; color: ' + t.fg + '; border-color: ' + t.bd + '; }';
  }).join('\n');
}

export function buildShadowCss() {
  return `
:host { ${vars(TOOLBAR.light)} }
:host(.stadiaref-theme-dark) { ${vars(TOOLBAR.dark)} }

/* --- The toolbar --- */
.stadiaref-toolbar {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  max-width: calc(100vw - 40px);
  padding: 4px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: ${FONT_UI};
  font-size: 12px;
  line-height: 1.5;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 3;
}
.stadiaref-toolbar *, .stadiaref-toolbar *::before, .stadiaref-toolbar *::after { box-sizing: border-box; }
.stadiaref-toolbar button {
  font-family: inherit;
  margin: 0;
}
:is(.stadiaref-toolbar, .stadiaref-tree-panel, .stadiaref-active-ref-tree) :is(a, button, [tabindex]):focus { outline: none; }
:is(.stadiaref-toolbar, .stadiaref-tree-panel, .stadiaref-active-ref-tree) :is(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--sr-focus);
  outline-offset: 2px;
}

/* Brand: icon and logotype, always present */
.stadiaref-brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 8px 0 6px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--sr-fg);
  text-decoration: none;
}
.stadiaref-brand:hover { background: var(--sr-pillBg); border-color: var(--sr-barBd); }
.stadiaref-brand__icon { display: block; width: 20px; height: 20px; flex-shrink: 0; }
.stadiaref-brand__disc { fill: var(--sr-dot); }
.stadiaref-brand__logotype { display: block; width: 65px; height: 11px; flex-shrink: 0; }
.stadiaref-brand__stadia { fill: var(--sr-fg); }
.stadiaref-brand__ref { fill: var(--sr-refFg); }
.stadiaref-brand__tip {
  position: absolute;
  left: 0;
  bottom: calc(100% + 10px);
  padding: 5px 10px;
  background: var(--sr-tipBg);
  color: var(--sr-tipFg);
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
}
:host([data-stadiaref-dock^="top"]) .stadiaref-brand__tip { bottom: auto; top: calc(100% + 10px); }
.stadiaref-brand:hover .stadiaref-brand__tip,
.stadiaref-brand:focus-visible .stadiaref-brand__tip { opacity: 1; }

/* Reviewer pill */
.stadiaref-toolbar__user {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 4px 9px 4px 5px;
  background: var(--sr-pillBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 999px;
  white-space: nowrap;
}
.stadiaref-toolbar__user--visible { display: inline-flex; }
.stadiaref-toolbar__user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--sr-avatarBg);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
}
.stadiaref-toolbar__user-name { font-weight: 600; }
.stadiaref-toolbar__user-role { font-size: 10px; color: var(--sr-key); }

/* Groups: the primary controls, a divider, then Outline and Tree */
.stadiaref-toolbar__cluster { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.stadiaref-toolbar__cluster--primary { padding-right: 6px; margin-right: 2px; border-right: 1px solid var(--sr-barBd); }
.stadiaref-toolbar__group { position: relative; display: flex; }

/* Controls: pills with a 10px uppercase key and a 12px value */
.stadiaref-toolbar__select {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 4px 10px;
  background: var(--sr-pillBg);
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--sr-fg);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-toolbar__select:hover { border-color: var(--sr-barBd); }
.stadiaref-toolbar__key {
  font-size: 10px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--sr-key);
}
.stadiaref-toolbar__key--short { display: none; }
.stadiaref-toolbar__caret { font-size: 8px; color: var(--sr-key); }
.stadiaref-toolbar__select svg { display: block; flex-shrink: 0; }
.stadiaref-toolbar__select--active,
.stadiaref-toolbar__select[aria-pressed="true"] {
  background: var(--sr-wash);
  border-color: var(--sr-washBd);
  color: var(--sr-accent);
}
.stadiaref-toolbar__select--active .stadiaref-toolbar__key,
.stadiaref-toolbar__select--active .stadiaref-toolbar__caret { color: var(--sr-accent); }
.stadiaref-toolbar__select--open {
  background: var(--sr-barBg);
  border-color: var(--sr-ring);
  box-shadow: 0 0 0 3px var(--sr-ringGlow);
  color: var(--sr-fg);
}
.stadiaref-toolbar__select--open .stadiaref-toolbar__key,
.stadiaref-toolbar__select--open .stadiaref-toolbar__caret { color: var(--sr-key); }
/* Utility controls (Outline, Tree): quieter, with a state dot */
.stadiaref-toolbar__select--utility { background: transparent; color: var(--sr-util); }
.stadiaref-toolbar__select--utility.stadiaref-toolbar__select--active,
.stadiaref-toolbar__select--utility[aria-pressed="true"] { background: var(--sr-diagBg); border-color: var(--sr-washBd); color: var(--sr-fg); }
.stadiaref-toolbar__select--utility .stadiaref-toolbar__key { color: var(--sr-key); }
.stadiaref-toolbar__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sr-dotOff); flex-shrink: 0; }
.stadiaref-toolbar__select--active .stadiaref-toolbar__dot,
.stadiaref-toolbar__select[aria-pressed="true"] .stadiaref-toolbar__dot { background: var(--sr-dot); }

/* AUTO chip: a status, not a button. Present only while auto-address is on */
.stadiaref-toolbar__auto {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border: 1px dashed var(--sr-autoBd);
  border-radius: 3px;
  color: var(--sr-autoFg);
  font-family: ${FONT_MONO};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.stadiaref-toolbar__auto[hidden] { display: none; }

/* Menus */
.stadiaref-toolbar__dropdown {
  display: none;
  position: absolute;
  min-width: 250px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 2;
}
.stadiaref-toolbar__dropdown[data-stadiaref-menu="show"] { min-width: 290px; }
.stadiaref-toolbar__dropdown--open { display: block; }
.stadiaref-toolbar__hint {
  display: block;
  padding: 6px 12px;
  font-size: 10px;
  color: var(--sr-key);
  border-bottom: 1px solid var(--sr-barBd);
}
.stadiaref-toolbar__hint[hidden] { display: none; }
.stadiaref-toolbar__option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 7px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-toolbar__option:hover { background: var(--sr-hover); }
.stadiaref-toolbar__option-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.stadiaref-toolbar__note { font-weight: 400; color: var(--sr-desc); }
.stadiaref-toolbar__option--active { background: var(--sr-wash); color: var(--sr-accent); font-weight: 600; }
.stadiaref-toolbar__option--active .stadiaref-toolbar__note { color: var(--sr-accent); }
.stadiaref-toolbar__option--active:hover { background: var(--sr-wash); }
/* Show rows: a tick box per tier; the rows don't take the wash */
.stadiaref-toolbar__check.stadiaref-toolbar__option--active { background: transparent; color: var(--sr-fg); }
.stadiaref-toolbar__check.stadiaref-toolbar__option--active:hover { background: var(--sr-hover); }
.stadiaref-toolbar__check.stadiaref-toolbar__option--active .stadiaref-toolbar__note { color: var(--sr-desc); }
.stadiaref-toolbar__tick {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid var(--sr-tickOffBd);
  border-radius: 3px;
  background: var(--sr-tickOffBg);
  color: transparent;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}
.stadiaref-toolbar__check[aria-checked="true"] .stadiaref-toolbar__tick { border-color: var(--sr-tickOnBd); background: var(--sr-tickOnBg); color: var(--sr-tickOnFg); }

/* --- Compact: under 480px, or a coarse pointer --- */
@media (max-width: 479px), (pointer: coarse) {
  .stadiaref-toolbar__select, .stadiaref-brand, .stadiaref-toolbar__option { min-height: 44px; }
  .stadiaref-toolbar__select { padding-top: 12px; padding-bottom: 12px; }
  .stadiaref-toolbar__key--long { display: none; }
  .stadiaref-toolbar__key--short { display: inline; }
}
@media (max-width: 479px) {
  .stadiaref-brand__logotype { display: none; }
  .stadiaref-toolbar__dropdown { min-width: min(290px, calc(100vw - 40px)); }
}

/* --- Toast --- */
.stadiaref-toast {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  max-width: calc(100vw - 40px);
  padding: 7px 11px;
  background: var(--sr-toastBg);
  color: var(--sr-toastFg);
  border: 1px solid var(--sr-toastBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: ${FONT_MONO};
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
  pointer-events: none;
  z-index: 4;
}
.stadiaref-toast--visible { opacity: 1; transform: translateY(0); }

/* --- Panels: the Tree and the address chain --- */
.stadiaref-tree-panel, .stadiaref-active-ref-tree {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: none;
  flex-direction: column;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  font-family: ${FONT_UI};
  font-size: 12px;
  line-height: 1.5;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 2;
}
.stadiaref-tree-panel *, .stadiaref-active-ref-tree * { box-sizing: border-box; }
.stadiaref-tree-panel button, .stadiaref-active-ref-tree button { font-family: inherit; margin: 0; }
.stadiaref-tree-panel--open, .stadiaref-active-ref-tree--open { display: flex; }
.stadiaref-tree-panel { max-height: min(560px, calc(100vh - 120px)); }
.stadiaref-tree-panel__header { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-tree-panel__header-main { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.stadiaref-tree-panel__title-wrap { display: flex; align-items: center; gap: 8px; }
.stadiaref-tree-panel__title { font-size: 12px; font-weight: 700; }
.stadiaref-tree-panel__count { padding: 1px 7px; border-radius: 999px; background: var(--sr-chipBg); color: var(--sr-chipFg); font-size: 11px; font-weight: 600; }
.stadiaref-tree-panel__close, .stadiaref-tree-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--sr-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.stadiaref-tree-panel__close:hover { background: var(--sr-hover); }
.stadiaref-tree-panel__meta { display: flex; flex-wrap: wrap; gap: 6px; }
.stadiaref-tree-panel__meta-item {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--sr-pillBg);
  border: 1px solid var(--sr-barBd);
  color: var(--sr-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.stadiaref-tree-panel__hint { font-size: 11px; color: var(--sr-muted); }
.stadiaref-tree-panel__body { display: flex; flex-direction: column; padding: 4px 0; overflow-y: auto; }
.stadiaref-tree-empty { padding: 12px; color: var(--sr-muted); }
.stadiaref-tree-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 29px;
  padding: 0 8px 0 12px;
  cursor: pointer;
}
.stadiaref-tree-row--active { background: var(--sr-rowHover); }
.stadiaref-tree-row--active .stadiaref-tree-ref { font-weight: 700; color: var(--sr-rowHoverFg); }
.stadiaref-tree-row--active .stadiaref-tree-copy { background: var(--sr-barBg); color: var(--sr-accent); }
.stadiaref-tree-ref {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${FONT_MONO};
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* Tier tags in the Tree and the chain */
.stadiaref-tag {
  min-width: 28px;
  padding: 1px 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-family: ${FONT_MONO};
  font-size: 9px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
  flex-shrink: 0;
}
${tierTags()}
.stadiaref-tag--auto { border-style: dashed; }

.stadiaref-active-ref-tree { width: 340px; }
.stadiaref-active-ref-tree__header { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 8px 12px; border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-active-ref-tree__title { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: var(--sr-muted); }
.stadiaref-active-ref-tree__pin {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid var(--sr-barBd);
  border-radius: 4px;
  background: transparent;
  color: var(--sr-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.stadiaref-active-ref-tree__pin[aria-pressed="true"] { border-color: var(--sr-pinOnBd); background: var(--sr-pinOnBg); color: var(--sr-pinOnFg); }
.stadiaref-active-ref-tree__row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${FONT_MONO};
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.stadiaref-active-ref-tree__row:hover { background: var(--sr-hover); }
.stadiaref-active-ref-tree__row--current { background: var(--sr-rowHover); color: var(--sr-rowHoverFg); font-weight: 700; }
.stadiaref-active-ref-tree__row-ref { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* --- Highlights over page elements (highlight.js) --- */
.stadiaref-highlight {
  all: initial;
  position: fixed;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 1;
  border-radius: 2px;
}
.stadiaref-highlight[hidden] { display: none; }
.stadiaref-highlight--hover { outline: 2px solid #EA580C; outline-offset: 3px; }
.stadiaref-highlight--jump { outline: 3px solid rgba(234, 88, 12, 0.92); outline-offset: 4px; box-shadow: 0 0 0 6px rgba(234, 88, 12, 0.16); }
/* Pick: the chosen level solid, the rest of its chain dashed */
.stadiaref-highlight--pick-current { outline: 2px solid #EA580C; outline-offset: 2px; }
[class*="stadiaref-highlight--pick-"]:not(.stadiaref-highlight--pick-current) { outline: 1px dashed rgba(234, 88, 12, 0.7); outline-offset: 4px; }
/* Find: the match framed, the rest of the page dimmed by this one layer */
.stadiaref-highlight--find { outline: 2px solid #EA580C; outline-offset: 6px; box-shadow: 0 0 0 100vmax rgba(17, 24, 39, 0.45); }

/* --- Dialog status line --- */
.stadiaref-dialog-status {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  max-width: calc(100vw - 40px);
  padding: 7px 11px;
  background: var(--sr-statusBg);
  color: var(--sr-statusFg);
  border: 1px solid var(--sr-toastBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-family: ${FONT_UI};
  font-size: 12px;
  line-height: 1.4;
  pointer-events: none;
  z-index: 4;
}
.stadiaref-dialog-status[hidden] { display: none; }

/* --- Pick sheet (touch) --- */
.stadiaref-pick-sheet {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  left: calc(12px + env(safe-area-inset-left, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #111827;
  color: #F9FAFB;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  font-family: ${FONT_UI};
  pointer-events: auto;
  z-index: 6;
  animation: stadiaref-sheet-in 0.18s ease-out;
}
.stadiaref-pick-sheet[hidden] { display: none; }
@keyframes stadiaref-sheet-in { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .stadiaref-pick-sheet { animation: none; } }
.stadiaref-pick-sheet .stadiaref-pick-chip__parts { font-family: ${FONT_MONO}; font-size: 12px; }
.stadiaref-pick-sheet__address { font-family: ${FONT_MONO}; font-size: 12px; color: #E5E7EB; overflow-wrap: anywhere; }
.stadiaref-pick-sheet__actions { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
.stadiaref-pick-sheet__btn {
  all: initial;
  box-sizing: border-box;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #6B7280;
  border-radius: 8px;
  color: #F9FAFB;
  font-family: ${FONT_UI};
  font-size: 14px;
  cursor: pointer;
}
.stadiaref-pick-sheet__btn--copy { border-color: #F97316; background: #F97316; color: #111827; font-weight: 700; }
.stadiaref-pick-sheet__btn:focus-visible { outline: 2px solid #FDBA74; outline-offset: 2px; }
.stadiaref-pick-sheet__btn[disabled] { opacity: 0.5; cursor: default; }

/* --- Pick chip --- */
.stadiaref-pick-chip {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: calc(100vw - 16px);
  padding: 7px 9px;
  background: #111827;
  color: #F9FAFB;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-family: ${FONT_MONO};
  font-size: 11px;
  line-height: 1.3;
  pointer-events: none;
  z-index: 5;
}
.stadiaref-pick-chip[hidden] { display: none; }
.stadiaref-pick-chip__parts { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.stadiaref-pick-chip__sep { color: #9CA3AF; }
.stadiaref-pick-chip__part { padding: 1px 5px; border: 1px solid transparent; border-radius: 3px; font-weight: 700; white-space: nowrap; }
.stadiaref-pick-chip__part--section { background: #F97316; color: #111827; border-color: #F97316; }
.stadiaref-pick-chip__part--block { background: rgba(255, 255, 255, 0.92); color: #111827; border-color: rgba(255, 255, 255, 0.92); }
.stadiaref-pick-chip__part--element { border-color: rgba(255, 255, 255, 0.7); color: #FFFFFF; }
.stadiaref-pick-chip__part--unclassified { border-color: #FBBF24; border-style: dashed; color: #FDE68A; }
.stadiaref-pick-chip__part--current { box-shadow: 0 0 0 2px #111827, 0 0 0 4px #FDBA74; }
.stadiaref-pick-chip__hint { font-family: ${FONT_UI}; font-size: 11px; color: #D1D5DB; white-space: normal; max-width: 420px; }

/* --- Find --- */
.stadiaref-find {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: none;
  flex-direction: column;
  width: 400px;
  max-width: calc(100vw - 40px);
  max-height: min(480px, calc(100vh - 120px));
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  font-family: ${FONT_UI};
  font-size: 12px;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 3;
}
.stadiaref-find * { box-sizing: border-box; }
.stadiaref-find--open { display: flex; }
.stadiaref-find__label { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; font-size: 11px; font-weight: 600; color: var(--sr-muted); border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-find__input {
  height: 32px;
  padding: 0 10px;
  border: 2px solid var(--sr-accent);
  border-radius: 4px;
  background: var(--sr-barBg);
  color: var(--sr-fg);
  font-family: ${FONT_MONO};
  font-size: 12px;
  outline: none;
}
.stadiaref-find__input:focus-visible { box-shadow: 0 0 0 3px var(--sr-ringGlow); }
.stadiaref-find__list { display: flex; flex-direction: column; overflow-y: auto; }
.stadiaref-find__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 6px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${FONT_MONO};
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.stadiaref-find__row:hover, .stadiaref-find__row[aria-selected="true"] { background: var(--sr-rowHover); color: var(--sr-rowHoverFg); }
.stadiaref-find__row[aria-selected="true"] { font-weight: 700; }
.stadiaref-find__row[aria-disabled="true"] { cursor: default; color: var(--sr-muted); background: transparent; }
.stadiaref-find__address { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stadiaref-find__note { margin-left: auto; padding: 0 6px; border-radius: 999px; background: var(--sr-chipBg); color: var(--sr-chipFg); font-family: ${FONT_UI}; font-size: 10px; font-weight: 600; }
.stadiaref-find__status { padding: 7px 12px; border-top: 1px solid var(--sr-barBd); font-size: 11px; color: var(--sr-muted); }
@media (max-width: 479px), (pointer: coarse) { .stadiaref-find__row { min-height: 44px; } .stadiaref-find__input { height: 44px; } }
`;
}
