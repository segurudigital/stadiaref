import { S } from './state.js';
import { forget, hasRecord, rec, removeOwn } from './records.js';
import { tierOf } from './classify.js';
import { labelClick } from './card.js';
import { forEachNode, rectsOverlap, toArray } from './dom.js';
import { emitAddressEvent } from './events.js';
import { getElementContext } from './survey.js';
import { applyBlockGroupCollapse, clearBlockGroupCollapse, tierShown } from './tiers.js';
import { applyLabelVisibilityState, getEffectiveBgLuminance } from './visibility.js';
import { isLive } from './mount.js';
import { dropSlot, layerAll, placeSlots, slotFor, syncSlotAddress } from './layer.js';

// Label injection
export const LABEL_BASE_TOP = 2;
export const LABEL_COLLISION_GAP = 4;
export const LABEL_OFFSET_STEP = 18;
export const LABEL_OFFSET_LIMIT = 6;
export const LABEL_DEPTH_X_STEP = 10;
export const LABEL_DEPTH_X_CAP = 30;
export const LABEL_DEPTH_Y_STEP = 6;
export const LABEL_DEPTH_Y_CAP = 18;

export function getRefDepth(el) {
  var depth = 0;
  var parent = el.parentElement;
  while (parent) {
    if (parent.hasAttribute('data-ref')) depth++;
    parent = parent.parentElement;
  }
  return depth;
}

export function getDepthInset(depth) {
  var xInset = depth * LABEL_DEPTH_X_STEP;
  if (xInset > LABEL_DEPTH_X_CAP) xInset = LABEL_DEPTH_X_CAP;
  return xInset;
}

export function getDepthLift(depth) {
  var yInset = depth * LABEL_DEPTH_Y_STEP;
  if (yInset > LABEL_DEPTH_Y_CAP) yInset = LABEL_DEPTH_Y_CAP;
  return yInset;
}

export function setLabelOffset(el, offset, depth) {
  var top = (LABEL_BASE_TOP + offset) + 'px';
  var xInset = getDepthInset(depth || 0);
  var icon = rec(el).icon;
  var link = rec(el).link;
  var tooltip = rec(el).tooltip;
  var fullLabel = rec(el).fullLabel;

  if (icon) icon.style.top = top;
  if (link) {
    link.style.height = offset + 'px';
    link.style.opacity = offset > 0 ? '1' : '0';
  }
  if (tooltip) {
    tooltip.style.top = top;
    tooltip.style.left = (22 + xInset) + 'px';
  }
  if (fullLabel) {
    fullLabel.style.top = top;
    fullLabel.style.left = (2 + xInset) + 'px';
  }
}

export function resetLabelOffsets() {
  var refs = document.querySelectorAll('[data-ref]');
  forEachNode(refs, function (el) {
    rec(el).depth = getRefDepth(el);
    setLabelOffset(el, getDepthLift(rec(el).depth || 0), rec(el).depth || 0);
  });
}

export function getActiveLabel(el) {
  if (S.presentationMode || S.state === 1) return null;
  return S.state === 2 ? rec(el).fullLabel : rec(el).icon;
}

export function resolveLabelOverlaps() {
  var refs;
  // placedSlots — array of { rect, owner } for each placed label.
  // `owner` is the [data-ref] element so unplaceable labels can be
  // attached to its cluster.
  var placedSlots = [];

  if (!isLive()) return;
  // Slots first: the overlap checks below measure labels on the screen.
  placeSlots();
  resetLabelOffsets();
  clearClusters();
  clearBlockGroupCollapse();
  if (S.state === 1) return;

  // Block group collapse: sections with >6 direct block children when
  // level filter is All. Must run before the placement loop so collapsed
  // block labels don't consume collision slots.
  if (S.tiers.block && S.tiers.element) applyBlockGroupCollapse();

  refs = toArray(document.querySelectorAll('[data-ref]'));
  refs.sort(function (a, b) {
    var pos = a.compareDocumentPosition(b);
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  forEachNode(refs, function (el) {
    // Skip refs hidden by an ancestor (display:none / visibility:hidden /
    // opacity:0). Their labels are display:none via .stadiaref-ref-hidden, so
    // they shouldn't consume collision slots — otherwise hidden mega-menu
    // labels would push visible labels around.
    if (rec(el).visible === false) return;

    // Skip block-group-collapsed members and tiers Show is hiding — their
    // labels are hidden by CSS and must not take part in collision detection.
    if (rec(el).blockGroupMember || rec(el).collapsed) return;
    // Outside a drill-down: hidden, so it takes no slot.
    if (S.drillRoot && el !== S.drillRoot && !S.drillRoot.contains(el)) return;
    if (!tierShown(rec(el).tier)) return;

    var anchor = getActiveLabel(el);
    var attempt;
    var rect;
    var collisionWith;
    var i;
    var preferredOffset;

    if (!anchor) return;

    preferredOffset = getDepthLift(rec(el).depth || 0);

    collisionWith = null;
    for (attempt = 0; attempt < LABEL_OFFSET_LIMIT; attempt++) {
      setLabelOffset(el, preferredOffset + (attempt * LABEL_OFFSET_STEP), rec(el).depth || 0);
      rect = anchor.getBoundingClientRect();
      collisionWith = null;

      for (i = 0; i < placedSlots.length; i++) {
        if (rectsOverlap(rect, placedSlots[i].rect, LABEL_COLLISION_GAP)) {
          collisionWith = placedSlots[i];
          break;
        }
      }

      if (!collisionWith) break;
    }

    if (collisionWith) {
      // All LABEL_OFFSET_LIMIT lift attempts still collide — collapse
      // this label into the colliding slot's cluster. The "owner"
      // (placed first) keeps its anchor visible; this ref is hidden
      // and surfaced via the +N badge on the owner.
      addToCluster(collisionWith.owner, el);
    } else {
      placedSlots.push({ rect: anchor.getBoundingClientRect(), owner: el });
    }
  });

  // After all placements are known, render +N badges on owners that
  // accumulated cluster members.
  for (var s = 0; s < placedSlots.length; s++) {
    renderClusterBadgeIfNeeded(placedSlots[s].owner);
  }
}


// ─── Cluster collapse (the "+N" badge) ─────────────────────────
// When a label can't be placed without collision after every offset
// attempt, instead of letting it pile on top of the colliding owner
// we hide the unplaceable label and remember it on the owner's
// `_stadiarefCluster` list. After resolveLabelOverlaps finishes placing
// every label, owners with non-empty clusters get a "+N" badge
// appended next to their active label; hovering the badge expands a
// small popover listing the clustered refs (each row click-to-copy
// with the same semantics as a normal label). The badge respects
// the same body.stadiaref-hide / stadiaref-presentation rules as the labels.

export function clearClusters() {
  var clustered = layerAll('.stadiaref-ref-clustered');
  forEachNode(clustered, function (n) { n.classList.remove('stadiaref-ref-clustered'); });
  var badges = layerAll('.stadiaref-cluster-badge');
  forEachNode(badges, removeOwn);
  // Clear per-owner cluster lists from the previous resolution pass.
  var refs = document.querySelectorAll('[data-ref]');
  forEachNode(refs, function (el) {
    rec(el).cluster = null;
    rec(el).clusterBadge = null;
  });
}

export function addToCluster(ownerEl, memberEl) {
  if (!rec(ownerEl).cluster) rec(ownerEl).cluster = [];
  rec(ownerEl).cluster.push(memberEl);
  // Hide all label variants of the clustered member so it can't
  // collide visually with anything else and can't intercept clicks.
  var nodes = [rec(memberEl).icon, rec(memberEl).tooltip, rec(memberEl).fullLabel, rec(memberEl).link];
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i]) nodes[i].classList.add('stadiaref-ref-clustered');
  }
}

export function renderClusterBadgeIfNeeded(ownerEl) {
  var cluster = rec(ownerEl).cluster;
  if (!cluster || cluster.length === 0) return;
  var anchor = getActiveLabel(ownerEl);
  if (!anchor) return;

  var bgLum = getEffectiveBgLuminance(ownerEl);
  var bgClass = bgLum < 0.40 ? 'stadiaref-on-dark' : 'stadiaref-on-light';

  var badge = document.createElement('span');
  badge.className = 'stadiaref-cluster-badge ' + bgClass;
  badge.textContent = '+' + cluster.length;
  badge.title = cluster.length + ' more ref' + (cluster.length === 1 ? '' : 's') + ' here — hover to expand';

  // Position the badge just to the right of the active label. Both
  // the badge and the active label are absolutely positioned in the
  // owner's slot, so they share a containing block.
  var anchorTop = parseFloat(anchor.style.top || '2');
  var anchorLeft = parseFloat(anchor.style.left || '2');
  var anchorWidth = anchor.getBoundingClientRect().width;
  badge.style.top = anchorTop + 'px';
  badge.style.left = (anchorLeft + anchorWidth + 4) + 'px';

  // Popover with one row per clustered ref. A row click does what a
  // label click does (labelClick): opens the card, or copies.
  var popover = document.createElement('span');
  popover.className = 'stadiaref-cluster-popover';
  for (var i = 0; i < cluster.length; i++) {
    var member = cluster[i];
    var memberRef = member.getAttribute('data-ref');
    var memberCtx = getElementContext(member);
    var row = document.createElement('span');
    row.className = 'stadiaref-cluster-item';
    var tag = document.createElement('span');
    tag.className = 'stadiaref-cluster-item-tag';
    tag.textContent = memberCtx;
    var refSpan = document.createElement('span');
    refSpan.className = 'stadiaref-cluster-item-ref';
    refSpan.textContent = memberRef;
    row.appendChild(tag);
    row.appendChild(refSpan);
    (function (refValue, refEl, rowEl) {
      row.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        labelClick(refEl, refValue, rowEl);
      });
    }(memberRef, member, row));
    popover.appendChild(row);
  }
  badge.appendChild(popover);

  slotFor(ownerEl).appendChild(badge);
  rec(ownerEl).clusterBadge = badge;
}

// ─── Slots ──────────────────────────────────────────────────
// An element's labels live in its slot in the overlay layer (layer.js).
// Before 3.4 they were appended inside the element, which needed
// position: relative on static elements and a sibling host for void
// elements such as <img>, which never render children. The slot needs
// neither.
export function labelHostFor(el) {
  return slotFor(el);
}

// An element is labelled when its label nodes are still in the layer and
// were made for the address it carries now; a reused node can get a new
// address.
export function isLabelled(el) {
  if (!hasRecord(el)) return false;
  var r = rec(el);
  return !!(r.fullLabel && r.fullLabel.isConnected && r.icon && r.icon.isConnected && r.address === el.getAttribute('data-ref'));
}

// Remove an element's label nodes and forget everything about it. Its slot
// goes too, unless an outline frame is still drawn in it.
export function unlabel(el) {
  if (!hasRecord(el)) return;
  var r = rec(el);
  var nodes = [r.link, r.icon, r.tooltip, r.fullLabel, r.clusterBadge, r.groupBadge];
  for (var i = 0; i < nodes.length; i++) {
    removeOwn(nodes[i]);
  }
  dropSlot(el);
  // An outline frame can still be drawn in the slot: keep the slot then,
  // and forget only the labels.
  if (!r.slot) { forget(el); return; }
  var keep = r.slot;
  for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k)) delete r[k];
  r.slot = keep;
}

// The tag a label carries: the tier, or AUTO for an automatic address.
var TIER_TAGS = { section: 'SEC', block: 'BLK', element: 'EL', unclassified: '?' };
var TIER_LETTERS = { section: 'S', block: 'B', element: 'E', unclassified: '?' };

function addressSpan(text) {
  var span = document.createElement('span');
  span.className = 'stadiaref-ref-address';
  span.textContent = text;
  return span;
}

function tagSpan() {
  var span = document.createElement('span');
  span.className = 'stadiaref-ref-tag';
  return span;
}

export function injectLabels() {
  if (!isLive()) return;
  var refs = document.querySelectorAll('[data-ref]');

  forEachNode(refs, function (el) {
    if (isLabelled(el)) return;
    unlabel(el);

    var refValue = el.getAttribute('data-ref');
    var elContext = getElementContext(el);
    var auto = el.hasAttribute('data-stadiaref-auto');

    var refClass = tierOf(el);
    if (refClass === 'unclassified' && typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] unclassified address:', refValue);
    }

    // Adaptive background class
    var lum = getEffectiveBgLuminance(el);
    var bgClass = lum < 0.40 ? 'stadiaref-on-dark' : 'stadiaref-on-light';
    var autoClass = auto ? ' stadiaref-auto' : '';

    var host = labelHostFor(el);
    syncSlotAddress(el);

    var icon = document.createElement('span');
    icon.className = 'stadiaref-ref-icon ' + bgClass + autoClass;
    icon.setAttribute('role', 'button');
    icon.tabIndex = -1;
    icon.title = refValue + ' (click to copy)';
    icon.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      labelClick(el, refValue, icon);
    });
    icon.addEventListener('mouseenter', function () {
      emitAddressEvent('hover', el, refValue, icon);
    });
    icon.addEventListener('mouseleave', function () {
      emitAddressEvent('leave', el, refValue, icon);
    });

    var tooltip = document.createElement('span');
    tooltip.className = 'stadiaref-ref-tooltip ' + bgClass;
    tooltip.appendChild(addressSpan(refValue));
    tooltip.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      labelClick(el, refValue, tooltip);
    });

    var fullLabel = document.createElement('span');
    fullLabel.className = 'stadiaref-ref-full-label ' + bgClass + autoClass;
    fullLabel.appendChild(tagSpan());
    fullLabel.appendChild(addressSpan(refValue));
    fullLabel.title = 'Click to copy: ' + refValue + (elContext ? ' (' + elContext + ')' : '');
    fullLabel.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      labelClick(el, refValue, fullLabel);
    });
    fullLabel.addEventListener('mouseenter', function () {
      emitAddressEvent('hover', el, refValue, fullLabel);
    });
    fullLabel.addEventListener('mouseleave', function () {
      emitAddressEvent('leave', el, refValue, fullLabel);
    });

    var link = document.createElement('span');
    link.className = 'stadiaref-ref-link ' + bgClass;

    host.appendChild(link);
    host.appendChild(icon);
    host.appendChild(tooltip);
    host.appendChild(fullLabel);
    var r = rec(el);
    r.address = refValue;
    r.auto = auto;
    r.icon = icon;
    r.link = link;
    r.tooltip = tooltip;
    r.fullLabel = fullLabel;
    r.depth = getRefDepth(el);
    setLabelOffset(el, getDepthLift(r.depth), r.depth);
    setLabelTier(el, refClass);
  });
  reclassifyLabels();
  // Mark hidden-ancestor refs and add .stadiaref-ref-hidden to their labels so
  // they don't intercept clicks on visible content beneath them.
  applyLabelVisibilityState();
}

// Tiers are recomputed on every survey, because nesting changes as content
// mounts. A duplicated address keeps its normal style and gets one console
// warning per survey.
export function reclassifyLabels() {
  var seen = {};
  var warned = {};
  forEachNode(document.querySelectorAll('[data-ref]'), function (el) {
    var ref = el.getAttribute('data-ref');
    if (seen[ref] && !warned[ref]) {
      warned[ref] = true;
      if (typeof console !== 'undefined' && console.warn) console.warn('[stadiaref] duplicate address on this screen:', ref);
    }
    seen[ref] = true;
    if (!isLabelled(el)) return;
    var tier = tierOf(el);
    if (rec(el).tier !== tier) setLabelTier(el, tier);
  });
}

// Each label node carries its tier, so Show can hide it wherever it is
// mounted.
var TIER_CLASSES = ['stadiaref-tier-section', 'stadiaref-tier-block', 'stadiaref-tier-element', 'stadiaref-tier-unclassified'];

export function setLabelTier(el, tier) {
  var r = rec(el);
  r.tier = tier;
  var nodes = [r.icon, r.tooltip, r.fullLabel, r.link];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (!n) continue;
    for (var j = 0; j < TIER_CLASSES.length; j++) n.classList.remove(TIER_CLASSES[j]);
    n.classList.add('stadiaref-tier-' + tier);
  }
  if (r.icon) r.icon.textContent = TIER_LETTERS[tier];
  if (r.fullLabel) r.fullLabel.firstChild.textContent = r.auto ? 'AUTO' : TIER_TAGS[tier];
}

// The tier recorded for a labelled element at the last survey.
export function recordedTier(el) {
  return hasRecord(el) ? rec(el).tier : undefined;
}
