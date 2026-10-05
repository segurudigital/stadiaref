import { S } from './state.js';
import { OUTLINE_LABELS } from './constants.js';
import { tierOf } from './classify.js';
import { TAGS } from './styles/tokens.js';
import { showText } from './tiers.js';
import { copyAddress } from './copy.js';
import { forEachNode, setClassState, toArray } from './dom.js';
import { highlight, placeHighlights, unhighlight } from './highlight.js';

export function clearTreeJumpHighlight() {
  if (S.treeJumpTimer) {
    clearTimeout(S.treeJumpTimer);
    S.treeJumpTimer = null;
  }
  unhighlight('jump');
}

export function clearTreeHoverHighlights() {
  unhighlight('hover');
  if (S.treePanel) {
    forEachNode(S.treePanel.querySelectorAll('.stadiaref-tree-row--active'), function (row) {
      row.classList.remove('stadiaref-tree-row--active');
    });
  }
}

export function jumpToTreeTarget(target) {
  clearTreeJumpHighlight();
  try {
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  } catch (err) {
    target.scrollIntoView();
  }
  highlight('jump', target);
  // Smooth scrolling moves the element; keep the frame on it.
  var started = Date.now();
  (function follow() {
    placeHighlights();
    if (Date.now() - started < 600) requestAnimationFrame(follow);
  })();
  S.treeJumpTimer = setTimeout(function () {
    unhighlight('jump');
    S.treeJumpTimer = null;
  }, 1400);
}

var CLOSE_SVG = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>';
var COPY_SVG = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>';

// A tier tag: SEC, BLK, EL or ?, or AUTO for an automatic address.
export function tierTag(el) {
  var tier = tierOf(el);
  var auto = el.hasAttribute('data-stadiaref-auto');
  var tag = document.createElement('span');
  tag.className = 'stadiaref-tag stadiaref-tag--' + tier + (auto ? ' stadiaref-tag--auto' : '');
  tag.textContent = auto ? 'AUTO' : TAGS[tier].tag;
  return tag;
}

function el(tag, className, text) {
  var n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function buildTreePanel() {
  var refs = toArray(document.querySelectorAll('[data-ref]'));
  var outlineLabel = OUTLINE_LABELS[S.outlineMode] || 'Off';

  clearTreeHoverHighlights();

  refs.sort(function (a, b) {
    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  var header = el('div', 'stadiaref-tree-panel__header');
  var headerMain = el('div', 'stadiaref-tree-panel__header-main');
  var titleWrap = el('div', 'stadiaref-tree-panel__title-wrap');
  titleWrap.appendChild(el('span', 'stadiaref-tree-panel__title', 'Address tree'));
  var count = el('span', 'stadiaref-tree-panel__count', String(refs.length));
  count.setAttribute('aria-label', refs.length + (refs.length === 1 ? ' address' : ' addresses'));
  titleWrap.appendChild(count);
  var closeBtn = el('button', 'stadiaref-tree-panel__close');
  closeBtn.type = 'button';
  closeBtn.innerHTML = CLOSE_SVG;
  closeBtn.setAttribute('aria-label', 'Close tree panel');
  closeBtn.addEventListener('click', function () { toggleTree(); });
  headerMain.appendChild(titleWrap);
  headerMain.appendChild(closeBtn);
  header.appendChild(headerMain);
  var meta = el('div', 'stadiaref-tree-panel__meta');
  meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Show ' + showText()));
  meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Auto-address ' + (S.autoRefEnabled ? 'on' : 'off')));
  meta.appendChild(el('span', 'stadiaref-tree-panel__meta-item', 'Outline ' + outlineLabel));
  header.appendChild(meta);
  header.appendChild(el('div', 'stadiaref-tree-panel__hint', refs.length
    ? 'Hover a row to find it on the page. Click to jump there.'
    : 'Add data-ref attributes, or turn on auto-address.'));

  var body = el('div', 'stadiaref-tree-panel__body');

  if (refs.length === 0) {
    body.appendChild(el('div', 'stadiaref-tree-empty', 'No addresses on this screen yet.'));
  } else {
    forEachNode(refs, function (target) {
      var depth = 0;
      for (var ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.hasAttribute('data-ref')) depth++;
      }
      var address = target.getAttribute('data-ref');

      var row = el('div', 'stadiaref-tree-row');
      row.tabIndex = 0;
      row.title = 'Jump to ' + address;
      row.style.paddingLeft = (12 + depth * 18) + 'px';
      row.appendChild(tierTag(target));

      var ref = el('span', 'stadiaref-tree-ref', address);
      row.appendChild(ref);

      var copyBtn = el('button', 'stadiaref-tree-copy');
      copyBtn.type = 'button';
      copyBtn.innerHTML = COPY_SVG;
      copyBtn.setAttribute('aria-label', 'Copy ' + address);
      copyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        copyAddress(target, address, copyBtn, 'tree');
      });
      row.appendChild(copyBtn);

      row.addEventListener('mouseenter', function () {
        highlight('hover', target);
        row.classList.add('stadiaref-tree-row--active');
      });
      row.addEventListener('mouseleave', function () {
        unhighlight('hover');
        row.classList.remove('stadiaref-tree-row--active');
      });
      row.addEventListener('focus', function () {
        highlight('hover', target);
        row.classList.add('stadiaref-tree-row--active');
      });
      row.addEventListener('blur', function () {
        unhighlight('hover');
        row.classList.remove('stadiaref-tree-row--active');
      });
      row.addEventListener('click', function () {
        jumpToTreeTarget(target);
      });
      row.addEventListener('keydown', function (e) {
        if (e.target !== row) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          jumpToTreeTarget(target);
        }
      });
      body.appendChild(row);
    });
  }

  S.treePanel.innerHTML = '';
  S.treePanel.setAttribute('role', 'dialog');
  S.treePanel.setAttribute('aria-label', 'Address tree');
  S.treePanel.appendChild(header);
  S.treePanel.appendChild(body);
}

export function toggleTree() {
  S.treeOpen = !S.treeOpen;
  setClassState(S.treePanel, 'stadiaref-tree-panel--open', S.treeOpen);
  if (S.treeOpen) buildTreePanel();
  else {
    clearTreeJumpHighlight();
    clearTreeHoverHighlights();
  }
  var treeBtn = S.toolbar.querySelector('[data-stadiaref-toggle-tree]');
  if (treeBtn) {
    treeBtn.setAttribute('aria-pressed', S.treeOpen ? 'true' : 'false');
  }
}
