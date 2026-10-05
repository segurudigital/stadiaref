// Every relative link in the README, the docs and the community files
// points at a file that exists, and every #anchor at a heading in it
// (GitHub's heading slugs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');

function mdFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === '_internal' ? [] : mdFiles(p);
    return d.name.endsWith('.md') ? [p] : [];
  });
}

const FILES = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'ROADMAP.md', 'AGENTS.md']
  .map((f) => path.join(ROOT, f))
  .concat(mdFiles(path.join(ROOT, 'docs')));

// GitHub: lower case, drop everything but letters, digits, spaces, hyphens
// and underscores, spaces to hyphens. Repeated headings get -1, -2.
function slugs(file) {
  const seen = {};
  const out = new Set();
  let fence = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    if (fence) continue;
    const m = line.match(/^#{1,6}\s+(.*)$/);
    if (!m) continue;
    let slug = m[1].trim().toLowerCase().replace(/`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[^\p{L}\p{N} _-]/gu, '').replace(/ /g, '-');
    if (seen[slug] !== undefined) { seen[slug]++; slug = slug + '-' + seen[slug]; } else seen[slug] = 0;
    out.add(slug);
  }
  return out;
}

function links(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
}

for (const file of FILES) {
  test('links in ' + path.relative(ROOT, file), () => {
    const bad = [];
    for (const link of links(file)) {
      if (/^(https?:|mailto:)/.test(link)) continue;
      const [target, anchor] = link.split('#');
      const resolved = target ? path.resolve(path.dirname(file), target) : file;
      if (!fs.existsSync(resolved)) { bad.push(link + ' (no such file)'); continue; }
      if (anchor && resolved.endsWith('.md') && !slugs(resolved).has(anchor)) bad.push(link + ' (no such heading)');
    }
    assert.deepEqual(bad, []);
  });
}
