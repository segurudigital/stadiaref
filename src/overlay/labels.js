import { S } from './state.js';
import { classifyDataRef, clearDataRefClass, normalizeRefClass } from './classify.js';
import { copyRef } from './copy.js';
import { forEachNode, rectsOverlap, toArray } from './dom.js';
import { emitEvent } from './events.js';
import { getElementContext } from './survey.js';
import { applyBlockGroupCollapse, clearBlockGroupCollapse } from './tiers.js';
import { applyLabelVisibilityState, getEffectiveBgLuminance } from './visibility.js';

// Label injection
export const MARKER = '_sdtLabelled';
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
  var icon = el._sdtIcon;
  var link = el._sdtLink;
  var tooltip = el._sdtTooltip;
  var fullLabel = el._sdtFullLabel;

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
    el._sdtDepth = getRefDepth(el);
    setLabelOffset(el, getDepthLift(el._sdtDepth || 0), el._sdtDepth || 0);
  });
}

export function getActiveLabel(el) {
  if (S.presentationMode || S.state === 1) return null;
  return S.state === 2 ? el._sdtFullLabel : el._sdtIcon;
}

export function resolveLabelOverlaps() {
  var refs;
  // placedSlots — array of { rect, owner } for each placed label.
  // `owner` is the [data-ref] element so unplaceable labels can be
  // attached to its cluster.
  var placedSlots = [];

  resetLabelOffsets();
  clearClusters();
  clearBlockGroupCollapse();
  if (S.presentationMode || S.state === 1) return;

  // Block group collapse: sections with >6 direct block children when
  // level filter is All. Must run before the placement loop so collapsed
  // block labels don't consume collision slots.
  if (S.levelFilter === 'all') applyBlockGroupCollapse();

  refs = toArray(document.querySelectorAll('[data-ref]'));
  refs.sort(function (a, b) {
    var pos = a.compareDocumentPosition(b);
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  forEachNode(refs, function (el) {
    // Skip refs hidden by an ancestor (display:none / visibility:hidden /
    // opacity:0). Their labels are display:none via .sdt-ref-hidden, so
    // they shouldn't consume collision slots — otherwise hidden mega-menu
    // labels would push visible labels around.
    if (el._sdtVisible === false) return;

    // Skip block-group-collapsed members — their labels are hidden by CSS
    // and they must not participate in collision detection.
    if (el._sdtBlockGroupMember) return;

    var anchor = getActiveLabel(el);
    var attempt;
    var rect;
    var collisionWith;
    var i;
    var preferredOffset;

    if (!anchor) return;

    preferredOffset = getDepthLift(el._sdtDepth || 0);

    collisionWith = null;
    for (attempt = 0; attempt < LABEL_OFFSET_LIMIT; attempt++) {
      setLabelOffset(el, preferredOffset + (attempt * LABEL_OFFSET_STEP), el._sdtDepth || 0);
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
// `_sdtCluster` list. After resolveLabelOverlaps finishes placing
// every label, owners with non-empty clusters get a "+N" badge
// appended next to their active label; hovering the badge expands a
// small popover listing the clustered refs (each row click-to-copy
// with the same semantics as a normal label). The badge respects
// the same body.sdt-hide / sdt-presentation rules as the labels.

export function clearClusters() {
  var clustered = document.querySelectorAll('.sdt-ref-clustered');
  forEachNode(clustered, function (n) { n.classList.remove('sdt-ref-clustered'); });
  var badges = document.querySelectorAll('.sdt-cluster-badge');
  forEachNode(badges, function (b) { b.parentNode && b.parentNode.removeChild(b); });
  // Clear per-owner cluster lists from the previous resolution pass.
  var refs = document.querySelectorAll('[data-ref]');
  forEachNode(refs, function (el) {
    el._sdtCluster = null;
    el._sdtClusterBadge = null;
  });
}

export function addToCluster(ownerEl, memberEl) {
  if (!ownerEl._sdtCluster) ownerEl._sdtCluster = [];
  ownerEl._sdtCluster.push(memberEl);
  // Hide all label variants of the clustered member so it can't
  // collide visually with anything else and can't intercept clicks.
  var nodes = [memberEl._sdtIcon, memberEl._sdtTooltip, memberEl._sdtFullLabel, memberEl._sdtLink];
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i]) nodes[i].classList.add('sdt-ref-clustered');
  }
}

export function renderClusterBadgeIfNeeded(ownerEl) {
  var cluster = ownerEl._sdtCluster;
  if (!cluster || cluster.length === 0) return;
  var anchor = getActiveLabel(ownerEl);
  if (!anchor) return;

  var bgLum = getEffectiveBgLuminance(ownerEl);
  var bgClass = bgLum < 0.40 ? 'sdt-on-dark' : 'sdt-on-light';

  var badge = document.createElement('span');
  badge.className = 'sdt-cluster-badge ' + bgClass;
  badge.textContent = '+' + cluster.length;
  badge.title = cluster.length + ' more ref' + (cluster.length === 1 ? '' : 's') + ' here — hover to expand';

  // Position the badge just to the right of the active label. Both
  // the badge and the active label are absolutely positioned children
  // of the same owner element, so the badge inherits the same
  // containing block.
  var anchorTop = parseFloat(anchor.style.top || '2');
  var anchorLeft = parseFloat(anchor.style.left || '2');
  var anchorWidth = anchor.getBoundingClientRect().width;
  badge.style.top = anchorTop + 'px';
  badge.style.left = (anchorLeft + anchorWidth + 4) + 'px';

  // Popover with one row per clustered ref. Row click copies the ref
  // value to clipboard via copyRef() and emits the same
  // sdt:dataref-click event that a regular label would.
  var popover = document.createElement('span');
  popover.className = 'sdt-cluster-popover';
  for (var i = 0; i < cluster.length; i++) {
    var member = cluster[i];
    var memberRef = member.getAttribute('data-ref');
    var memberCtx = getElementContext(member);
    var row = document.createElement('span');
    row.className = 'sdt-cluster-item';
    var tag = document.createElement('span');
    tag.className = 'sdt-cluster-item-tag';
    tag.textContent = memberCtx;
    var refSpan = document.createElement('span');
    refSpan.className = 'sdt-cluster-item-ref';
    refSpan.textContent = memberRef;
    row.appendChild(tag);
    row.appendChild(refSpan);
    (function (refValue, refEl, rowEl) {
      row.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
        emitEvent('dataref-click', { dataRef: refValue, element: refEl, current: rowEl });
      });
    }(memberRef, member, row));
    popover.appendChild(row);
  }
  badge.appendChild(popover);

  ownerEl.appendChild(badge);
  ownerEl._sdtClusterBadge = badge;
}

// ─── Void-element label hosts (v2.5.0) ──────────────────────
// Labels are appended as children of the [data-ref] element. Void and
// replaced elements (<img> above all) accept appended nodes in the DOM but
// never render them, so image refs were labelled yet invisible. For those
// tags the labels mount in a sibling <span class="sdt-ref-void-host"> that
// is absolutely positioned over the element's box inside its parent.
export const VOID_HOST_TAGS = { IMG: 1, VIDEO: 1, AUDIO: 1, IFRAME: 1, CANVAS: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, HR: 1, BR: 1, EMBED: 1, OBJECT: 1, svg: 1, SVG: 1 };

export function needsVoidHost(el) {
  return !!VOID_HOST_TAGS[el.tagName];
}

export function syncVoidHost(el) {
  var host = el._sdtHost;
  if (!host || !host.parentNode) return;
  host.style.left = el.offsetLeft + 'px';
  host.style.top = el.offsetTop + 'px';
  host.style.width = Math.max(el.offsetWidth, 20) + 'px';
  host.style.height = Math.max(el.offsetHeight, 20) + 'px';
}

export function syncAllVoidHosts() {
  var hosts = document.querySelectorAll('.sdt-ref-void-host');
  forEachNode(hosts, function (host) {
    var owner = host._sdtOwner;
    if (!owner || !owner.parentNode) { if (host.parentNode) host.parentNode.removeChild(host); return; }
    syncVoidHost(owner);
  });
}

export function labelHostFor(el) {
  if (!needsVoidHost(el)) return el;
  if (el._sdtHost && el._sdtHost.parentNode) return el._sdtHost;
  var parent = el.parentNode;
  if (!parent || parent.nodeType !== 1) return el;
  var host = document.createElement('span');
  host.className = 'sdt-ref-void-host';
  host.setAttribute('data-sdt-host-for', el.getAttribute('data-ref') || '');
  host._sdtOwner = el;
  var pPos = window.getComputedStyle(parent).position;
  if (pPos === 'static') parent.style.position = 'relative';
  parent.insertBefore(host, el.nextSibling);
  el._sdtHost = host;
  syncVoidHost(el);
  return host;
}

export function removeVoidHost(el) {
  var host = el._sdtHost;
  if (host && host.parentNode) host.parentNode.removeChild(host);
  delete el._sdtHost;
}

export function injectLabels() {
  var refs = document.querySelectorAll('[data-ref]');

  forEachNode(refs, function (el) {
    if (el[MARKER]) return;
    el[MARKER] = true;

    var refValue = el.getAttribute('data-ref');
    var elContext = getElementContext(el);

    // Classify by data-ref v5.0 grammar and stamp the class on the
    // element so CSS level-filter rules and block group collapse can
    // target it without re-running the parser.
    var refClass = normalizeRefClass(el.getAttribute('data-sdt-auto-level') || classifyDataRef(refValue));
    clearDataRefClass(el);
    el.classList.add('sdt-ref-class-' + refClass);
    if (refClass === 'unclassified' && typeof console !== 'undefined' && console.warn) {
      console.warn('[seguru-debug-toolbar] unclassified data-ref:', refValue);
    }

    // Adaptive background class
    var lum = getEffectiveBgLuminance(el);
    var bgClass = lum < 0.40 ? 'sdt-on-dark' : 'sdt-on-light';

    var host = labelHostFor(el);
    if (host === el) {
      var pos = window.getComputedStyle(el).position;
      if (pos === 'static') el.style.position = 'relative';
    }

    var icon = document.createElement('span');
    icon.className = 'sdt-ref-icon ' + bgClass;
    icon.textContent = '\u24D8';
    icon.title = elContext + ' \u00B7 ' + refValue + ' (click to copy)';
    icon.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      copyRef(refValue);
      emitEvent('dataref-click', { dataRef: refValue, element: el, current: icon });
    });
    icon.addEventListener('mouseenter', function () {
      emitEvent('dataref-hover', { dataRef: refValue, element: el, current: icon });
    });
    icon.addEventListener('mouseleave', function () {
      emitEvent('dataref-leave', { dataRef: refValue, element: el, current: icon });
    });

    var tooltip = document.createElement('span');
    tooltip.className = 'sdt-ref-tooltip ' + bgClass;
    tooltip.innerHTML = '<span class="sdt-ref-tag">' + elContext + '</span> \u00B7 ' + refValue;
    tooltip.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      copyRef(refValue);
      emitEvent('dataref-click', { dataRef: refValue, element: el, current: tooltip });
    });

    var fullLabel = document.createElement('span');
    fullLabel.className = 'sdt-ref-full-label ' + bgClass;
    fullLabel.innerHTML = '<span class="sdt-ref-tag">' + elContext + '</span> \u00B7 ' + refValue;
    fullLabel.title = 'Click to copy: ' + refValue;
    fullLabel.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      copyRef(refValue);
      emitEvent('dataref-click', { dataRef: refValue, element: el, current: fullLabel });
    });
    fullLabel.addEventListener('mouseenter', function () {
      emitEvent('dataref-hover', { dataRef: refValue, element: el, current: fullLabel });
    });
    fullLabel.addEventListener('mouseleave', function () {
      emitEvent('dataref-leave', { dataRef: refValue, element: el, current: fullLabel });
    });

    var link = document.createElement('span');
    link.className = 'sdt-ref-link ' + bgClass;

    host.appendChild(link);
    host.appendChild(icon);
    host.appendChild(tooltip);
    host.appendChild(fullLabel);
    el._sdtIcon = icon;
    el._sdtLink = link;
    el._sdtTooltip = tooltip;
    el._sdtFullLabel = fullLabel;
    el._sdtDepth = getRefDepth(el);
    setLabelOffset(el, getDepthLift(el._sdtDepth), el._sdtDepth);
  });
  // Mark hidden-ancestor refs and add .sdt-ref-hidden to their labels so
  // they don't intercept clicks on visible content beneath them.
  applyLabelVisibilityState();
}
