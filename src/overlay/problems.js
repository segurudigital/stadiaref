// ─── Problems in the addresses on a screen ──────────────────
// Pure: takes [{ address, tier, auto, el }] in page order and returns the
// problems the Tree lists in its Problems tab:
//   duplicate    one address on more than one element
//   unclassified an address the profile can't place in a tier
//   gap          a missing number in a run of siblings, such as card-01,
//                card-02, card-04 (card-03 missing)
// Automatic addresses are left out: they are numbered from a counter.

var MAX_LISTED = 3;

export function findProblems(items) {
  var out = [];
  var byAddress = {};
  var order = [];
  items.forEach(function (it) {
    if (it.auto) return;
    if (!byAddress[it.address]) { byAddress[it.address] = []; order.push(it.address); }
    byAddress[it.address].push(it);
  });
  order.forEach(function (address) {
    var list = byAddress[address];
    if (list.length > 1) out.push({ kind: 'duplicate', address: address, count: list.length, items: list });
  });
  order.forEach(function (address) {
    var it = byAddress[address][0];
    if (it.tier === 'unclassified') out.push({ kind: 'unclassified', address: address, items: [it] });
  });
  out = out.concat(gaps(order, byAddress));
  return out;
}

// Group addresses that differ only in their last all-digit part, and report
// the numbers missing inside each run.
function gaps(order, byAddress) {
  var groups = {};
  var keys = [];
  order.forEach(function (address) {
    var parts = address.split('-');
    for (var i = parts.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(parts[i])) {
        var key = parts.slice(0, i).join('-') + '\u0000' + parts.slice(i + 1).join('-');
        if (!groups[key]) { groups[key] = { head: parts.slice(0, i), tail: parts.slice(i + 1), width: parts[i].length, nums: {} }; keys.push(key); }
        groups[key].nums[parseInt(parts[i], 10)] = byAddress[address][0];
        break;
      }
    }
  });
  var out = [];
  keys.forEach(function (key) {
    var g = groups[key];
    var nums = Object.keys(g.nums).map(Number).sort(function (a, b) { return a - b; });
    if (nums.length < 2) return;
    for (var i = 1; i < nums.length; i++) {
      var from = nums[i - 1];
      var to = nums[i];
      if (to - from < 2) continue;
      var missing = [];
      for (var n = from + 1; n < to; n++) missing.push(n);
      var names = missing.slice(0, MAX_LISTED).map(function (m) { return name(g, m); });
      out.push({
        kind: 'gap',
        address: names[0],
        missing: names,
        more: Math.max(0, missing.length - MAX_LISTED),
        before: g.nums[from],
        after: g.nums[to],
        items: [g.nums[to]]
      });
    }
  });
  return out;
}

function name(g, n) {
  var s = String(n);
  while (s.length < g.width) s = '0' + s;
  return g.head.concat([s], g.tail).join('-');
}
