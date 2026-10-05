// The shipped overlay file: present, current, self-contained.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

const dist = (f) => fs.readFileSync(path.join(ROOT, 'dist', f), 'utf8');

test('the data-stadiaref-root marker is in the overlay builds and nowhere else', () => {
  for (const f of ['stadiaref.min.js', 'index.mjs']) assert.ok(dist(f).includes('data-stadiaref-root'), f);
  for (const f of ['core.mjs', 'vite.mjs', 'astro.mjs', 'astro-app.mjs']) assert.ok(!dist(f).includes('data-stadiaref-root'), f);
});

test('dist/index.mjs imports ./core.mjs rather than carrying its own registry', () => {
  const src = dist('index.mjs');
  assert.match(src, /from\s*"\.\/core\.mjs"/);
  assert.ok(!src.includes('is already registered'), 'the registry code is bundled into index.mjs');
});

test('the integrations import nothing of the overlay and make no network requests', () => {
  for (const f of ['vite.mjs', 'astro.mjs', 'astro-app.mjs']) {
    const src = dist(f);
    // (The loader they add to the page is a string that imports 'stadiaref';
    // only import statements of their own count here.)
    assert.ok(!/^import\b.*from\s*["'](\.\/index\.mjs|stadiaref)["']/m.test(src), f + ' imports the overlay');
    assert.ok(!/\bfetch\(|XMLHttpRequest|sendBeacon/.test(src), f + ' makes a request');
  }
  // astro-app.mjs imports nothing at all.
  assert.ok(!/\bimport\b/.test(dist('astro-app.mjs').replace(/import\.meta/g, '')));
});

test('import("stadiaref") in Node resolves and does nothing', async () => {
  const mod = await import(path.join(ROOT, 'dist/index.mjs'));
  assert.equal(mod.default, undefined);
  assert.deepEqual(Object.keys(mod), ['default']);
  assert.equal(typeof globalThis.window, 'undefined');
});

test('package.json: entry points, exports and published files', () => {
  assert.equal(pkg.main, './dist/index.mjs');
  assert.equal(pkg.types, './types/index.d.ts');
  assert.deepEqual(pkg.exports, {
    '.': { types: './types/index.d.ts', import: './dist/index.mjs' },
    './core': { types: './types/core.d.ts', import: './dist/core.mjs' },
    './astro': { types: './types/astro.d.ts', import: './dist/astro.mjs' },
    './vite': { types: './types/vite.d.ts', import: './dist/vite.mjs' },
    './dist/stadiaref.min.js': './dist/stadiaref.min.js',
    './package.json': './package.json',
  });
  assert.deepEqual(pkg.files, ['dist/*.mjs', 'dist/stadiaref.min.js', 'types', 'README.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md']);
  assert.deepEqual(pkg.peerDependencies, { astro: '>=7', vite: '>=5' });
  for (const target of Object.values(pkg.exports).flatMap((e) => (typeof e === 'string' ? [e] : Object.values(e)))) {
    assert.ok(fs.existsSync(path.join(ROOT, target)), target + ' exists');
  }
});

test('npm pack ships only the built files, types and the four documents', () => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const files = JSON.parse(out)[0].files.map((f) => f.path).sort();
  assert.deepEqual(files, [
    'CHANGELOG.md', 'LICENSE', 'NOTICE', 'README.md',
    'dist/astro-app.mjs', 'dist/astro.mjs', 'dist/core.mjs', 'dist/index.mjs', 'dist/stadiaref.min.js', 'dist/vite.mjs',
    'package.json',
    'types/astro.d.ts', 'types/core.d.ts', 'types/index.d.ts', 'types/vite.d.ts',
  ]);
});
