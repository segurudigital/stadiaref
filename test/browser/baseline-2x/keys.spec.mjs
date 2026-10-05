// Baseline: the 2.5.0 keyboard shortcuts D, L, T, O, F and Esc.
import { test, expect } from '@playwright/test';
import { harness, open, press, shadow } from './helpers.mjs';

const a = (page, expr) => page.evaluate('window.seguruDebugToolbar.' + expr);

test('D toggles the toolbar', async ({ page }) => {
  await open(page, harness());
  await press(page, 'd');
  expect(await a(page, 'isVisible()')).toBe(true);
  await press(page, 'D');
  expect(await a(page, 'isVisible()')).toBe(false);
});

test('rebound hotkey replaces D; false disables it', async ({ page }) => {
  await open(page, harness({ page: { hotkey: 'k' } }));
  await press(page, 'd');
  expect(await a(page, 'isVisible()')).toBe(false);
  await press(page, 'k');
  expect(await a(page, 'isVisible()')).toBe(true);
  await open(page, harness({ page: { hotkey: false } }));
  await press(page, 'd');
  expect(await a(page, 'isVisible()')).toBe(false);
});

test('a hotkey rebound to L toggles instead of cycling labels', async ({ page }) => {
  await open(page, harness({ page: { hotkey: 'l', startHidden: false } }));
  await press(page, 'l');
  expect(await a(page, 'isVisible()')).toBe(false);
  expect(await a(page, 'getState()')).toBe(2);
});

test('L cycles Labels Off → Icons → Full', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const seen = [];
  for (let i = 0; i < 4; i++) { await press(page, 'l'); seen.push(await a(page, 'getState()')); }
  // from Full (2): next is Off (1), Icons (0), Full (2), Off (1)
  expect(seen).toEqual([1, 0, 2, 1]);
});

test('T cycles Target Off → Sections → Blocks → Elements → All → Off', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const seen = [];
  for (let i = 0; i < 5; i++) { await press(page, 't'); seen.push(await a(page, 'getDepth()')); }
  expect(seen).toEqual(['section', 'block', 'element', 'all', 'off']);
});

test('O cycles Outline Off → Sections → Blocks → Off', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const seen = [];
  for (let i = 0; i < 3; i++) { await press(page, 'o'); seen.push(await a(page, 'getOutline()')); }
  expect(seen).toEqual(['section', 'block', 'off']);
});

test('F cycles Level All → Sec+Blk → Sections → All', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const seen = [];
  for (let i = 0; i < 3; i++) { await press(page, 'f'); seen.push(await a(page, 'getLevelFilter()')); }
  expect(seen).toEqual(['section-block', 'section', 'all']);
});

test('L, T, O, F work while the toolbar is hidden', async ({ page }) => {
  await open(page, harness());
  await press(page, 'l');
  await press(page, 't');
  await press(page, 'o');
  await press(page, 'f');
  expect(await page.evaluate(() => {
    const x = window.seguruDebugToolbar;
    return [x.isVisible(), x.getState(), x.getDepth(), x.getOutline(), x.getLevelFilter()];
  })).toEqual([false, 1, 'section', 'section', 'section-block']);
});

test('Esc closes menus and the Tree and hides the toolbar in one press', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  await shadow(page, '[data-stadiaref-toggle="mode"]').click();
  await expect(shadow(page, '[data-stadiaref-menu="mode"]')).toHaveClass(/stadiaref-toolbar__dropdown--open/);
  await page.evaluate(() => window.seguruDebugToolbar.toggleTree());
  await press(page, 'Escape');
  expect(await a(page, 'isVisible()')).toBe(false);
  await expect(shadow(page, '[data-stadiaref-menu="mode"]')).not.toHaveClass(/stadiaref-toolbar__dropdown--open/);
  await expect(shadow(page, '.stadiaref-tree-panel')).not.toHaveClass(/stadiaref-tree-panel--open/);
  // Esc while hidden is a no-op (no extra hide event, stays hidden)
  await press(page, 'Escape');
  expect(await a(page, 'isVisible()')).toBe(false);
});

test('keys are ignored with any modifier, Shift included (2.5.0)', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  for (const k of ['Shift+L', 'Control+l', 'Alt+l', 'Meta+l', 'Shift+D', 'Shift+Escape']) await press(page, k);
  expect(await page.evaluate(() => [window.seguruDebugToolbar.getState(), window.seguruDebugToolbar.isVisible()])).toEqual([2, true]);
});

test('keys are ignored while typing in inputs, textareas, selects and contenteditable', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false }, pre: "document.addEventListener('DOMContentLoaded',function(){document.body.insertAdjacentHTML('afterbegin','<input id=i><textarea id=t></textarea><div id=c contenteditable>x</div><select id=s><option>a</option></select>');});" }));
  for (const sel of ['#i', '#t', '#c', '#s']) {
    await page.locator(sel).focus();
    await page.keyboard.press('d');
    await page.keyboard.press('l');
    await page.keyboard.press('Escape');
  }
  expect(await page.evaluate(() => [window.seguruDebugToolbar.getState(), window.seguruDebugToolbar.isVisible()])).toEqual([2, true]);
});

test('existing QA page: hotkey disabled leaves the input usable', async ({ page }) => {
  await page.goto('/test/qa-hotkey-disabled.html');
  await page.waitForFunction(() => window.QA && window.QA.ready);
  await press(page, 'd');
  expect(await a(page, 'isVisible()')).toBe(true);
  await page.locator('#qa-input').fill('dld');
  expect(await page.locator('#qa-input').inputValue()).toBe('dld');
});
