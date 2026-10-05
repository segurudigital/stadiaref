// Baseline: classifyDataRef() against the v5 fixtures and edge cases,
// and the per-element class stamp the overlay derives from it.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { open, harness, countVisible, visibleFullLabelRefs, labelTiers } from './helpers.mjs';

// 2.x classified every address with the Titan grammar. 3.0 defaults to the
// generic profile, so a 2.x page that relies on Titan tiers sets
// profile: 'titan' (docs: migrating-from-2.x, "The default profile changed").
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.stadiarefConfig = { profile: 'titan' }; });
});

const expected = JSON.parse(fs.readFileSync(new URL('../../fixtures/v5-data-ref/expected-2.5.0.json', import.meta.url), 'utf8'));
const FIXTURES = Object.keys(expected).filter((k) => !k.startsWith('_'));

for (const name of FIXTURES) {
  test(`fixture ${name}: classifier and stamped classes match 2.5.0`, async ({ page }) => {
    await open(page, '/test/fixtures/v5-data-ref/' + name + '.html');
    await page.evaluate(() => window.seguruDebugToolbar.show());
    // 3.0 keeps the tier on the label, not as a class on the element.
    const tiers = await labelTiers(page);
    const got = await page.evaluate(() => Array.from(document.querySelectorAll('[data-ref]')).map((e) => {
      const r = e.getAttribute('data-ref');
      return [r, window.seguruDebugToolbar.classifyDataRef(r)];
    })).then((list) => list.map(([r, c]) => [r, c, tiers[r]]));
    // classifyDataRef() is the raw 2.x grammar: identical to 2.5.0.
    expect(got.map(([r, c]) => [r, c])).toEqual(expected[name]);
    // The labels use the titan profile: the same tiers.
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
  // Folded "+N" labels count as on screen; which ones fold depends on label size.
  const all = await countVisible(page, '.stadiaref-ref-full-label') + await page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label.stadiaref-ref-clustered').length);
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section'));
  const sections = await countVisible(page, '.stadiaref-ref-full-label');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section-block'));
  const secBlk = await countVisible(page, '.stadiaref-ref-full-label');
  expect({ all, sections, secBlk }).toEqual(BASELINE_MIXED_COUNTS);
});

test('mixed fixture: the void-hosted image label is filtered like any other (2.5.0 bug, fixed)', async ({ page }) => {
  await open(page, '/test/fixtures/v5-data-ref/mixed.html');
  await page.evaluate(() => { window.seguruDebugToolbar.show(); window.seguruDebugToolbar.setLevelFilter('section'); });
  // home-hero-image-01-01-hero escaped the 2.5.0 filter from its void host;
  // since Show (stage 4) each label node carries its tier, so it is hidden.
  expect(await visibleFullLabelRefs(page)).toEqual(['home-about', 'home-header', 'home-hero', 'home-services']);
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
// home-services "+8" badge (8 cards and their 8 headings). "sections" is 6, not
// 5: the <img> home-hero-image-01-01-hero mounts its labels in a sibling void
// host, which the level-filter CSS (a descendant selector) doesn't reach.
// That is a 2.5.0 bug, recorded in TASKS.md; the baseline pins the code.
// Since stage 4 the image label is filtered too. "all" counts labels folded
// into "+N" badges as shown. (The fixture's malformed address was removed
// after stage 8; with it, 2.5.0 gave all 22, sections 6 and secBlk 17.)
const BASELINE_MIXED_COUNTS = { all: 21, sections: 4, secBlk: 15 };
