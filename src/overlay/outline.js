import { S } from './state.js';
import { OUTLINE_LABELS } from './constants.js';
import { arrayContainsNode, forEachNode, setClassState } from './dom.js';
import { emitEvent } from './events.js';
import { collectTargetsByDepth } from './survey.js';
import { updateDropdown } from './toolbar.js';
import { getEffectiveBgLuminance } from './visibility.js';

export function clearOutlines() {
  var outlined = document.querySelectorAll('.sdt-outline-section, .sdt-outline-block');
  forEachNode(outlined, function (el) {
    el.classList.remove('sdt-outline-section');
    el.classList.remove('sdt-outline-block');
    el.classList.remove('sdt-outline-on-dark');
  });
}

export function applyOutlineClass(el, className) {
  var lum = getEffectiveBgLuminance(el);
  el.classList.add(className);
  setClassState(el, 'sdt-outline-on-dark', lum < 0.40);
}

export function applyOutlineMode() {
  clearOutlines();
  if (S.outlineMode === 'off') return;

  var sectionTargets = collectTargetsByDepth('section');
  var sectionLookup = [];
  var blockTargets;

  forEachNode(sectionTargets, function (el) {
    applyOutlineClass(el, 'sdt-outline-section');
    sectionLookup.push(el);
  });

  if (S.outlineMode !== 'block') return;

  blockTargets = collectTargetsByDepth('block');
  forEachNode(blockTargets, function (el) {
    if (arrayContainsNode(sectionLookup, el)) return;
    applyOutlineClass(el, 'sdt-outline-block');
  });
}

export function setOutline(newMode) {
  S.outlineMode = OUTLINE_LABELS[newMode] ? newMode : 'off';
  applyOutlineMode();
  updateDropdown('outline', 'data-sdt-outline', S.outlineMode, OUTLINE_LABELS[S.outlineMode]);
  emitEvent('outline-change', { outline: S.outlineMode });
}
