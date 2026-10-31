// dock: 'host' with mount: the toolbar inline in a page element (3.3).
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, HOST_ID } from './helpers.mjs';

const { harness, open } = makeHelpers(NEW);

const mountPage = (cfg = {}) => harness({ body: 'mount', cfg: { startHidden: false, dock: 'host', mount: '#slot', ...cfg } });
// Where the toolbar is: 'slot' (inline in #slot) or 'corner' (StadiaRef's own host).
const where = (page) => page.evaluate((id) => {
  const slotHost = document.querySelector('#slot > .stadiaref-mount');
  if (slotHost && slotHost.shadowRoot.querySelector('.stadiaref-toolbar')) return 'slot';
  return document.getElementById(id).shadowRoot.querySelector('.stadiaref-toolbar') ? 'corner' : 'none';
}, HOST_ID);
const toolbar = (page) => page.locator('#slot > .stadiaref-mount').locator('.stadiaref-toolbar');

test('the toolbar renders inside the mount element, inline, with no fixed positioning', async ({ page }) => {
  await open(page, mountPage());
  expect(await where(page)).toBe('slot');
  expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('host');
  const css = await toolbar(page).evaluate((t) => [getComputedStyle(t).position, t.style.top, t.style.bottom, t.style.left, t.style.right]);
  expect(css).toEqual(['relative', '', '', '', '']);
  const [bar, slot] = [await toolbar(page).boundingBox(), await page.locator('#slot').boundingBox()];
  expect(bar.y).toBeGreaterThanOrEqual(slot.y - 1);
  expect(bar.y + bar.height).toBeLessThanOrEqual(slot.y + slot.height + 1);
  // The controls work from there.
  await toolbar(page).locator('[data-stadiaref-toggle-tree]').click();
  expect(await page.evaluate((id) => document.getElementById(id).shadowRoot.querySelector('.stadiaref-tree-panel').classList.contains('stadiaref-tree-panel--open'), HOST_ID)).toBe(true);
  await toolbar(page).locator('[data-stadiaref-toggle="labels"], [data-stadiaref-toggle]').first().click();
  await expect(toolbar(page).locator('.stadiaref-toolbar__dropdown--open')).toHaveCount(1);
});

test('hide and show take the inline toolbar with them; nothing is written before the first show', async ({ page }) => {
  await open(page, harness({ body: 'mount', cfg: { dock: 'host', mount: '#slot' } }));
  expect(await page.evaluate(() => document.querySelector('#slot').children.length)).toBe(0);
  await page.evaluate(() => window.stadiaref.show());
  await expect(toolbar(page)).toBeVisible();
  await page.evaluate(() => window.stadiaref.hide());
  await expect(toolbar(page)).toBeHidden();
  await page.evaluate(() => window.stadiaref.show());
  await expect(toolbar(page)).toBeVisible();
});

test('falls back to the default corner when the selector finds nothing, and moves in when the element appears', async ({ page }) => {
  await open(page, mountPage({ mount: '#later' }));
  expect(await where(page)).toBe('corner');
  const bar = await page.locator('#' + HOST_ID).locator('.stadiaref-toolbar').boundingBox();
  expect(Math.round(1280 - (bar.x + bar.width))).toBe(20);
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'later'; document.getElementById('app-bar').appendChild(d); });
  await expect.poll(() => page.evaluate(() => !!document.querySelector('#later > .stadiaref-mount'))).toBe(true);
  // An element the page re-renders away sends it back to the corner.
  await page.evaluate(() => document.getElementById('later').remove());
  await expect.poll(() => where(page)).toBe('corner');
});

test('an invalid selector warns once and falls back', async ({ page }) => {
  const warnings = [];
  page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
  await open(page, mountPage({ mount: '##bad' }));
  expect(await where(page)).toBe('corner');
  await page.evaluate(() => window.stadiaref.refresh());
  expect(warnings.filter((w) => w.includes('mount is not a valid selector'))).toHaveLength(1);
});

test('setDock moves it between a corner and the host element', async ({ page }) => {
  await open(page, mountPage());
  await page.evaluate(() => window.stadiaref.setDock('top-left'));
  expect(await where(page)).toBe('corner');
  await page.evaluate(() => window.stadiaref.setDock({ mount: '#slot' }));
  expect(await where(page)).toBe('slot');
});

test('the theme follows into the mount', async ({ page }) => {
  await open(page, mountPage({ theme: 'dark' }));
  expect(await page.evaluate(() => document.querySelector('#slot > .stadiaref-mount').classList.contains('stadiaref-theme-dark'))).toBe(true);
  await page.evaluate(() => window.stadiaref.setTheme('light'));
  expect(await page.evaluate(() => document.querySelector('#slot > .stadiaref-mount').classList.contains('stadiaref-theme-dark'))).toBe(false);
});

test('while a host modal is open the toolbar moves into the modal, and comes back after', async ({ page }) => {
  await open(page, mountPage());
  await page.evaluate(() => document.getElementById('dlg').showModal());
  await expect.poll(() => where(page)).toBe('corner');
  await page.evaluate(() => document.getElementById('dlg').close());
  await expect.poll(() => where(page)).toBe('slot');
});
