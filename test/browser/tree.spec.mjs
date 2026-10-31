// The Tree in 3.3: push mode.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow } from './helpers.mjs';

const { harness, open } = makeHelpers(NEW);

const cardPage = (cfg = {}) => harness({ body: 'card', cfg: { startHidden: false, ...cfg } });
const treeEvents = (page) => page.evaluate(() => window.__trees);
const width = (page) => page.evaluate(() => document.documentElement.style.getPropertyValue('--stadiaref-tree-w'));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__trees = [];
    window.addEventListener('stadiaref:tree', (e) => window.__trees.push(e.detail));
  });
});

test.describe('push mode', () => {
  test('the Tree is a column on the right; --stadiaref-tree-w and stadiaref:tree tell the host its width', async ({ page }) => {
    await open(page, cardPage({ tree: 'push' }));
    expect(await width(page)).toBe('0px');
    await page.evaluate(() => { document.body.style.marginRight = 'var(--stadiaref-tree-w, 0px)'; });
    await page.evaluate(() => window.stadiaref.toggleTree());
    const box = await shadow(page, '.stadiaref-tree-panel').boundingBox();
    expect(Math.round(box.x + box.width)).toBe(1280);
    expect(box.y).toBe(0);
    expect(box.height).toBe(900);
    expect(await width(page)).toBe(box.width + 'px');
    expect(await treeEvents(page)).toEqual([{ open: true, width: box.width }]);
    expect(await page.evaluate(() => window.stadiaref.getTreeWidth())).toBe(box.width);
    // The page made room: nothing of it is under the column.
    const hero = await page.locator('[data-ref="home-hero"]').boundingBox();
    expect(hero.x + hero.width).toBeLessThanOrEqual(1280 - box.width + 1);
    // The toolbar moved left of the column.
    const bar = await shadow(page, '.stadiaref-toolbar').boundingBox();
    expect(bar.x + bar.width).toBeLessThanOrEqual(1280 - box.width);
    await page.evaluate(() => window.stadiaref.toggleTree());
    expect(await width(page)).toBe('0px');
    expect((await treeEvents(page)).at(-1)).toEqual({ open: false, width: 0 });
  });

  test('overlay (the default) floats the Tree, sets no property, and fires stadiaref:tree with width 0', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    expect(await width(page)).toBe('');
    expect(await treeEvents(page)).toEqual([{ open: true, width: 0 }]);
    await page.evaluate(() => window.stadiaref.init({ tree: 'push' }));
    expect(parseInt(await width(page), 10)).toBeGreaterThan(0);
    expect((await treeEvents(page)).at(-1).width).toBeGreaterThan(0);
    await page.evaluate(() => window.stadiaref.init({ tree: 'overlay' }));
    expect(await width(page)).toBe('');
  });

  test('nothing is written before the first show; hiding StadiaRef shuts the column', async ({ page }) => {
    await open(page, harness({ body: 'card', cfg: { tree: 'push' } }));
    expect(await width(page)).toBe('');
    await page.evaluate(() => { window.stadiaref.show(); window.stadiaref.toggleTree(); });
    expect(parseInt(await width(page), 10)).toBeGreaterThan(0);
    await page.evaluate(() => window.stadiaref.hide());
    expect(await width(page)).toBe('0px');
  });

  test('on a narrow screen the column narrows and the host hears the new width', async ({ page }) => {
    await open(page, cardPage({ tree: 'push' }));
    await page.evaluate(() => window.stadiaref.toggleTree());
    await page.setViewportSize({ width: 320, height: 700 });
    await expect.poll(() => width(page)).toBe('320px');
    expect((await treeEvents(page)).at(-1)).toEqual({ open: true, width: 320 });
  });
});

test.describe('search, filter and problems', () => {
  const rows = (page) => shadow(page, '.stadiaref-tree-row .stadiaref-tree-ref').allTextContents();

  test('the search field filters rows and keeps focus through a survey', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    await shadow(page, '.stadiaref-tree-search').fill('cta');
    expect(await rows(page)).toEqual(['home-hero-cta']);
    await page.evaluate(() => window.stadiaref.refresh());
    expect(await rows(page)).toEqual(['home-hero-cta']);
    await page.keyboard.type('x');
    await expect(shadow(page, '.stadiaref-tree-search')).toHaveValue('ctax');
    await expect(shadow(page, '.stadiaref-tree-empty')).toHaveText('No address matches.');
    // Typing in the field fires no keys (x, d, l, p would).
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
  });

  test('the tier filter', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    await shadow(page, '[data-stadiaref-tree-filter="section"]').click();
    expect(await rows(page)).toEqual(['home-hero', 'list-grid', 'foot-bar']);
    await expect(shadow(page, '[data-stadiaref-tree-filter="section"]')).toHaveAttribute('aria-pressed', 'true');
    await shadow(page, '[data-stadiaref-tree-filter="all"]').click();
    expect((await rows(page)).length).toBe(22);
  });

  test('Problems: duplicates, unclassified and gaps in numbering, each opening its card', async ({ page }) => {
    await open(page, harness({ body: 'problems', cfg: { startHidden: false } }));
    await page.evaluate(() => window.stadiaref.toggleTree());
    await expect(shadow(page, '[data-stadiaref-tree-tab="problems"]')).toHaveText('Problems 3');
    await shadow(page, '[data-stadiaref-tree-tab="problems"]').click();
    await expect(shadow(page, '.stadiaref-tree-problem')).toHaveText(['DUP', 'DUP', '?', 'GAP']);
    expect(await rows(page)).toEqual([
      'home-cta (1 of 2)', 'home-cta (2 of 2)', 'Bad_Address (unclassified)',
      'home-cards-card-03, home-cards-card-04 missing, before home-cards-card-05',
    ]);
    await expect(shadow(page, '.stadiaref-tree-filters')).toBeHidden();
    await shadow(page, '.stadiaref-tree-row').nth(1).click();
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('home-cta');
    expect(await page.evaluate(() => document.getElementById('stadiaref-host').shadowRoot.querySelector('.stadiaref-highlight--card').getBoundingClientRect().top))
      .toBeCloseTo(await page.locator('[href="#b"]').evaluate((a) => a.getBoundingClientRect().top), 0);
  });

  test('a clean screen says so', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    await shadow(page, '[data-stadiaref-tree-tab="problems"]').click();
    await expect(shadow(page, '.stadiaref-tree-empty')).toHaveText('No problems: no duplicates, nothing unclassified, no gaps in numbering.');
  });

  test('Show in Tree clears a filter that hides the row', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    await shadow(page, '.stadiaref-tree-search').fill('list');
    await page.evaluate(() => window.stadiaref.card('home-hero-cta'));
    await shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Show in Tree' }).click();
    await expect(shadow(page, '.stadiaref-tree-search')).toHaveValue('');
    expect(await page.evaluate(() => document.getElementById('stadiaref-host').shadowRoot.activeElement.querySelector('.stadiaref-tree-ref').textContent)).toBe('home-hero-cta');
  });
});
