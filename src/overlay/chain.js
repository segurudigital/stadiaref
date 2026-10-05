import { S } from './state.js';
import { classifyDataRef } from './classify.js';
import { copyRef } from './copy.js';
import { emitEvent } from './events.js';

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
        refClass: classifyDataRef(cur.getAttribute('data-ref')),
        current: false
      });
    }
    cur = cur.parentElement;
  }
  chain.push({
    el: el,
    ref: el.getAttribute('data-ref'),
    refClass: classifyDataRef(el.getAttribute('data-ref')),
    current: true
  });
  return chain;
}

export function buildActiveRefTree(dataRef, el) {
  var chain = buildRefBreadcrumb(el);
  S.activeRefTree.innerHTML = '';

  var header = document.createElement('div');
  header.className = 'sdt-active-ref-tree__header';
  var titleEl = document.createElement('span');
  titleEl.className = 'sdt-active-ref-tree__title';
  titleEl.textContent = 'Context';
  var pinBtn = document.createElement('button');
  pinBtn.type = 'button';
  pinBtn.className = 'sdt-active-ref-tree__pin' + (S.activeRefTreePinned ? ' sdt-active-ref-tree__pin--active' : '');
  pinBtn.title = S.activeRefTreePinned ? 'Unpin' : 'Pin open';
  pinBtn.textContent = '\u{1F4CC}';
  pinBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    S.activeRefTreePinned = !S.activeRefTreePinned;
    pinBtn.classList.toggle('sdt-active-ref-tree__pin--active', S.activeRefTreePinned);
    pinBtn.title = S.activeRefTreePinned ? 'Unpin' : 'Pin open';
  });
  header.appendChild(titleEl);
  header.appendChild(pinBtn);
  S.activeRefTree.appendChild(header);

  var rowsEl = document.createElement('div');
  rowsEl.className = 'sdt-active-ref-tree__rows';
  for (var i = 0; i < chain.length; i++) {
    var item = chain[i];
    var row = document.createElement('div');
    row.className = 'sdt-active-ref-tree__row' + (item.current ? ' sdt-active-ref-tree__row--current' : '');
    row.title = 'Click to copy: ' + item.ref;
    var classLabel = document.createElement('span');
    classLabel.className = 'sdt-active-ref-tree__row-class';
    classLabel.textContent = item.refClass;
    var refLabel = document.createElement('span');
    refLabel.className = 'sdt-active-ref-tree__row-ref';
    refLabel.textContent = item.ref;
    row.appendChild(classLabel);
    row.appendChild(refLabel);
    (function (refVal, refEl) {
      row.addEventListener('click', function (e) {
        e.stopPropagation();
        copyRef(refVal);
        emitEvent('dataref-click', { dataRef: refVal, element: refEl, current: row });
      });
    }(item.ref, item.el));
    rowsEl.appendChild(row);
  }
  S.activeRefTree.appendChild(rowsEl);
}

export function showActiveRefTree(detail) {
  if (S.activeRefTreeHideTimer) {
    clearTimeout(S.activeRefTreeHideTimer);
    S.activeRefTreeHideTimer = null;
  }
  if (!detail || !detail.element || !detail.element.getAttribute('data-ref')) return;
  buildActiveRefTree(detail.dataRef, detail.element);
  S.activeRefTree.classList.add('sdt-active-ref-tree--open');
  S.activeRefTreeOpen = true;
}

export function hideActiveRefTree() {
  if (S.activeRefTreePinned) return;
  S.activeRefTreeHideTimer = setTimeout(function () {
    S.activeRefTree.classList.remove('sdt-active-ref-tree--open');
    S.activeRefTreeOpen = false;
    S.activeRefTreeHideTimer = null;
  }, 120);
}

export function dismissActiveRefTree() {
  S.activeRefTreePinned = false;
  S.activeRefTree.classList.remove('sdt-active-ref-tree--open');
  S.activeRefTreeOpen = false;
  if (S.activeRefTreeHideTimer) {
    clearTimeout(S.activeRefTreeHideTimer);
    S.activeRefTreeHideTimer = null;
  }
}
