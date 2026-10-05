import { S } from './state.js';
import { hasRecord, rec } from './records.js';
import { copyRef } from './copy.js';
import { forEachNode, toArray } from './dom.js';
import { emitAddressEvent, emitEvent } from './events.js';
import { getActiveLabel, injectLabels, recordedTier, resolveLabelOverlaps } from './labels.js';
import { applyOutlineMode } from './outline.js';
import { autoRefSections, clearAutoRefs, convertClassRefs } from './survey.js';
import { updateAutoChip, updateShowControl } from './toolbar.js';
import { applyRootState, isLive } from './mount.js';
import { buildTreePanel } from './tree.js';
import { getEffectiveBgLuminance } from './visibility.js';

// ─── Show: which tiers are drawn ───────────────────────────
// Show filters every label, authored or automatic. The hidden tiers are
// written on <html> as data-stadiaref-hidden-tiers; each label node carries
// its own stadiaref-tier-* class, so the CSS hides it wherever it is mounted.
// Unclassified labels show only while every tier is shown.
export const TIER_NAMES = ['section', 'block', 'element'];
var SHOW_NAMES = { SBE: 'All', SB: 'Sec + Blk', S: 'Sections', B: 'Blocks', E: 'Elements', BE: 'Blk + El', SE: 'Sec + El', '': 'None' };

export function getTiers() {
  return TIER_NAMES.filter(function (t) { return S.tiers[t]; });
}

export function tierShown(tier) {
  if (tier === 'unclassified') return S.tiers.section && S.tiers.block && S.tiers.element;
  return !!S.tiers[tier];
}

// The Show button's value: All, Sec + Blk, Sections, Blk + El, None, …
export function showText() {
  var code = (S.tiers.section ? 'S' : '') + (S.tiers.block ? 'B' : '') + (S.tiers.element ? 'E' : '');
  return SHOW_NAMES[code];
}

// Read a tiers list: an array of known tier names. Returns null when it
// isn't one.
export function parseTiers(list) {
  if (!Array.isArray(list)) return null;
  var next = { section: false, block: false, element: false };
  for (var i = 0; i < list.length; i++) {
    if (TIER_NAMES.indexOf(list[i]) === -1) return null;
    next[list[i]] = true;
  }
  return next;
}

export function applyTiers() {
  updateShowControl();
  if (S.treeOpen) buildTreePanel();
  if (!isLive()) return;
  applyRootState();
  resolveLabelOverlaps();
}

export function setTiers(list) {
  var next = parseTiers(list);
  if (!next) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setTiers expected an array of "section", "block", "element", got', list);
    }
    return;
  }
  S.tiers = next;
  applyTiers();
  emitEvent('tiers-change', { tiers: getTiers() });
}

export function toggleTier(tier) {
  var next = getTiers();
  var at = next.indexOf(tier);
  if (at === -1) next.push(tier); else next.splice(at, 1);
  setTiers(next);
}

// ─── Auto-address ──────────────────────────────────────────
// One switch: when on, everything without an address gets a temporary one
// at its tier. Internally this is the 2.x model: S.autoRefEnabled plus
// S.autoRefDepth, where 'all' is auto-address on. The single-tier depths
// ('section', 'block', 'element') are reachable only through the 2.x
// setDepth() and autoRefDepth, and keep their 2.x meaning.
export function getAutoAddress() {
  return !!S.autoRefEnabled;
}

export function setAutoAddress(on) {
  if (typeof on !== 'boolean') {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] setAutoAddress expected true or false, got', on);
    }
    return;
  }
  applyAutoAddress(on ? 'all' : 'off');
}

export function applyAutoAddress(depth) {
  if (depth === 'off') {
    S.autoRefEnabled = false;
  } else {
    S.autoRefEnabled = true;
    S.autoRefDepth = depth;
  }

  updateAutoChip();
  if (isLive()) {
    clearAutoRefs();
    if (S.autoRefEnabled) {
      convertClassRefs();
      autoRefSections();
    }
    injectLabels();
    resolveLabelOverlaps();
    applyOutlineMode();
  }

  // Rebuild tree panel if open
  if (S.treeOpen) buildTreePanel();

  emitEvent('auto-address-change', { autoAddress: S.autoRefEnabled });
}


// Block group collapse
// When blocks and elements are both shown and a section has more than 6
// direct-child block-tier addresses, those blocks are collapsed into a
// "+N blocks" badge on the section. "Direct-child" means no intervening section-tier
// ancestor between the block and this section.

export function getDirectBlockRefs(sectionEl) {
  var blocks = [];
  var allRefs = toArray(sectionEl.querySelectorAll('[data-ref]'));
  for (var i = 0; i < allRefs.length; i++) {
    var ref = allRefs[i];
    if (recordedTier(ref) !== 'block') continue;
    var parent = ref.parentElement;
    var direct = true;
    while (parent && parent !== sectionEl) {
      if (recordedTier(parent) === 'section') {
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
  forEachNode(document.querySelectorAll('.stadiaref-collapsed'), function (n) { n.classList.remove('stadiaref-collapsed'); });
  var badges = document.querySelectorAll('.stadiaref-block-group-badge');
  forEachNode(badges, function (b) { b.parentNode && b.parentNode.removeChild(b); });
  forEachNode(document.querySelectorAll('[data-ref]'), function (el) {
    if (!hasRecord(el)) return;
    rec(el).blockGroupMember = false;
    rec(el).collapsed = false;
    rec(el).groupBadge = null;
  });
}

// Hide the labels of a collapsed block and of everything addressed inside it.
function collapseLabels(blockEl) {
  var els = [blockEl].concat(toArray(blockEl.querySelectorAll('[data-ref]')));
  for (var i = 0; i < els.length; i++) {
    if (!hasRecord(els[i])) continue;
    var r = rec(els[i]);
    r.collapsed = true;
    var nodes = [r.icon, r.tooltip, r.fullLabel, r.link];
    for (var j = 0; j < nodes.length; j++) if (nodes[j]) nodes[j].classList.add('stadiaref-collapsed');
  }
}

export function applyBlockGroupCollapse() {
  var sections = toArray(document.querySelectorAll('[data-ref]')).filter(function (el) { return recordedTier(el) === 'section'; });
  forEachNode(sections, function (sectionEl) {
    var blocks = getDirectBlockRefs(sectionEl);
    if (blocks.length <= 6) return;

    var bgLum = getEffectiveBgLuminance(sectionEl);
    var bgClass = bgLum < 0.40 ? 'stadiaref-on-dark' : 'stadiaref-on-light';

    var badge = document.createElement('span');
    badge.className = 'stadiaref-block-group-badge stadiaref-tier-block ' + bgClass;
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
    (rec(sectionEl).host || sectionEl).appendChild(badge);
    rec(sectionEl).groupBadge = badge;

    // Mark block members so the overlap solver skips them
    for (var j = 0; j < blocks.length; j++) {
      rec(blocks[j]).blockGroupMember = true;
      collapseLabels(blocks[j]);
    }
  });
}
