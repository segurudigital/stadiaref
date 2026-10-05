// Baseline: classifyDataRef() against the v5 fixtures and edge cases,
// and the per-element class stamp the overlay derives from it.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { open, harness, countVisible, visibleFullLabelRefs } from './helpers.mjs';

const expected = JSON.parse(fs.readFileSync(new URL('../../fixtures/v5-data-ref/expected-2.5.0.json', import.meta.url), 'utf8'));
const FIXTURES = Object.keys(expected).filter((k) => !k.startsWith('_'));

for (const name of FIXTURES) {
  test(`fixture ${name}: classifier and stamped classes match 2.5.0`, async ({ page }) => {
    await open(page, '/test/fixtures/v5-data-ref/' + name + '.html');
    const got = await page.evaluate(() => Array.from(document.querySelectorAll('[data-ref]')).map((e) => {
      const r = e.getAttribute('data-ref');
      const stamped = (String(e.className).match(/stadiaref-ref-class-(\w+)/) || [])[1];
      return [r, window.seguruDebugToolbar.classifyDataRef(r), stamped];
    }));
    expect(got.map(([r, c]) => [r, c])).toEqual(expected[name]);
    for (const [r, c, s] of got) expect(s, r).toBe(c);
  });
}

test('classifyDataRef edge cases', async ({ page }) => {
  await open(page, harness());
  const cases = {
    '': 'unclassified',
    'home': 'unclassified',
    'home-01': 'unclassified',
    'home-hero': 'section',
    'home-01-hero': 'section',
    'home-hero-card-01': 'block',
    // a block needs at least 4 segments, and a numeric tail fails the section rule
    'hero-card-01': 'unclassified',
    'x-y-card-1': 'unclassified',
    'x-y-widget-01': 'unclassified',
    'home-hero-heading-01-01-main': 'element',
    'home-hero-heading-01-01-02': 'unclassified',
    'home-hero-banner-01-01-main': 'section',
    'Home-Hero': 'section',
    'home_hero-x': 'section',
  };
  const got = await page.evaluate((keys) => {
    const o = {};
    keys.forEach((k) => { o[k] = window.seguruDebugToolbar.classifyDataRef(k); });
    o.__null = window.seguruDebugToolbar.classifyDataRef(null);
    o.__num = window.seguruDebugToolbar.classifyDataRef(42);
    return o;
  }, Object.keys(cases));
  expect(got).toEqual({ ...cases, __null: 'unclassified', __num: 'unclassified' });
});

test('mixed fixture: level filter hides by stamped class', async ({ page }) => {
  await open(page, '/test/fixtures/v5-data-ref/mixed.html');
  await page.evaluate(() => window.seguruDebugToolbar.show());
  const all = await countVisible(page, '.stadiaref-ref-full-label');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section'));
  const sections = await countVisible(page, '.stadiaref-ref-full-label');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section-block'));
  const secBlk = await countVisible(page, '.stadiaref-ref-full-label');
  expect({ all, sections, secBlk }).toEqual(BASELINE_MIXED_COUNTS);
});

test('mixed fixture: the void-hosted image label escapes the Sections filter (2.5.0 bug)', async ({ page }) => {
  await open(page, '/test/fixtures/v5-data-ref/mixed.html');
  await page.evaluate(() => { window.seguruDebugToolbar.show(); window.seguruDebugToolbar.setLevelFilter('section'); });
  expect(await visibleFullLabelRefs(page)).toEqual(['bad--ref', 'hf-about', 'hf-header', 'hf-hero', 'hf-hero-image-01-01-hero', 'hf-services']);
});

test('dense fixture: block-group collapse badge in All, gone in Sec+Blk', async ({ page }) => {
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-dense.html');
  await page.evaluate(() => window.seguruDebugToolbar.show());
  await expect.poll(() => countVisible(page, '.stadiaref-block-group-badge')).toBe(1);
  expect(await page.locator('.stadiaref-block-group-badge').first().textContent()).toContain('8');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section-block'));
  await expect.poll(() => countVisible(page, '.stadiaref-block-group-badge')).toBe(0);
});

// Measured on 2.5.0. "all" is 38 refs less the 16 collapsed into the
// hf-services "+8" badge (8 cards and their 8 headings). "sections" is 6, not
// 5: the <img> hf-hero-image-01-01-hero mounts its labels in a sibling void
// host, which the level-filter CSS (a descendant selector) doesn't reach.
// That is a 2.5.0 bug, recorded in TASKS.md; the baseline pins the code.
const BASELINE_MIXED_COUNTS = { all: 22, sections: 6, secBlk: 17 };
