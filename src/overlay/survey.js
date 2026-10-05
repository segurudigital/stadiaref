import { S } from './state.js';
import { MAX_LENGTH } from '../core/index.js';
import { arrayContainsNode, forEachNode, matchesSelector } from './dom.js';
import { unlabel } from './labels.js';
import { isLive } from './mount.js';

// ─── Class-to-Ref Converter ─────────────────────────────────
export function convertClassRefs() {
  if (!S.classConverterEnabled) return;
  var els = document.querySelectorAll('[class*="dataref-"]');
  forEachNode(els, function (el) {
    if (el.getAttribute('data-ref')) return;
    var classes = el.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf('dataref-') === 0) {
        el.setAttribute('data-ref', classes[i].replace('dataref-', ''));
        break;
      }
    }
  });
}


// ─── Auto-Ref ──────────────────────────────────────────────
export const SELECTORS_SECTION = [
  '.e-con:not(.e-con .e-con)',
  'section.brxe-section',
  '.brxe-container:not(.brxe-container .brxe-container)',
  '.ct-section',
  '.breakdance-section',
  'body > section, main > section, [role="main"] > section',
  '#content > section, .site-content > section, .page-content > section',
  '#content > div > section'
];

// Block-level selectors (containers / widgets) — does NOT include section
// selectors so that "Blocks" target shows only blocks, not sections too.
export const SELECTORS_BLOCK_ONLY = [
  '.e-con .e-con',
  '[class*="elementor-widget-"]',
  '.brxe-block', '.brxe-div',
  '[class*="brxe-"]:not(section)',
  '.ct-div', '.ct-column',
  '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
  '.breakdance-column',
  '[class*="breakdance-"]:not([class*="breakdance-section"])',
  'article', 'aside', 'nav',
  '.wp-block-group', '.wp-block-column', '.wp-block-columns',
  '.wp-block-cover', '.wp-block-media-text',
  '[class*="wp-block-"]'
];

// Element-level selectors (leaf / inline content) — does NOT include section
// or block selectors so that "Elements" target shows only leaf items.
export const SELECTORS_ELEMENT_ONLY = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'blockquote', 'figure', 'figcaption', 'img', 'video', 'audio',
  'a[href]', 'button', 'input', 'select', 'textarea',
  'form', 'table', 'ul', 'ol', 'dl',
  'article', 'aside', 'nav', 'header', 'footer',
  'details', 'summary', 'label', 'legend',
  '[class*="elementor-widget-"]',
  '[class*="brxe-"]',
  '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
  '.ct-link-text', '.ct-video', '.ct-icon', '.ct-fancy-image',
  '[class*="breakdance-"]'
];

// "All" — every level combined (the previous "element" accumulated behaviour).
export const SELECTORS_ALL = SELECTORS_SECTION.concat(SELECTORS_BLOCK_ONLY).concat(SELECTORS_ELEMENT_ONLY);

export const AUTO_REF_DEPTH_MAP = {
  'section': SELECTORS_SECTION,
  'block':   SELECTORS_BLOCK_ONLY,
  'element': SELECTORS_ELEMENT_ONLY,
  'all':     SELECTORS_ALL
};

export function matchesSelectorList(el, selectorList) {
  for (var i = 0; i < selectorList.length; i++) {
    if (matchesSelector(el, selectorList[i])) return true;
  }
  return false;
}

export function getAutoRefLevel(el, depthMode) {
  if (depthMode === 'section' || depthMode === 'block' || depthMode === 'element') return depthMode;
  if (matchesSelectorList(el, SELECTORS_SECTION)) return 'section';
  if (matchesSelectorList(el, SELECTORS_BLOCK_ONLY)) return 'block';
  if (matchesSelectorList(el, SELECTORS_ELEMENT_ONLY)) return 'element';
  return 'unclassified';
}

export function collectTargetsByDepth(depthMode) {
  var selectorList = AUTO_REF_DEPTH_MAP[depthMode] || SELECTORS_SECTION;
  var candidates = document.querySelectorAll(selectorList.join(', '));
  var targets = [];

  forEachNode(candidates, function (el) {
    if (arrayContainsNode(targets, el)) return;
    if (depthMode !== 'section') {
      targets.push(el);
    } else {
      var dominated = false;
      for (var j = 0; j < targets.length; j++) {
        if (targets[j].contains(el)) { dominated = true; break; }
      }
      if (!dominated) targets.push(el);
    }
  });

  targets.sort(function (a, b) {
    var pos = a.compareDocumentPosition(b);
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  return targets;
}

export const SEMANTIC_TAGS = ['h1','h2','h3','h4','h5','h6','p','blockquote','img','video','audio','button','a','input','select','textarea','form','table','ul','ol','dl','nav','article','aside','header','footer','figure','figcaption','details','summary','label','legend','section'];

export function getElementContext(el) {
  var tag = el.tagName.toLowerCase();
  if (SEMANTIC_TAGS.indexOf(tag) !== -1) return tag;

  var heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) return heading.tagName.toLowerCase();

  var content = el.querySelector('img, video, audio, button, a, p, form, table, blockquote, figure');
  if (content) return content.tagName.toLowerCase();

  var cls = el.className || '';
  var eMatch = cls.match(/elementor-widget-([\w-]+)/);
  if (eMatch) return eMatch[1];
  var bMatch = cls.match(/brxe-([\w-]+)/);
  if (bMatch) return bMatch[1];
  var oMatch = cls.match(/ct-([\w-]+)/);
  if (oMatch) return oMatch[1];
  var dMatch = cls.match(/breakdance-([\w-]+)/);
  if (dMatch && dMatch[1] !== 'section' && dMatch[1] !== 'column') return dMatch[1];
  var gMatch = cls.match(/wp-block-([\w-]+)/);
  if (gMatch) return gMatch[1];

  return tag;
}

export function getPageSlug() {
  // Allow manual override
  if (S.config.pageSlug) return S.config.pageSlug;

  var path = window.location.pathname;

  if (window.location.protocol === 'file:') {
    var filename = path.split('/').pop() || '';
    var slug = filename
      .replace(/-wireframe-lf\.html$/i, '')
      .replace(/-wireframe-hf\.html$/i, '')
      .replace(/-wireframe\.html$/i, '')
      .replace(/\.html$/i, '');
    return slug || 'home';
  }

  path = path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return path || 'home';
}

// Lower-case a-z, digits and single hyphens, as the core rules require.
export function sanitizeAddressPart(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// A new automatic address: <slug>-<NN>-<what it is>. Numbers come from a
// counter that only goes up, so an address is never minted twice in a page
// view, and a number is skipped if an address on the page already uses it.
function mintAutoAddress(el) {
  var slug = sanitizeAddressPart(getPageSlug()) || 'home';
  var what = sanitizeAddressPart(getElementContext(el)) || 'el';
  var taken = {};
  forEachNode(document.querySelectorAll('[data-ref]'), function (n) { taken[n.getAttribute('data-ref')] = true; });
  var address;
  do {
    S.autoCounter++;
    var num = String(S.autoCounter);
    if (num.length < 2) num = '0' + num;
    var tail = '-' + num + '-' + what;
    address = slug.slice(0, MAX_LENGTH - tail.length).replace(/-+$/, '') + tail;
  } while (taken[address]);
  return address;
}

// Stamp an automatic address on every target without one. An element keeps
// the address it was first given for as long as it is in the DOM, through
// every survey and every switch of auto-address.
export function autoRefSections() {
  if (!S.autoRefEnabled || !isLive()) return;
  var targets = collectTargetsByDepth(S.autoRefDepth);

  for (var i = 0; i < targets.length; i++) {
    var el = targets[i];
    if (!el.getAttribute('data-ref')) {
      var address = S.autoAddresses.get(el);
      if (!address) {
        address = mintAutoAddress(el);
        S.autoAddresses.set(el, address);
      }
      el.setAttribute('data-ref', address);
      el.setAttribute('data-stadiaref-auto', '1');
      el.setAttribute('data-stadiaref-auto-tier', getAutoRefLevel(el, S.autoRefDepth));
    }
  }
}


// ─── Clear automatic addresses ─────────────────────────────
// Removes every automatic address and its labels. The addresses stay
// remembered (S.autoAddresses), so switching auto-address back on restores
// the same ones.
export function clearAutoRefs() {
  if (!isLive()) return;
  var autoEls = document.querySelectorAll('[data-stadiaref-auto]');
  forEachNode(autoEls, function (el) {
    unlabel(el);
    el.removeAttribute('data-ref');
    el.removeAttribute('data-stadiaref-auto');
    el.removeAttribute('data-stadiaref-auto-tier');
  });
}
