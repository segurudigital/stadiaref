// Every WordPress PHP file passes `php -l`. Skipped when PHP isn't installed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const hasPhp = spawnSync('php', ['-v']).status === 0;

function phpFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return phpFiles(p);
    return d.name.endsWith('.php') ? [p] : [];
  });
}

const files = phpFiles(path.join(ROOT, 'wordpress'));

test('there are WordPress PHP files to lint', () => {
  assert.ok(files.length >= 2);
});

for (const file of files) {
  test('php -l ' + path.relative(ROOT, file), { skip: hasPhp ? false : 'php not installed' }, () => {
    const out = execFileSync('php', ['-l', file], { encoding: 'utf8' });
    assert.match(out, /No syntax errors detected/);
  });
}
