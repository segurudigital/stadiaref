// titan: the Titan Foundation grammar (data-ref v5). The tier is read from
// the address itself. This is the 2.x classifyDataRef(), unchanged.
//
// The page part may contain hyphens (e.g. team-v2, plan-def-110), so segment
// count alone can't decide the tier. The tail segments are fixed:
//   Element: segs[-4] ∈ ELEMENT_NOUNS, segs[-3] NN, segs[-2] NN (instance),
//            segs[-1] non-numeric (role), at least 6 segments
//   Block:   segs[-2] ∈ BLOCK_TYPES, segs[-1] NN, at least 4 segments
//   Section: segs[-1] non-numeric, at least 2 segments
//   Anything else: unclassified
export const BLOCK_TYPES = {
  card: 1, row: 1, item: 1, tab: 1, slide: 1,
  step: 1, cell: 1, column: 1, panel: 1, quote: 1, entry: 1
};
export const ELEMENT_NOUNS = {
  heading: 1, text: 1, image: 1, cta: 1, media: 1, link: 1, wrapper: 1
};

export function classifyTitan(ref) {
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

export const titan = {
  name: 'titan',
  classify: function (address) {
    var tier = classifyTitan(address);
    return tier === 'unclassified' ? null : tier;
  },
  validate: function (address) {
    return classifyTitan(address) === 'unclassified' ? ["doesn't match the Titan grammar"] : [];
  },
  parse: function (address) {
    var segs = address.split('-');
    var len = segs.length;
    var tier = classifyTitan(address);
    if (tier === 'element') {
      return { tier: tier, prefix: segs.slice(0, len - 4).join('-'), element: segs[len - 4], number: segs[len - 3], instance: segs[len - 2], role: segs[len - 1] };
    }
    if (tier === 'block') {
      return { tier: tier, prefix: segs.slice(0, len - 2).join('-'), blockType: segs[len - 2], number: segs[len - 1] };
    }
    if (tier === 'section') return { tier: tier, segments: segs };
    return null;
  }
};
