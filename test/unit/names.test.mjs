// The 2.x names live only in src/compat/. Elsewhere in src/ they may appear
// in comments that explain the history, and nowhere else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const SRC = path.resolve(import.meta.dirname, '../../src');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === 'compat' ? [] : files(p);
    return /\.(m?js)$/.test(d.name) ? [p] : [];
  });
}

const OLD_NAMES = /sdt|seguru-?debug|seguruDebug/i;

for (const file of files(SRC)) {
  test('no 2.x names in ' + path.relative(SRC, file), async () => {
    // esbuild drops comments; what is left is code and strings.
    const { code } = await esbuild.transform(fs.readFileSync(file, 'utf8'), { loader: 'js', legalComments: 'none' });
    const hits = code.split('\n').filter((line) => OLD_NAMES.test(line));
    assert.deepEqual(hits, []);
  });
}
