import { S } from './state.js';
import { clearDataRefClass } from './classify.js';
import { arrayContainsNode, forEachNode, matchesSelector } from './dom.js';
import { MARKER, removeVoidHost } from './labels.js';

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

export function autoRefSections() {
  if (!S.autoRefEnabled) return;
  var slug = getPageSlug();
  var allSections = collectTargetsByDepth(S.autoRefDepth);

  for (var i = 0; i < allSections.length; i++) {
    var el = allSections[i];
    if (!el.getAttribute('data-ref')) {
      var num = String(i + 1);
      if (num.length < 2) num = '0' + num;
      el.setAttribute('data-ref', slug + '-' + num + '-' + getElementContext(el));
      el.setAttribute('data-stadiaref-auto', '1');
      el.setAttribute('data-stadiaref-auto-tier', getAutoRefLevel(el, S.autoRefDepth));
    }
  }
}


// ─── Clear auto-ref'd labels (for depth switching) ─────────
export function clearAutoRefs() {
  var autoEls = document.querySelectorAll('[data-stadiaref-auto]');
  forEachNode(autoEls, function (el) {
    el.removeAttribute('data-ref');
    el.removeAttribute('data-stadiaref-auto');
    el.removeAttribute('data-stadiaref-auto-tier');
    clearDataRefClass(el);
    // Remove only DIRECT CHILD label nodes. A subtree querySelectorAll would
    // also reach labels belonging to nested [data-ref] elements, removing them
    // while leaving their _stadiarefLabelled MARKER intact — so injectLabels() would
    // skip re-creating them, leaving those refs permanently unlabelled after
    // any T-key depth cycle that passes through a depth with auto-refs.
    var i, child;
    for (i = el.childNodes.length - 1; i >= 0; i--) {
      child = el.childNodes[i];
      if (child.nodeType !== 1) continue;
      if (
        child.classList.contains('stadiaref-ref-link') ||
        child.classList.contains('stadiaref-ref-icon') ||
        child.classList.contains('stadiaref-ref-tooltip') ||
        child.classList.contains('stadiaref-ref-full-label')
      ) {
        el.removeChild(child);
      }
    }
    removeVoidHost(el);
    delete el[MARKER];
    delete el._stadiarefIcon;
    delete el._stadiarefLink;
    delete el._stadiarefTooltip;
    delete el._stadiarefFullLabel;
    delete el._stadiarefDepth;
  });
}
