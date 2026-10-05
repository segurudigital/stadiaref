import { S } from './state.js';
import { DEPTH_LABELS, OUTLINE_LABELS } from './constants.js';
import { copyRef } from './copy.js';
import { forEachNode, setClassState, toArray } from './dom.js';
import { getElementContext } from './survey.js';

export function clearTreeJumpHighlight() {
  if (S.treeJumpTimer) {
    clearTimeout(S.treeJumpTimer);
    S.treeJumpTimer = null;
  }
  if (S.treeJumpTarget) {
    S.treeJumpTarget.classList.remove('stadiaref-tree-jump-highlight');
    S.treeJumpTarget = null;
  }
}

export function clearTreeHoverHighlights() {
  var highlighted = document.querySelectorAll('.stadiaref-tree-highlight');
  forEachNode(highlighted, function (el) {
    el.classList.remove('stadiaref-tree-highlight');
  });
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
  target.classList.add('stadiaref-tree-jump-highlight');
  S.treeJumpTarget = target;
  S.treeJumpTimer = setTimeout(function () {
    if (S.treeJumpTarget) S.treeJumpTarget.classList.remove('stadiaref-tree-jump-highlight');
    S.treeJumpTarget = null;
    S.treeJumpTimer = null;
  }, 1400);
}

export function buildTreePanel() {
  var refs = toArray(document.querySelectorAll('[data-ref]'));
  var depthLabel = S.autoRefEnabled ? (DEPTH_LABELS[S.autoRefDepth] || 'All') : 'Off';
  var outlineLabel = OUTLINE_LABELS[S.outlineMode] || 'Off';

  clearTreeHoverHighlights();

  refs.sort(function (a, b) {
    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  var header = document.createElement('div');
  header.className = 'stadiaref-tree-panel__header';
  var headerMain = document.createElement('div');
  headerMain.className = 'stadiaref-tree-panel__header-main';
  var titleWrap = document.createElement('div');
  titleWrap.className = 'stadiaref-tree-panel__title-wrap';
  var title = document.createElement('span');
  title.className = 'stadiaref-tree-panel__title';
  title.textContent = 'Address tree';
  var meta = document.createElement('div');
  meta.className = 'stadiaref-tree-panel__meta';
  var countMeta = document.createElement('span');
  countMeta.className = 'stadiaref-tree-panel__meta-item';
  countMeta.textContent = refs.length + (refs.length === 1 ? ' address' : ' addresses');
  var depthMeta = document.createElement('span');
  depthMeta.className = 'stadiaref-tree-panel__meta-item';
  depthMeta.textContent = 'Depth: ' + depthLabel;
  var outlineMeta = document.createElement('span');
  outlineMeta.className = 'stadiaref-tree-panel__meta-item';
  outlineMeta.textContent = 'Outline: ' + outlineLabel;
  meta.appendChild(countMeta);
  meta.appendChild(depthMeta);
  meta.appendChild(outlineMeta);
  titleWrap.appendChild(title);
  titleWrap.appendChild(meta);
  var closeBtn = document.createElement('button');
  closeBtn.className = 'stadiaref-tree-panel__close';
  closeBtn.type = 'button';
  closeBtn.textContent = '\u00D7';
  closeBtn.title = 'Close tree panel';
  closeBtn.addEventListener('click', function () { toggleTree(); });
  headerMain.appendChild(titleWrap);
  headerMain.appendChild(closeBtn);
  header.appendChild(headerMain);
  var hint = document.createElement('div');
  hint.className = 'stadiaref-tree-panel__hint';
  hint.textContent = refs.length ? 'Hover to preview the target. Click a row to jump to it.' : 'Select a depth to begin.';
  header.appendChild(hint);

  var body = document.createElement('div');
  body.className = 'stadiaref-tree-panel__body';

  if (refs.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'stadiaref-tree-empty';
    empty.textContent = 'No addresses on this screen yet.';
    body.appendChild(empty);
  } else {
    forEachNode(refs, function (el) {
      var depth = 0;
      var ancestor = el.parentElement;
      while (ancestor) {
        if (ancestor.hasAttribute('data-ref')) depth++;
        ancestor = ancestor.parentElement;
      }

      var row = document.createElement('div');
      row.className = 'stadiaref-tree-row';
      row.tabIndex = 0;
      row.title = 'Jump to ' + el.getAttribute('data-ref');

      var gutter = document.createElement('div');
      gutter.className = 'stadiaref-tree-gutter';

      for (var i = 0; i < depth; i++) {
        var indent = document.createElement('span');
        indent.className = 'stadiaref-tree-indent';
        gutter.appendChild(indent);
      }

      row.appendChild(gutter);

      var content = document.createElement('div');
      content.className = 'stadiaref-tree-content';

      var tag = document.createElement('span');
      tag.className = 'stadiaref-tree-tag';
      tag.textContent = getElementContext(el);

      var ref = document.createElement('span');
      ref.className = 'stadiaref-tree-ref';
      ref.textContent = el.getAttribute('data-ref');
      ref.title = el.getAttribute('data-ref');

      var copyBtn = document.createElement('button');
      copyBtn.className = 'stadiaref-tree-copy';
      copyBtn.textContent = '\u2398';
      copyBtn.title = 'Copy address';
      (function (refVal) {
        copyBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          copyRef(refVal);
        });
      }(el.getAttribute('data-ref')));

      (function (target) {
        row.addEventListener('mouseenter', function () {
          target.classList.add('stadiaref-tree-highlight');
          row.classList.add('stadiaref-tree-row--active');
        });
        row.addEventListener('mouseleave', function () {
          target.classList.remove('stadiaref-tree-highlight');
          row.classList.remove('stadiaref-tree-row--active');
        });
        row.addEventListener('focus', function () {
          target.classList.add('stadiaref-tree-highlight');
          row.classList.add('stadiaref-tree-row--active');
        });
        row.addEventListener('blur', function () {
          target.classList.remove('stadiaref-tree-highlight');
          row.classList.remove('stadiaref-tree-row--active');
        });
        row.addEventListener('click', function () {
          jumpToTreeTarget(target);
        });
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            jumpToTreeTarget(target);
          }
        });
      }(el));

      content.appendChild(tag);
      content.appendChild(ref);
      row.appendChild(content);
      row.appendChild(copyBtn);
      body.appendChild(row);
    });
  }

  S.treePanel.innerHTML = '';
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
    var treeValue = treeBtn.querySelector('.stadiaref-toolbar__value');
    if (treeValue) treeValue.textContent = S.treeOpen ? '\u229F Tree' : '\u229E Tree';
    setClassState(treeBtn, 'stadiaref-toolbar__select--active', S.treeOpen);
  }
}
