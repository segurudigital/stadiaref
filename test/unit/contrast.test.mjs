// Every text and background pair StadiaRef draws is at least 4.5:1 (WCAG
// AA, small text). Translucent backgrounds have no fixed backdrop, so they
// are checked over the worst page colour of the surface they are used on:
// a grid of colours split by the same luminance test the overlay uses to
// choose a label's light or dark version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairs, TOOLBAR } from '../../src/overlay/styles/tokens.js';

function parse(c) {
  c = c.trim();
  if (c[0] === '#') {
    const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) throw new Error('unparsed colour ' + c);
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}

function over(top, under) {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1);
}

function lum(rgb) {
  const ch = rgb.slice(0, 3).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// The overlay's surface test (visibility.js): a weighted sum of the
// unlinearised channels, under 0.40 is dark.
const surfaceLum = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;

const GRID = [];
for (let r = 0; r <= 255; r += 17) for (let g = 0; g <= 255; g += 17) for (let b = 0; b <= 255; b += 17) GRID.push([r, g, b, 1]);
const BACKDROPS = {
  'page-light': GRID.filter((c) => surfaceLum(c) >= 0.4),
  'page-dark': GRID.filter((c) => surfaceLum(c) < 0.4),
  'page-any': GRID,
};

function worst(fg, bg, backdrop) {
  const f = parse(fg);
  const b = parse(bg);
  const unders = BACKDROPS[backdrop] || [parse(backdrop)];
  let min = Infinity;
  for (const u of unders) {
    const surface = b[3] < 1 ? over(b, u) : b;
    const text = f[3] < 1 ? over(f, surface) : f;
    min = Math.min(min, ratio(text, surface));
  }
  return min;
}

test('the token list covers both toolbar themes', () => {
  assert.deepEqual(Object.keys(TOOLBAR), ['light', 'dark']);
  assert.ok(pairs().length > 60);
});

for (const [name, fg, bg, backdrop] of pairs()) {
  test(`contrast: ${name}`, () => {
    const r = worst(fg, bg, backdrop);
    assert.ok(r >= 4.5, `${name}: ${fg} on ${bg} (over ${backdrop}) is ${r.toFixed(2)}:1`);
  });
}
