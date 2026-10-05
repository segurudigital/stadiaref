// The shipped overlay file: present, current, self-contained.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const BUNDLE = path.join(ROOT, 'dist/stadiaref.min.js');

test('the bundle exists and carries the package version', () => {
  const src = fs.readFileSync(BUNDLE, 'utf8');
  assert.ok(src.includes(JSON.stringify(pkg.version)) || src.includes("'" + pkg.version + "'"), 'version string in bundle');
});

test('the bundle is a single IIFE with no imports or requires', () => {
  const src = fs.readFileSync(BUNDLE, 'utf8');
  assert.ok(!/\bimport(\s*\(|\s+[\w{*"'])/.test(src), 'no import statement or import()');
  assert.ok(!/\brequire\(/.test(src), 'no require()');
});

test('the bundle makes no network requests', () => {
  const src = fs.readFileSync(BUNDLE, 'utf8');
  for (const pattern of [/\bfetch\(/, /XMLHttpRequest/, /sendBeacon/, /new WebSocket/, /new EventSource/, /@import/, /url\(\s*['"]?https?:/]) {
    assert.ok(!pattern.test(src), 'bundle matches ' + pattern);
  }
});

test('the package has no runtime dependencies', () => {
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
});

test('the data-stadiaref-root marker is in the overlay bundle and not in core', () => {
  assert.ok(fs.readFileSync(BUNDLE, 'utf8').includes('data-stadiaref-root'));
  assert.ok(!fs.readFileSync(path.join(ROOT, 'dist/core.mjs'), 'utf8').includes('data-stadiaref-root'));
});
