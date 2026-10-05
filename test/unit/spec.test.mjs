// docs/spec/stadia-address-core.md must describe the core as built: its
// example table, word lists and limits are checked against src/core.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validate, classify, parse, MAX_LENGTH, SURFACES } from '../../src/core/index.js';
import { BLOCK_TYPES, ELEMENT_NOUNS } from '../../src/core/profiles/titan.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SPEC = fs.readFileSync(path.join(ROOT, 'docs/spec/stadia-address-core.md'), 'utf8');

function section(heading) {
  const start = SPEC.indexOf(heading);
  assert.ok(start !== -1, heading);
  const next = SPEC.indexOf('\n## ', start + heading.length);
  return SPEC.slice(start, next === -1 ? undefined : next);
}

const codes = (line) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

test('every row of the examples table matches the core', () => {
  const rows = section('## 10. Examples').split('\n').filter((l) => /^\| `/.test(l));
  assert.ok(rows.length >= 15, 'the table has rows');
  for (const row of rows) {
    const [address, core, generic, app, titan] = row.split('|').slice(1, -1).map((c) => c.trim().replace(/`/g, ''));
    const v = (profile) => (validate(address, { profile }).valid ? 'valid' : 'invalid');
    assert.equal(v('generic'), core, address + ': core rules');
    assert.equal(v('generic'), generic, address + ': generic');
    assert.equal(v('app'), app, address + ': app');
    assert.equal(classify(address, { profile: 'titan' }), titan, address + ': titan');
  }
});

test('the titan word lists and the app surfaces are the ones in the core', () => {
  const titan = section('### 8.3 `titan`');
  const line = (label) => codes(titan.split('\n').find((l) => l.startsWith('- **' + label)));
  assert.deepEqual(line('Block types').sort(), Object.keys(BLOCK_TYPES).sort());
  assert.deepEqual(line('Element nouns').sort(), Object.keys(ELEMENT_NOUNS).sort());
  const app = section('### 8.2 `app`');
  const surfaces = app.split('\n').find((l) => l.trim().startsWith('`app`, `pwa`'));
  assert.deepEqual(codes(surfaces), SURFACES);
});

test('the length limit and the parse shapes', () => {
  assert.ok(SPEC.includes('no more than **160 characters**'));
  assert.equal(MAX_LENGTH, 160);
  assert.deepEqual(Object.keys(parse('home-hero-heading-01-01-primary', { profile: 'titan' }).parts), ['tier', 'prefix', 'element', 'number', 'instance', 'role']);
  assert.deepEqual(Object.keys(parse('home-hero-card-01', { profile: 'titan' }).parts), ['tier', 'prefix', 'blockType', 'number']);
  assert.deepEqual(Object.keys(parse('home-hero', { profile: 'titan' }).parts), ['tier', 'segments']);
  assert.deepEqual(Object.keys(parse('ops-app-jobs', { profile: 'app' }).parts), ['product', 'surface', 'path']);
  assert.deepEqual(Object.keys(parse('home-hero', { profile: 'generic' }).parts), ['segments']);
  assert.equal(parse('Home', { profile: 'generic' }).parts, null);
});

test('the core rules grammar accepts and rejects what the core does', () => {
  const grammar = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const a of ['a', 'home', 'home-hero-01', '2024', 'x'.repeat(160), 'Home', 'home_hero', 'home--hero', '-a', 'a-', '', 'é', 'a.b', 'x'.repeat(161)]) {
    assert.equal(validate(a).valid, grammar.test(a) && a.length <= 160, JSON.stringify(a));
  }
});
