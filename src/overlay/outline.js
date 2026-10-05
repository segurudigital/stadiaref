import { S } from './state.js';
import { OUTLINE_LABELS } from './constants.js';
import { arrayContainsNode, forEachNode, setClassState } from './dom.js';
import { emitEvent } from './events.js';
import { collectTargetsByDepth } from './survey.js';
import { updateDropdown } from './toolbar.js';
import { getEffectiveBgLuminance } from './visibility.js';

export function clearOutlines() {
  var outlined = document.querySelectorAll('.stadiaref-outline-section, .stadiaref-outline-block');
  forEachNode(outlined, function (el) {
    el.classList.remove('stadiaref-outline-section');
    el.classList.remove('stadiaref-outline-block');
    el.classList.remove('stadiaref-outline-on-dark');
  });
}

export function applyOutlineClass(el, className) {
  var lum = getEffectiveBgLuminance(el);
  el.classList.add(className);
  setClassState(el, 'stadiaref-outline-on-dark', lum < 0.40);
}

export function applyOutlineMode() {
  clearOutlines();
  if (S.outlineMode === 'off') return;

  var sectionTargets = collectTargetsByDepth('section');
  var sectionLookup = [];
  var blockTargets;

  forEachNode(sectionTargets, function (el) {
    applyOutlineClass(el, 'stadiaref-outline-section');
    sectionLookup.push(el);
  });

  if (S.outlineMode !== 'block') return;

  blockTargets = collectTargetsByDepth('block');
  forEachNode(blockTargets, function (el) {
    if (arrayContainsNode(sectionLookup, el)) return;
    applyOutlineClass(el, 'stadiaref-outline-block');
  });
}

export function setOutline(newMode) {
  S.outlineMode = OUTLINE_LABELS[newMode] ? newMode : 'off';
  applyOutlineMode();
  updateDropdown('outline', 'data-stadiaref-outline', S.outlineMode, OUTLINE_LABELS[S.outlineMode]);
  emitEvent('outline-change', { outline: S.outlineMode });
}
