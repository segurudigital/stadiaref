import { S } from './state.js';
import { tierOf } from './classify.js';
import { copyAddress } from './copy.js';

import { tierTag } from './tree.js';

// Active-ref tree panel functions.
// Walk the DOM upwards from el to collect [data-ref] ancestors, then
// include el. Returns an array in document order (outermost first).
export function buildRefBreadcrumb(el) {
  var chain = [];
  var cur = el.parentElement;
  while (cur) {
    if (cur.hasAttribute && cur.hasAttribute('data-ref')) {
      chain.unshift({
        el: cur,
        ref: cur.getAttribute('data-ref'),
        refClass: tierOf(cur),
        current: false
      });
    }
    cur = cur.parentElement;
  }
  chain.push({
    el: el,
    ref: el.getAttribute('data-ref'),
    refClass: tierOf(el),
    current: true
  });
  return chain;
}

var PIN_SVG = '<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M8 3h8l-1 7 3 4H6l3-4z"></path></svg>';

function pinState(pinBtn) {
  var on = S.activeRefTreePinned;
  pinBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  pinBtn.setAttribute('aria-label', on ? 'Unpin address chain' : 'Pin address chain');
  pinBtn.lastChild.textContent = on ? 'Pinned' : 'Pin';
}

function chainRow(item, depth) {
  var row = document.createElement('button');
  row.type = 'button';
  row.className = 'stadiaref-active-ref-tree__row' + (item.current ? ' stadiaref-active-ref-tree__row--current' : '');
  row.style.paddingLeft = (12 + depth * 14) + 'px';
  row.title = 'Copy ' + item.ref;
  if (item.current) row.setAttribute('aria-current', 'true');
  row.appendChild(tierTag(item.el));
  var refLabel = document.createElement('span');
  refLabel.className = 'stadiaref-active-ref-tree__row-ref';
  refLabel.textContent = item.ref;
  row.appendChild(refLabel);
  row.addEventListener('click', function (e) {
    e.stopPropagation();
    copyAddress(item.el, item.ref, row, 'label');
  });
  return row;
}

export function buildActiveRefTree(dataRef, el) {
  var chain = buildRefBreadcrumb(el);
  S.activeRefTree.innerHTML = '';
  S.activeRefTree.setAttribute('role', 'dialog');
  S.activeRefTree.setAttribute('aria-label', 'Address chain');

  var header = document.createElement('div');
  header.className = 'stadiaref-active-ref-tree__header';
  var titleEl = document.createElement('span');
  titleEl.className = 'stadiaref-active-ref-tree__title';
  titleEl.textContent = 'Address chain';
  var pinBtn = document.createElement('button');
  pinBtn.type = 'button';
  pinBtn.className = 'stadiaref-active-ref-tree__pin';
  pinBtn.innerHTML = PIN_SVG + '<span></span>';
  pinState(pinBtn);
  pinBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    S.activeRefTreePinned = !S.activeRefTreePinned;
    pinState(pinBtn);
  });
  header.appendChild(titleEl);
  header.appendChild(pinBtn);
  S.activeRefTree.appendChild(header);

  var rowsEl = document.createElement('div');
  rowsEl.className = 'stadiaref-active-ref-tree__rows';
  for (var i = 0; i < chain.length; i++) rowsEl.appendChild(chainRow(chain[i], i));
  S.activeRefTree.appendChild(rowsEl);
}

export function showActiveRefTree(detail) {
  if (S.activeRefTreeHideTimer) {
    clearTimeout(S.activeRefTreeHideTimer);
    S.activeRefTreeHideTimer = null;
  }
  if (!detail || !detail.element || !detail.element.getAttribute('data-ref')) return;
  buildActiveRefTree(detail.dataRef, detail.element);
  S.activeRefTree.classList.add('stadiaref-active-ref-tree--open');
  S.activeRefTreeOpen = true;
}

export function hideActiveRefTree() {
  if (S.activeRefTreePinned) return;
  S.activeRefTreeHideTimer = setTimeout(function () {
    S.activeRefTree.classList.remove('stadiaref-active-ref-tree--open');
    S.activeRefTreeOpen = false;
    S.activeRefTreeHideTimer = null;
  }, 120);
}

export function dismissActiveRefTree() {
  S.activeRefTreePinned = false;
  S.activeRefTree.classList.remove('stadiaref-active-ref-tree--open');
  S.activeRefTreeOpen = false;
  if (S.activeRefTreeHideTimer) {
    clearTimeout(S.activeRefTreeHideTimer);
    S.activeRefTreeHideTimer = null;
  }
}
