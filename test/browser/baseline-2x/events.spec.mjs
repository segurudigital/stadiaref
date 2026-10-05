// Baseline: every event 2.5.0 passes to emitEvent(), with its detail.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { harness, open, recordEvents, events, clearEvents, shadow } from './helpers.mjs';

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
  await page.evaluate(() => { window.seguruDebugToolbar.show(); window.seguruDebugToolbar.hide(); });
  expect((await events(page, 'show')).map((e) => e.detail)).toEqual([{}]);
  expect((await events(page, 'hide')).map((e) => e.detail)).toEqual([{}]);
});

test('theme-change carries the resolved theme and the mode, only on change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, harness());
  await clearEvents(page);
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('dark'));
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('dark'));
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('auto'));
  expect((await events(page, 'theme-change')).map((e) => e.detail)).toEqual([
    { theme: 'dark', mode: 'dark' },
    { theme: 'light', mode: 'auto' },
  ]);
});

test('user-change carries a snapshot of the user', async ({ page }) => {
  await open(page, harness());
  await page.evaluate(() => window.seguruDebugToolbar.setUser({ name: 'Ann', pw: 'x' }));
  await page.evaluate(() => window.seguruDebugToolbar.setUser(null));
  expect((await events(page, 'user-change')).map((e) => e.detail)).toEqual([{ user: { name: 'Ann' } }, { user: null }]);
});

test('depth-change, outline-change, level-filter-change', async ({ page }) => {
  await open(page, harness());
  await page.evaluate(() => {
    const a = window.seguruDebugToolbar;
    a.setDepth('block'); a.setDepth('off');
    a.setOutline('section'); a.setOutline('bad');
    a.setLevelFilter('section-block'); a.setLevelFilter('bad');
  });
  expect((await events(page, 'depth-change')).map((e) => e.detail)).toEqual([{ depth: 'block' }, { depth: 'off' }]);
  expect((await events(page, 'outline-change')).map((e) => e.detail)).toEqual([{ outline: 'section' }, { outline: 'off' }]);
  expect((await events(page, 'level-filter-change')).map((e) => e.detail)).toEqual([{ levelFilter: 'section-block' }]);
});

test('dataref-hover, dataref-leave, dataref-click from the full label', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false } }));
  const label = page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label');
  await label.hover();
  await page.mouse.move(5, 890);
  await label.click();
  const hov = await events(page, 'dataref-hover');
  const leave = await events(page, 'dataref-leave');
  const click = await events(page, 'dataref-click');
  for (const list of [hov, leave, click]) {
    expect(list.length).toBeGreaterThan(0);
    const d = list[0].detail;
    expect(d.dataRef).toBe('home-hero');
    expect(d.element).toMatchObject({ node: true, tag: 'section', ref: 'home-hero' });
    expect(d.current).toMatchObject({ node: true, tag: 'span' });
    expect(d.current.cls).toContain('stadiaref-ref-full-label');
  }
});

test('dataref-click from the icon (icons mode)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false, defaultMode: 0 } }));
  await page.locator('[data-ref="home-features"] > .stadiaref-ref-icon').click();
  const click = await events(page, 'dataref-click');
  expect(click).toHaveLength(1);
  expect(click[0].detail.dataRef).toBe('home-features');
  expect(click[0].detail.current.cls).toContain('stadiaref-ref-icon');
});

test('Tree row copy button copies but emits no event in 2.5.0; row click only jumps', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, harness({ page: { startHidden: false } }));
  await page.evaluate(() => window.seguruDebugToolbar.toggleTree());
  await clearEvents(page);
  const rows = shadow(page, '.stadiaref-tree-row');
  await expect(rows).toHaveCount(2);
  await rows.nth(1).locator('.stadiaref-tree-copy').click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('home-features');
  await expect(shadow(page, '.stadiaref-toast')).toHaveText('Copied: home-features');
  expect(await events(page, 'dataref-click')).toHaveLength(0);
  await rows.nth(0).click();
  expect(await events(page, 'dataref-click')).toHaveLength(0);
  // The jump frame is drawn in StadiaRef's shadow root over the element.
  await expect(shadow(page, '.stadiaref-highlight--jump')).toBeVisible();
  const [frame, target] = [await shadow(page, '.stadiaref-highlight--jump').boundingBox(), await page.locator('[data-ref="home-hero"]').boundingBox()];
  expect(Math.abs(frame.y - target.y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.querySelector('[data-ref="home-hero"]').className)).toBe('');
});

test('dataref-click from a block-group popover row', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-dense.html');
  await page.evaluate(() => window.seguruDebugToolbar.show());
  await page.locator('.stadiaref-block-group-badge').first().hover();
  await page.locator('.stadiaref-block-group-item').nth(2).click();
  const [click] = await events(page, 'dataref-click');
  expect(click.detail.dataRef).toBe('hf-services-card-03');
  expect(click.detail.element.ref).toBe('hf-services-card-03');
  expect(click.detail.current.cls).toBe('stadiaref-block-group-item');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('hf-services-card-03');
});

test('dataref-click from a "+N" cluster popover row', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/demo.html?ar=1');
  await page.evaluate(() => window.seguruDebugToolbar.show());
  const badge = page.locator('.stadiaref-cluster-badge').first();
  await badge.hover();
  const item = badge.locator('.stadiaref-cluster-item').first();
  const ref = await item.locator('.stadiaref-cluster-item-ref').textContent();
  await item.click();
  const [click] = await events(page, 'dataref-click');
  expect(click.detail.dataRef).toBe(ref);
  expect(click.detail.element.ref).toBe(ref);
  expect(click.detail.current.cls).toBe('stadiaref-cluster-item');
});

test('hovering a label opens the address chain; a chain row click emits dataref-click', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-small.html');
  await page.evaluate(() => window.seguruDebugToolbar.show());
  await page.locator('[data-ref="hf-hero-card-02"] > .stadiaref-ref-full-label').hover();
  const tree = shadow(page, '.stadiaref-active-ref-tree');
  await expect(tree).toHaveClass(/stadiaref-active-ref-tree--open/);
  await expect(shadow(page, '.stadiaref-active-ref-tree__row-ref')).toHaveText(['hf-hero', 'hf-hero-card-02']);
  await clearEvents(page);
  // Click the first (section) row directly; moving the pointer there would close the chain.
  await page.evaluate(() => document.getElementById('stadiaref-host').shadowRoot.querySelector('.stadiaref-active-ref-tree__row').click());
  const [click] = await events(page, 'dataref-click');
  expect(click.detail.dataRef).toBe('hf-hero');
  expect(click.detail.element.ref).toBe('hf-hero');
  // 2.5.0 captured `current` from a loop `var`, so it was always the last
  // row of the chain. Fixed in 3.0: it is the row that was clicked.
  expect(click.detail.current.cls).toBe('stadiaref-active-ref-tree__row');
});
