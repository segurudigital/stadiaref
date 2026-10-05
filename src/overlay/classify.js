

// ─── data-ref v5.0 grammar classifier ───────────────────────
// page-abbreviations may contain hyphens (e.g. mpt-v2, mpt-def-110),
// so total segment count alone cannot determine grammar class. Instead
// we inspect the *tail* segments whose positions are fixed by the spec.
//
// Element  (§2.1): segs[-4] ∈ ELEMENT_NOUNS, segs[-3] /^\d{2}$/ (NN),
//                  segs[-2] /^\d{2}$/ (instance), segs[-1] non-numeric (role-token), len ≥ 6
// Block    (§2.1): segs[-2] ∈ BLOCK_TYPES, segs[-1] /^\d{2}$/ (NN), len ≥ 4
// Section  (§2.1): segs[-1] non-numeric, len ≥ 2 (fallthrough)
// Unclassified: everything else (malformed — rendered but flagged)
export const BLOCK_TYPES = {
  card: 1, row: 1, item: 1, tab: 1, slide: 1,
  step: 1, cell: 1, column: 1, panel: 1, quote: 1, entry: 1
};
export const ELEMENT_NOUNS = {
  heading: 1, text: 1, image: 1, cta: 1, media: 1, link: 1, wrapper: 1
};

export function classifyDataRef(ref) {
  if (!ref || typeof ref !== 'string') return 'unclassified';
  var segs = ref.split('-');
  var len = segs.length;
  if (len < 2) return 'unclassified';
  var twoDigit = /^\d{2}$/;
  var numeric = /^\d+$/;
  // Element check — needs at least 6 segments
  if (len >= 6) {
    var s1 = segs[len - 1]; // role-token: non-numeric
    var s2 = segs[len - 2]; // instance: /^\d{2}$/
    var s3 = segs[len - 3]; // NN: /^\d{2}$/
    var s4 = segs[len - 4]; // element noun
    if (!numeric.test(s1) && twoDigit.test(s2) && twoDigit.test(s3) && ELEMENT_NOUNS[s4]) {
      return 'element';
    }
  }
  // Block check — needs at least 4 segments
  if (len >= 4) {
    var bNN = segs[len - 1];  // NN: /^\d{2}$/
    var bType = segs[len - 2]; // block-type in vocabulary
    if (twoDigit.test(bNN) && BLOCK_TYPES[bType]) {
      return 'block';
    }
  }
  // Section check — last seg non-numeric, at least 2 segs
  if (!numeric.test(segs[len - 1])) {
    return 'section';
  }
  return 'unclassified';
}

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

// The tier a label shows for an addressed element: the automatic tier when
// StadiaRef stamped the address, otherwise the classifier's answer.
export function tierOf(el) {
  return normalizeRefClass(el.getAttribute('data-stadiaref-auto-tier') || classifyDataRef(el.getAttribute('data-ref')));
}
