import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const workflow = (name) => fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8');

test('every third-party workflow action is pinned to a full commit', () => {
  for (const name of ['ci.yml', 'pages.yml', 'release-assets.yml']) {
    const source = workflow(name);
    const mutable = [...source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)]
      .map((match) => match[1])
      .filter((use) => !/@[a-f0-9]{40}$/.test(use));
    assert.deepEqual(mutable, [], name);
  }
});

test('release build has no write or OIDC authority; publish consumes the prebuilt tarball', () => {
  const source = workflow('release-assets.yml');
  const build = source.slice(source.indexOf('  build:'), source.indexOf('  attach-github-release:'));
  const publish = source.slice(source.indexOf('  publish-npm:'));
  assert.doesNotMatch(build, /id-token:\s*write|contents:\s*write/);
  assert.match(publish, /id-token:\s*write/);
  assert.doesNotMatch(publish, /npm ci|npm install|npm run build/);
  assert.match(publish, /npm publish "release-build\/stadiaref-\$\{version\}\.tgz"/);
  assert.match(publish, /--ignore-scripts/);
});

test('Pages build has no deployment authority', () => {
  const source = workflow('pages.yml');
  const build = source.slice(source.indexOf('  build:'), source.indexOf('  deploy:'));
  const deploy = source.slice(source.indexOf('  deploy:'));
  assert.doesNotMatch(build, /id-token:\s*write|pages:\s*write/);
  assert.match(deploy, /id-token:\s*write/);
  assert.match(deploy, /pages:\s*write/);
});
