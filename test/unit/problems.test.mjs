// The Tree's Problems tab (3.3): duplicates, unclassified, numbering gaps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findProblems } from '../../src/overlay/problems.js';

const item = (address, tier = 'element', auto = false) => ({ address, tier, auto, el: { address } });

test('a clean screen has no problems', () => {
  assert.deepEqual(findProblems([item('home-hero', 'section'), item('home-hero-card-01'), item('home-hero-card-02')]), []);
});

test('a duplicated address is one problem with its count', () => {
  const p = findProblems([item('home-cta'), item('home-hero'), item('home-cta'), item('home-cta')]);
  assert.equal(p.length, 1);
  assert.deepEqual([p[0].kind, p[0].address, p[0].count, p[0].items.length], ['duplicate', 'home-cta', 3, 3]);
});

test('an unclassified address is listed once', () => {
  const p = findProblems([item('Bad_Address', 'unclassified'), item('Bad_Address', 'unclassified')]);
  assert.deepEqual(p.map((x) => x.kind), ['duplicate', 'unclassified']);
});

test('a gap in numbering names the missing addresses, padded like their siblings', () => {
  const p = findProblems([item('list-card-01'), item('list-card-02'), item('list-card-05'), item('list-card-06')]);
  assert.equal(p.length, 1);
  assert.equal(p[0].kind, 'gap');
  assert.deepEqual(p[0].missing, ['list-card-03', 'list-card-04']);
  assert.equal(p[0].before.el.address, 'list-card-02');
  assert.equal(p[0].after.el.address, 'list-card-05');
});

test('runs are told apart by what comes after the number; the last number is the one counted', () => {
  const p = findProblems([item('home-text-01-price'), item('home-text-03-price'), item('home-text-01-title'), item('home-text-02-title')]);
  assert.deepEqual(p.map((x) => x.missing), [['home-text-02-price']]);
  const q = findProblems([item('home-card-01-02'), item('home-card-01-04')]);
  assert.deepEqual(q[0].missing, ['home-card-01-03']);
});

test('a long gap lists three and counts the rest', () => {
  const p = findProblems([item('row-1'), item('row-9')]);
  assert.deepEqual([p[0].missing, p[0].more], [['row-2', 'row-3', 'row-4'], 4]);
});

test('automatic addresses are left out', () => {
  assert.deepEqual(findProblems([item('auto-01', 'section', true), item('auto-04', 'section', true), item('x', 'unclassified', true)]), []);
});
