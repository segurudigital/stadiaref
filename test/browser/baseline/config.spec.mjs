// Baseline on the 3.0 names: config keys read from window.stadiarefConfig,
// and the script-tag attributes. Keys that keep their 2.x name until a later
// stage (autoRef, autoRefDepth, levelFilter, hotkey) are read from
// stadiarefConfig too. Precedence across the 2.x objects is in baseline-2x/.
import { test, expect } from '@playwright/test';
import { harness, open, countVisible, shadow, HOST_ID } from './helpers.mjs';

const get = (page, fn) => page.evaluate(`window.stadiaref.${fn}()`);

test.describe('per-page config (stadiarefConfig)', () => {
  test('defaults with no config', async ({ page }) => {
    await open(page, harness());
    expect(await page.evaluate(() => {
      const a = window.stadiaref;
      return {
        visible: a.isVisible(), labels: a.getLabels(), outline: a.getOutline(), dock: a.getDock(), user: a.getUser(),
      };
    })).toEqual({ visible: false, labels: 'full', outline: 'off', dock: 'bottom-right', user: null });
  });

  test('startHidden: false and "0" boot visible', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false } }));
    expect(await get(page, 'isVisible')).toBe(true);
    await open(page, harness({ page: { startHidden: '0' } }));
    expect(await get(page, 'isVisible')).toBe(true);
    await open(page, harness({ page: { startHidden: true } }));
    expect(await get(page, 'isVisible')).toBe(false);
  });

  test('labels: full / icons / off; anything else is full', async ({ page }) => {
    for (const [v, want] of [['full', 'full'], ['icons', 'icons'], ['off', 'off'], ['x', 'full'], [0, 'full']]) {
      await open(page, harness({ page: { startHidden: false, labels: v } }));
      expect(await get(page, 'getLabels'), 'labels ' + JSON.stringify(v)).toBe(want);
    }
  });

  test('classConverter turns dataref- classes into data-ref', async ({ page }) => {
    await open(page, harness({ body: 'converter', page: { classConverter: true } }));
    expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe('home-intro');
    // an explicit data-ref is never overwritten
    expect(await page.evaluate(() => document.querySelector('.dataref-home-kept').getAttribute('data-ref'))).toBe('home-explicit');
    await open(page, harness({ body: 'converter', page: { classConverter: '1' } }));
    expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe('home-intro');
    await open(page, harness({ body: 'converter' }));
    expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe(null);
  });

  test('class converter runs at boot even while hidden', async ({ page }) => {
    await open(page, harness({ body: 'converter', page: { classConverter: true } }));
    expect(await get(page, 'isVisible')).toBe(false);
    expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe('home-intro');
  });

  test('autoRef and autoRefDepth', async ({ page }) => {
    await open(page, harness({ page: { autoRef: true } }));
    expect(await get(page, 'getDepth')).toBe('all');
    expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length)).toBeGreaterThan(0);

    await open(page, harness({ page: { autoRef: '1', autoRefDepth: 'section' } }));
    expect(await get(page, 'getDepth')).toBe('section');
    const levels = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-stadiaref-auto-tier')));
    expect(levels.length).toBeGreaterThan(0);
    for (const l of levels) expect(l).toBe('section');

    await open(page, harness({ page: { autoRef: false, autoRefDepth: 'section' } }));
    expect(await get(page, 'getDepth')).toBe('off');
    expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length)).toBe(0);
  });

  test('automatic addresses use pageSlug, position and context', async ({ page }) => {
    await open(page, harness({ page: { autoRef: true, autoRefDepth: 'section', pageSlug: 'demo' } }));
    const refs = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    expect(refs).toEqual(['demo-03-section']);
  });

  test('2.5.0 automatic address for a path-derived slug', async ({ page }) => {
    // With no pageSlug, the slug comes from location.pathname: "/__harness" → "__harness".
    // 2.5.0 does not sanitise it (stage 4 fixes this); the baseline records it.
    await open(page, harness({ page: { autoRef: true, autoRefDepth: 'section' } }));
    const refs = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    expect(refs).toEqual(['__harness-03-section']);
  });

  test('outlineMode', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false, outline: 'section' } }));
    expect(await get(page, 'getOutline')).toBe('section');
    expect(await page.evaluate(() => document.querySelectorAll('.stadiaref-outline-section').length)).toBeGreaterThan(0);
  });

  test('levelFilter', async ({ page }) => {
    await open(page, harness({ page: { levelFilter: 'section' } }));
    expect(await get(page, 'getLevelFilter')).toBe('section');
    expect(await page.evaluate(() => document.body.classList.contains('stadiaref-filter-section'))).toBe(true);
  });

  test('hotkey', async ({ page }) => {
    await open(page, harness({ page: { hotkey: 'k' } }));
    expect(await get(page, 'getHotkey')).toBe('K');
    await open(page, harness({ page: { hotkey: false } }));
    expect(await get(page, 'getHotkey')).toBe(false);
  });

  test('theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await open(page, harness({ page: { theme: 'dark' } }));
    expect(await get(page, 'getTheme')).toBe('dark');
    expect(await page.evaluate((id) => document.getElementById(id).classList.contains('stadiaref-theme-dark'), HOST_ID)).toBe(true);
  });

  test('dock', async ({ page }) => {
    await open(page, harness({ page: { dock: 'top-left' } }));
    expect(await get(page, 'getDock')).toBe('top-left');
    await open(page, harness({ page: { dock: 'TOP-RIGHT', position: 'bottom-left' } }));
    expect(await get(page, 'getDock')).toBe('top-right');
    await open(page, harness({ page: { dock: 'auto' } }));
    expect(await get(page, 'getDock')).toBe('bottom-right');
  });

  test('dock: auto avoids a blocked corner', async ({ page }) => {
    await open(page, harness({ page: { dock: 'auto' }, pre: "document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.style.cssText='position:fixed;right:0;bottom:0;width:300px;height:200px;background:#eee';document.body.insertBefore(d,document.body.firstChild);});" }));
    expect(await get(page, 'getDock')).toBe('bottom-left');
  });

  test('user', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false, user: { name: 'Sam', role: 'qa', secret: 1 } } }));
    expect(await get(page, 'getUser')).toEqual({ name: 'Sam', role: 'qa' });
    await expect(shadow(page, '[data-stadiaref-user-role]')).toHaveText('qa');
  });
});

test.describe('script-tag attributes', () => {
  test('data-hotkey, data-theme, data-dock', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await open(page, harness({ attrs: { 'data-hotkey': 'j', 'data-theme': 'dark', 'data-dock': 'top-left' } }));
    expect(await page.evaluate(() => {
      const a = window.stadiaref;
      return [a.getHotkey(), a.getTheme(), a.getDock()];
    })).toEqual(['J', 'dark', 'top-left']);
  });

  test('data-labels', async ({ page }) => {
    await open(page, harness({ attrs: { 'data-labels': 'icons' } }));
    expect(await get(page, 'getLabels')).toBe('icons');
  });

  test('data-position', async ({ page }) => {
    await open(page, harness({ attrs: { 'data-position': 'bottom-left' } }));
    expect(await get(page, 'getDock')).toBe('bottom-left');
  });

  test('config objects win over script attributes', async ({ page }) => {
    await open(page, harness({ attrs: { 'data-hotkey': 'j' }, wp: { hotkey: 'w' } }));
    expect(await get(page, 'getHotkey')).toBe('W');
    await open(page, harness({ attrs: { 'data-hotkey': 'j' }, page: { hotkey: 'p' } }));
    expect(await get(page, 'getHotkey')).toBe('P');
  });
});

test.describe('pre-boot calls and load order', () => {
  test('existing QA page: pre-boot hide() survives boot', async ({ page }) => {
    await page.goto('/test/qa-preboot-hide.html');
    await page.waitForFunction(() => window.QA && window.QA.readyFired);
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  });

  // 3.0 fixes the 2.5.0 start-up order: the global is assigned before start,
  // so it exists when ready fires even for a deferred script.
  test('deferred script: the global exists when ready fires', async ({ page }) => {
    await page.addInitScript(() => {
      window.__readySawGlobal = null;
      window.addEventListener('stadiaref:ready', () => { window.__readySawGlobal = !!window.stadiaref; });
    });
    await open(page, harness({ defer: true }));
    expect(await page.evaluate(() => window.__readySawGlobal)).toBe(true);
  });

  test('classic script in body: global exists when ready fires', async ({ page }) => {
    await page.addInitScript(() => {
      window.__readySawGlobal = null;
      window.addEventListener('stadiaref:ready', () => { window.__readySawGlobal = !!window.stadiaref; });
    });
    await open(page, harness());
    expect(await page.evaluate(() => window.__readySawGlobal)).toBe(true);
  });
});

test('existing QA page: hotkey disabled', async ({ page }) => {
  await page.goto('/test/qa-hotkey-disabled.html');
  await page.waitForFunction(() => !!window.stadiaref);
  expect(await page.evaluate(() => window.stadiaref.getHotkey())).toBe(false);
});

test('labels are injected at boot even while hidden (2.5.0 behaviour)', async ({ page }) => {
  await open(page, harness());
  expect(await get(page, 'isVisible')).toBe(false);
  expect(await page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label').length)).toBe(2);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
});
