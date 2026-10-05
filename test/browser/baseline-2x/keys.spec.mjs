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

test('T and F are not bound in 3.0', async ({ page }) => {
  // 2.5.0: T cycled Target and F cycled Level. 3.0 replaces both with Show
  // (keys 1, 2, 3) and the auto-address setting.
  await open(page, harness({ page: { startHidden: false } }));
  await press(page, 't');
  await press(page, 'f');
  expect(await page.evaluate(() => [window.seguruDebugToolbar.getDepth(), window.seguruDebugToolbar.getLevelFilter()])).toEqual(['off', 'all']);
});

test('O cycles Outline Off → Sections → Blocks → Off', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const seen = [];
  for (let i = 0; i < 3; i++) { await press(page, 'o'); seen.push(await a(page, 'getOutline()')); }
  expect(seen).toEqual(['section', 'block', 'off']);
});

test('L and O work while the toolbar is hidden', async ({ page }) => {
  await open(page, harness());
  await press(page, 'l');
  await press(page, 'o');
  expect(await page.evaluate(() => {
    const x = window.seguruDebugToolbar;
    return [x.isVisible(), x.getState(), x.getOutline()];
  })).toEqual([false, 1, 'section']);
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

test('keys are ignored with Ctrl, Alt or Cmd held; Shift is allowed', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  // 2.5.0 ignored Shift too; 3.0 allows it so / and digits work on any layout.
  for (const k of ['Control+l', 'Alt+l', 'Meta+l', 'Control+d', 'Alt+Escape']) await press(page, k);
  expect(await page.evaluate(() => [window.seguruDebugToolbar.getState(), window.seguruDebugToolbar.isVisible()])).toEqual([2, true]);
  await press(page, 'Shift+L');
  expect(await page.evaluate(() => window.seguruDebugToolbar.getState())).toBe(1);
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
