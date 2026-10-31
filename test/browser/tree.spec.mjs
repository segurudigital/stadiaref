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
