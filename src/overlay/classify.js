import { S } from './state.js';
import { classify, hasProfile, DEFAULT_PROFILE } from '../core/index.js';

// The overlay's side of the address grammar. All classification goes
// through stadiaref/core with the active profile.

export function clearDataRefClass(el) {
  var classNames = [
    'stadiaref-ref-class-section',
    'stadiaref-ref-class-block',
    'stadiaref-ref-class-element',
    'stadiaref-ref-class-unclassified'
  ];
  for (var i = 0; i < classNames.length; i++) {
    el.classList.remove(classNames[i]);
  }
}

export function normalizeRefClass(refClass) {
  return (
    refClass === 'section' ||
    refClass === 'block' ||
    refClass === 'element' ||
    refClass === 'unclassified'
  ) ? refClass : 'unclassified';
}

// The profile in use: the one selected, or generic while that one isn't
// registered yet.
export function activeProfile() {
  return hasProfile(S.profile) ? S.profile : DEFAULT_PROFILE;
}

function isAuthored(el) {
  return el.hasAttribute('data-ref') && !el.hasAttribute('data-stadiaref-auto');
}

// Nesting context for the generic and app profiles. Counts authored
// addresses only: an automatic address never counts as an ancestor or a
// child, so switching auto-address on can't change an authored tier.
export function contextOf(el) {
  var depth = 0;
  for (var a = el.parentElement; a; a = a.parentElement) {
    if (isAuthored(a)) depth++;
  }
  return { depth: depth, hasAddressedChildren: !!el.querySelector('[data-ref]:not([data-stadiaref-auto])') };
}

// The tier a label shows for an addressed element: the automatic tier when
// StadiaRef stamped the address, otherwise the active profile's answer.
export function tierOf(el) {
  var auto = el.getAttribute('data-stadiaref-auto-tier');
  if (auto) return normalizeRefClass(auto);
  return classify(el.getAttribute('data-ref'), { profile: activeProfile(), context: contextOf(el) });
}

// The first element on the page that carries `address`, or null.
export function findAddressed(address) {
  var all = document.querySelectorAll('[data-ref]');
  for (var i = 0; i < all.length; i++) {
    if (all[i].getAttribute('data-ref') === address) return all[i];
  }
  return null;
}

// classify() on the API: the active profile, with context from the first
// element carrying the address. Under a nesting profile an address that
// isn't on the page has no context, so it is 'unclassified'.
export function classifyAddress(address) {
  var el = typeof address === 'string' && typeof document !== 'undefined' ? findAddressed(address) : null;
  return classify(address, { profile: activeProfile(), context: el ? contextOf(el) : undefined });
}
