import { S } from './state.js';
import { DEPTH_LABELS, LEVEL_LABELS } from './constants.js';
import { copyRef } from './copy.js';
import { forEachNode, toArray } from './dom.js';
import { emitEvent } from './events.js';
import { getActiveLabel, injectLabels, resolveLabelOverlaps } from './labels.js';
import { applyOutlineMode } from './outline.js';
import { autoRefSections, clearAutoRefs, convertClassRefs } from './survey.js';
import { updateDropdown } from './toolbar.js';
import { buildTreePanel } from './tree.js';
import { getEffectiveBgLuminance } from './visibility.js';

// ─── Depth management ──────────────────────────────────────
export const DEPTH_CYCLE = ['off', 'section', 'block', 'element', 'all'];

export function setDepth(newDepth) {
  if (newDepth === 'off') {
    S.autoRefEnabled = false;
  } else {
    S.autoRefEnabled = true;
    S.autoRefDepth = newDepth;
  }

  clearAutoRefs();
  if (S.autoRefEnabled) {
    convertClassRefs();
    autoRefSections();
  }
  injectLabels();
  resolveLabelOverlaps();
  updateDropdown('depth', 'data-sdt-depth', newDepth, DEPTH_LABELS[newDepth]);
  applyOutlineMode();

  // Rebuild tree panel if open
  if (S.treeOpen) buildTreePanel();

  emitEvent('depth-change', { depth: S.autoRefEnabled ? S.autoRefDepth : 'off' });
}


// Level filter management
export const LEVEL_FILTER_CYCLE = ['all', 'section-block', 'section'];

export function applyLevelFilter() {
  document.body.classList.remove('sdt-filter-section', 'sdt-filter-section-block');
  if (S.levelFilter === 'section') {
    document.body.classList.add('sdt-filter-section');
  } else if (S.levelFilter === 'section-block') {
    document.body.classList.add('sdt-filter-section-block');
  }
  resolveLabelOverlaps();
}

export function setLevelFilter(value) {
  if (!LEVEL_LABELS[value]) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[seguru-debug-toolbar] setLevelFilter expected all/section/section-block, got', value);
    }
    return;
  }
  S.levelFilter = value;
  applyLevelFilter();
  updateDropdown('level', 'data-sdt-level', S.levelFilter, LEVEL_LABELS[S.levelFilter]);
  emitEvent('level-filter-change', { levelFilter: S.levelFilter });
}


// Block group collapse — Deliverable 4
// When levelFilter is 'all' and a section has more than 6 direct-child
// block-class refs, those blocks are collapsed into a "+N blocks" badge
// on the section. "Direct-child" means no intervening sdt-ref-class-section
// ancestor between the block and this section.

export function getDirectBlockRefs(sectionEl) {
  var blocks = [];
  var allRefs = toArray(sectionEl.querySelectorAll('[data-ref]'));
  for (var i = 0; i < allRefs.length; i++) {
    var ref = allRefs[i];
    if (!ref.classList.contains('sdt-ref-class-block')) continue;
    var parent = ref.parentElement;
    var direct = true;
    while (parent && parent !== sectionEl) {
      if (parent.classList && parent.classList.contains('sdt-ref-class-section')) {
        direct = false;
        break;
      }
      parent = parent.parentElement;
    }
    if (direct) blocks.push(ref);
  }
  return blocks;
}

export function clearBlockGroupCollapse() {
  var members = document.querySelectorAll('.sdt-ref-block-group-member');
  forEachNode(members, function (el) {
    el.classList.remove('sdt-ref-block-group-member');
    el._sdtBlockGroupMember = false;
  });
  var badges = document.querySelectorAll('.sdt-block-group-badge');
  forEachNode(badges, function (b) { b.parentNode && b.parentNode.removeChild(b); });
  var owners = document.querySelectorAll('[data-ref]');
  forEachNode(owners, function (el) { el._sdtBlockGroupBadge = null; });
}

export function applyBlockGroupCollapse() {
  var sections = document.querySelectorAll('[data-ref].sdt-ref-class-section');
  forEachNode(sections, function (sectionEl) {
    var blocks = getDirectBlockRefs(sectionEl);
    if (blocks.length <= 6) return;

    var bgLum = getEffectiveBgLuminance(sectionEl);
    var bgClass = bgLum < 0.40 ? 'sdt-on-dark' : 'sdt-on-light';

    var badge = document.createElement('span');
    badge.className = 'sdt-block-group-badge ' + bgClass;
    badge.textContent = '+' + blocks.length + ' blocks';

    // Position the badge near the section's active label
    var anchor = getActiveLabel(sectionEl);
    var anchorTop = anchor ? (parseFloat(anchor.style.top || '2') + 20) : 22;
    var anchorLeft = anchor ? parseFloat(anchor.style.left || '2') : 2;
    badge.style.top = anchorTop + 'px';
    badge.style.left = anchorLeft + 'px';

    // Popover listing each block ref
    var popover = document.createElement('span');
    popover.className = 'sdt-block-group-popover';
    for (var i = 0; i < blocks.length; i++) {
      var member = blocks[i];
      var memberRef = member.getAttribute('data-ref');
      var memberSegs = memberRef.split('-');
      var blockType = memberSegs.length >= 2 ? memberSegs[memberSegs.length - 2] : 'block';
      var row = document.createElement('span');
      row.className = 'sdt-block-group-item';
      var typeSpan = document.createElement('span');
      typeSpan.className = 'sdt-block-group-item-type';
      typeSpan.textContent = blockType;
      var refSpan = document.createElement('span');
      refSpan.className = 'sdt-block-group-item-ref';
      refSpan.textContent = memberRef;
      row.appendChild(typeSpan);
      row.appendChild(refSpan);
      (function (refVal, refEl, rowEl) {
        rowEl.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          copyRef(refVal);
          emitEvent('dataref-click', { dataRef: refVal, element: refEl, current: rowEl });
        });
      }(memberRef, member, row));
      popover.appendChild(row);
    }
    badge.appendChild(popover);
    sectionEl.appendChild(badge);
    sectionEl._sdtBlockGroupBadge = badge;

    // Mark block members so the overlap solver skips them
    for (var j = 0; j < blocks.length; j++) {
      blocks[j]._sdtBlockGroupMember = true;
      blocks[j].classList.add('sdt-ref-block-group-member');
    }
  });
}
