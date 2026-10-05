import { S } from './state.js';
import { DEPTH_LABELS, LEVEL_LABELS } from './constants.js';
import { copyRef } from './copy.js';
import { forEachNode, toArray } from './dom.js';
import { emitAddressEvent, emitLegacyEvent } from './events.js';
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
  updateDropdown('depth', 'data-stadiaref-depth', newDepth, DEPTH_LABELS[newDepth]);
  applyOutlineMode();

  // Rebuild tree panel if open
  if (S.treeOpen) buildTreePanel();

  emitLegacyEvent('depth-change', { depth: S.autoRefEnabled ? S.autoRefDepth : 'off' });
}


// Level filter management
export const LEVEL_FILTER_CYCLE = ['all', 'section-block', 'section'];

export function applyLevelFilter() {
  document.body.classList.remove('stadiaref-filter-section', 'stadiaref-filter-section-block');
  if (S.levelFilter === 'section') {
    document.body.classList.add('stadiaref-filter-section');
  } else if (S.levelFilter === 'section-block') {
    document.body.classList.add('stadiaref-filter-section-block');
  }
  resolveLabelOverlaps();
}

export function setLevelFilter(value) {
  if (!LEVEL_LABELS[value]) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setLevelFilter expected all/section/section-block, got', value);
    }
    return;
  }
  S.levelFilter = value;
  applyLevelFilter();
  updateDropdown('level', 'data-stadiaref-level', S.levelFilter, LEVEL_LABELS[S.levelFilter]);
  emitLegacyEvent('level-filter-change', { levelFilter: S.levelFilter });
}


// Block group collapse — Deliverable 4
// When levelFilter is 'all' and a section has more than 6 direct-child
// block-class refs, those blocks are collapsed into a "+N blocks" badge
// on the section. "Direct-child" means no intervening stadiaref-ref-class-section
// ancestor between the block and this section.

export function getDirectBlockRefs(sectionEl) {
  var blocks = [];
  var allRefs = toArray(sectionEl.querySelectorAll('[data-ref]'));
  for (var i = 0; i < allRefs.length; i++) {
    var ref = allRefs[i];
    if (!ref.classList.contains('stadiaref-ref-class-block')) continue;
    var parent = ref.parentElement;
    var direct = true;
    while (parent && parent !== sectionEl) {
      if (parent.classList && parent.classList.contains('stadiaref-ref-class-section')) {
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
  var members = document.querySelectorAll('.stadiaref-ref-block-group-member');
  forEachNode(members, function (el) {
    el.classList.remove('stadiaref-ref-block-group-member');
    el._stadiarefBlockGroupMember = false;
  });
  var badges = document.querySelectorAll('.stadiaref-block-group-badge');
  forEachNode(badges, function (b) { b.parentNode && b.parentNode.removeChild(b); });
  var owners = document.querySelectorAll('[data-ref]');
  forEachNode(owners, function (el) { el._stadiarefBlockGroupBadge = null; });
}

export function applyBlockGroupCollapse() {
  var sections = document.querySelectorAll('[data-ref].stadiaref-ref-class-section');
  forEachNode(sections, function (sectionEl) {
    var blocks = getDirectBlockRefs(sectionEl);
    if (blocks.length <= 6) return;

    var bgLum = getEffectiveBgLuminance(sectionEl);
    var bgClass = bgLum < 0.40 ? 'stadiaref-on-dark' : 'stadiaref-on-light';

    var badge = document.createElement('span');
    badge.className = 'stadiaref-block-group-badge ' + bgClass;
    badge.textContent = '+' + blocks.length + ' blocks';

    // Position the badge near the section's active label
    var anchor = getActiveLabel(sectionEl);
    var anchorTop = anchor ? (parseFloat(anchor.style.top || '2') + 20) : 22;
    var anchorLeft = anchor ? parseFloat(anchor.style.left || '2') : 2;
    badge.style.top = anchorTop + 'px';
    badge.style.left = anchorLeft + 'px';

    // Popover listing each block ref
    var popover = document.createElement('span');
    popover.className = 'stadiaref-block-group-popover';
    for (var i = 0; i < blocks.length; i++) {
      var member = blocks[i];
      var memberRef = member.getAttribute('data-ref');
      var memberSegs = memberRef.split('-');
      var blockType = memberSegs.length >= 2 ? memberSegs[memberSegs.length - 2] : 'block';
      var row = document.createElement('span');
      row.className = 'stadiaref-block-group-item';
      var typeSpan = document.createElement('span');
      typeSpan.className = 'stadiaref-block-group-item-type';
      typeSpan.textContent = blockType;
      var refSpan = document.createElement('span');
      refSpan.className = 'stadiaref-block-group-item-ref';
      refSpan.textContent = memberRef;
      row.appendChild(typeSpan);
      row.appendChild(refSpan);
      (function (refVal, refEl, rowEl) {
        rowEl.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          copyRef(refVal);
          emitAddressEvent('click', refEl, refVal, rowEl, { source: 'label' });
        });
      }(memberRef, member, row));
      popover.appendChild(row);
    }
    badge.appendChild(popover);
    sectionEl.appendChild(badge);
    sectionEl._stadiarefBlockGroupBadge = badge;

    // Mark block members so the overlap solver skips them
    for (var j = 0; j < blocks.length; j++) {
      blocks[j]._stadiarefBlockGroupMember = true;
      blocks[j].classList.add('stadiaref-ref-block-group-member');
    }
  });
}
