import { S } from './state.js';

// ─── Per-element records ─────────────────────────────────────
// What StadiaRef knows about a page element (its label nodes, tier, nesting
// depth, cluster, visibility) lives here, keyed by the element in a
// WeakMap, never on the element itself. A framework that rewrites an
// element's className or attributes can't wipe it, and nothing is left
// behind when the element goes.
export function rec(el) {
  var r = S.records.get(el);
  if (!r) {
    r = {};
    S.records.set(el, r);
  }
  return r;
}

export function hasRecord(el) {
  return S.records.has(el);
}

export function forget(el) {
  S.records.delete(el);
}

// Remove one of StadiaRef's own nodes from the page. The watcher (watch.js)
// ignores removals made this way; a label node removed any other way was
// removed by the host page, and the element is relabelled.
export function removeOwn(node) {
  if (!node || !node.parentNode) return;
  S.selfRemoved.add(node);
  node.parentNode.removeChild(node);
}
