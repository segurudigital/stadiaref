import { S } from './state.js';
import { OUTLINE_LABELS } from './constants.js';
import { arrayContainsNode, forEachNode } from './dom.js';
import { isLive } from './mount.js';
import { emitEvent } from './events.js';
import { collectTargetsByDepth } from './survey.js';
import { updateDropdown } from './toolbar.js';
import { getEffectiveBgLuminance } from './visibility.js';

// Outline guides are StadiaRef's own frames, appended inside each section
// or block, so nothing is added to the page's own classes.
export function clearOutlines() {
  forEachNode(document.querySelectorAll('.stadiaref-outline'), function (o) {
    if (o.parentNode) o.parentNode.removeChild(o);
  });
}

export function addOutline(el, kind) {
  var frame = document.createElement('span');
  frame.className = 'stadiaref-outline stadiaref-outline--' + kind + (getEffectiveBgLuminance(el) < 0.40 ? ' stadiaref-on-dark' : '');
  if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(frame);
}

export function applyOutlineMode() {
  if (!isLive()) return;
  clearOutlines();
  if (S.outlineMode === 'off') return;

  var sectionTargets = collectTargetsByDepth('section');
  var sectionLookup = [];
  var blockTargets;

  forEachNode(sectionTargets, function (el) {
    addOutline(el, 'section');
    sectionLookup.push(el);
  });

  if (S.outlineMode !== 'block') return;

  blockTargets = collectTargetsByDepth('block');
  forEachNode(blockTargets, function (el) {
    if (arrayContainsNode(sectionLookup, el)) return;
    addOutline(el, 'block');
  });
}

export function setOutline(newMode) {
  S.outlineMode = OUTLINE_LABELS[newMode] ? newMode : 'off';
  applyOutlineMode();
  updateDropdown('outline', 'data-stadiaref-outline', S.outlineMode, OUTLINE_LABELS[S.outlineMode]);
  emitEvent('outline-change', { outline: S.outlineMode });
}
