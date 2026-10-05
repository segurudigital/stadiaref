// Baseline on the 3.0 names: the stadiaref:* events and their detail.
// depth-change and level-filter-change have no 3.0 twin until stage 4;
// baseline-2x/ covers them.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { harness, open, recordEvents, events, eventsSoon, clearEvents, shadow } from './helpers.mjs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => { await recordEvents(page); });

test('events are dispatched on window, not cancelable, not bubbling', async ({ page }) => {
  await open(page, harness());
  const [ready] = await events(page, 'ready');
  expect(ready.cancelable).toBe(false);
  expect(ready.bubbles).toBe(false);
});

test('ready carries the version, once', async ({ page }) => {
  await open(page, harness());
  const ready = await events(page, 'ready');
  expect(ready).toHaveLength(1);
  expect(ready[0].detail).toEqual({ version: pkg.version });
});

test('show and hide carry an empty detail', async ({ page }) => {
  await open(page, harness());
  await page.evaluate(() => { window.stadiaref.show(); window.stadiaref.hide(); });
  expect((await events(page, 'show')).map((e) => e.detail)).toEqual([{}]);
  expect((await events(page, 'hide')).map((e) => e.detail)).toEqual([{}]);
});

test('theme-change carries the resolved theme and the mode, only on change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, harness());
  await clearEvents(page);
  await page.evaluate(() => window.stadiaref.setTheme('dark'));
  await page.evaluate(() => window.stadiaref.setTheme('dark'));
  await page.evaluate(() => window.stadiaref.setTheme('auto'));
  expect((await events(page, 'theme-change')).map((e) => e.detail)).toEqual([
    { theme: 'dark', mode: 'dark' },
    { theme: 'light', mode: 'auto' },
  ]);
});

test('user-change carries a snapshot of the user', async ({ page }) => {
  await open(page, harness());
  await page.evaluate(() => window.stadiaref.setUser({ name: 'Ann', pw: 'x' }));
  await page.evaluate(() => window.stadiaref.setUser(null));
  expect((await events(page, 'user-change')).map((e) => e.detail)).toEqual([{ user: { name: 'Ann' } }, { user: null }]);
});

test('labels-change and outline-change', async ({ page }) => {
  await open(page, harness());
  await page.evaluate(() => {
    const a = window.stadiaref;
    a.setLabels('icons'); a.setLabels('bogus'); a.setLabels('off');
    a.setOutline('section'); a.setOutline('bad');
  });
  expect((await events(page, 'labels-change')).map((e) => e.detail)).toEqual([{ labels: 'icons' }, { labels: 'off' }]);
  expect((await events(page, 'outline-change')).map((e) => e.detail)).toEqual([{ outline: 'section' }, { outline: 'off' }]);
});

test('no labels-change at start', async ({ page }) => {
  await open(page, harness({ page: { labels: 'off' } }));
  expect(await events(page, 'labels-change')).toHaveLength(0);
});

test('address-hover, address-leave, address-click from the full label', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false } }));
  const label = page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label');
  await label.hover();
  await page.mouse.move(5, 890);
  await label.click();
  const hov = await events(page, 'address-hover');
  const leave = await events(page, 'address-leave');
  const click = await eventsSoon(page, 'address-click');
  for (const list of [hov, leave, click]) {
    expect(list.length).toBeGreaterThan(0);
    const d = list[0].detail;
    expect(d.address).toBe('home-hero');
    expect(d.tier).toBe('section');
    expect(d.element).toMatchObject({ node: true, tag: 'section', ref: 'home-hero' });
    expect(d).not.toHaveProperty('dataRef');
    expect(d).not.toHaveProperty('current');
  }
  expect(click[0].detail.source).toBe('label');
  expect(click[0].detail.copied).toBe(true);
  expect(hov[0].detail).not.toHaveProperty('source');
});

test('address-click from the icon (icons mode)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false, labels: 'icons' } }));
  await page.locator('[data-ref="home-features"] > .stadiaref-ref-icon').click();
  const click = await eventsSoon(page, 'address-click');
  expect(click).toHaveLength(1);
  expect(click[0].detail).toMatchObject({ address: 'home-features', tier: 'section', source: 'label' });
});

test('Tree row copy button copies and emits address-click (source tree); row click only jumps', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false } }));
  await page.evaluate(() => window.stadiaref.toggleTree());
  await clearEvents(page);
  const rows = shadow(page, '.stadiaref-tree-row');
  await expect(rows).toHaveCount(2);
  await rows.nth(1).locator('.stadiaref-tree-copy').click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('home-features');
  await expect(shadow(page, '.stadiaref-toast')).toHaveText('Copied: home-features');
  const [click] = await eventsSoon(page, 'address-click');
  expect(click.detail).toMatchObject({ address: 'home-features', source: 'tree', copied: true });
  await clearEvents(page);
  await rows.nth(0).click();
  await page.waitForTimeout(100);
  expect(await events(page, 'address-click')).toHaveLength(0);
  // The jump frame is drawn in StadiaRef's shadow root over the element.
  await expect(shadow(page, '.stadiaref-highlight--jump')).toBeVisible();
  const [frame, target] = [await shadow(page, '.stadiaref-highlight--jump').boundingBox(), await page.locator('[data-ref="home-hero"]').boundingBox()];
  expect(Math.abs(frame.y - target.y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.querySelector('[data-ref="home-hero"]').className)).toBe('');
});

test('address-click from a block-group popover row', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-dense.html');
  await page.evaluate(() => window.stadiaref.show());
  await page.locator('.stadiaref-block-group-badge').first().hover();
  await page.locator('.stadiaref-block-group-item').nth(2).click();
  const [click] = await eventsSoon(page, 'address-click');
  // The fixture uses the Titan grammar, which is still the only classifier.
  expect(click.detail).toMatchObject({ address: 'home-services-card-03', tier: 'block', source: 'label' });
  expect(click.detail.element.ref).toBe('home-services-card-03');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('home-services-card-03');
});

test('address-click from a "+N" cluster popover row', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/demo.html?ar=1');
  await page.evaluate(() => window.stadiaref.show());
  const badge = page.locator('.stadiaref-cluster-badge').first();
  await badge.hover();
  const item = badge.locator('.stadiaref-cluster-item').first();
  const ref = await item.locator('.stadiaref-cluster-item-ref').textContent();
  await item.click();
  const [click] = await eventsSoon(page, 'address-click');
  expect(click.detail).toMatchObject({ address: ref, tier: 'element', source: 'label' });
  expect(click.detail.element.ref).toBe(ref);
});

test('hovering a label opens the address chain; a chain row click emits address-click', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-small.html');
  await page.evaluate(() => window.stadiaref.show());
  await page.locator('[data-ref="home-hero-card-02"] > .stadiaref-ref-full-label').hover();
  const tree = shadow(page, '.stadiaref-active-ref-tree');
  await expect(tree).toHaveClass(/stadiaref-active-ref-tree--open/);
  await expect(shadow(page, '.stadiaref-active-ref-tree__row-ref')).toHaveText(['home-hero', 'home-hero-card-02']);
  await clearEvents(page);
  // Click the first (section) row directly; moving the pointer there would close the chain.
  await page.evaluate(() => document.getElementById('stadiaref-host').shadowRoot.querySelector('.stadiaref-active-ref-tree__row').click());
  const [click] = await eventsSoon(page, 'address-click');
  expect(click.detail).toMatchObject({ address: 'home-hero', tier: 'section', source: 'label' });
  expect(click.detail.element.ref).toBe('home-hero');
});
