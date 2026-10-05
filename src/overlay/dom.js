import { S } from './state.js';

export function forEachNode(nodeList, callback) {
  var i;
  for (i = 0; i < nodeList.length; i++) {
    callback(nodeList[i], i);
  }
}

export function toArray(nodeList) {
  var arr = [];
  forEachNode(nodeList, function (node) {
    arr.push(node);
  });
  return arr;
}

export function arrayContainsNode(nodes, target) {
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i] === target) return true;
  }
  return false;
}

export function setClassState(el, className, enabled) {
  if (enabled) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}

export function rectsOverlap(a, b, gap) {
  return !(a.right + gap <= b.left || a.left >= b.right + gap || a.bottom + gap <= b.top || a.top >= b.bottom + gap);
}

export function closestMatch(el, selector) {
  while (el && el !== S.shadowHost && el !== document && el.nodeType === 1) {
    if (matchesSelector(el, selector)) return el;
    el = el.parentElement;
  }
  return null;
}

export function matchesSelector(el, selector) {
  var matcher = el.matches || el.msMatchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector;
  if (!matcher) return false;
  return matcher.call(el, selector);
}
