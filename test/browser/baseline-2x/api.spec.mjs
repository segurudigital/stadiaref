// Baseline: the 2.5.0 API object, member by member.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { harness, open, recordEvents, events, countVisible, shadow, HOST_ID } from './helpers.mjs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));

const MEMBERS = [
  'version', 'setState', 'getState', 'setDepth', 'getDepth', 'setOutline', 'getOutline',
  'refresh', 'toggleTree', 'hide', 'show', 'toggle', 'isVisible', 'setHotkey', 'getHotkey',
  'setTheme', 'getTheme', 'setUser', 'getUser', 'setDock', 'getDock',
  'setLevelFilter', 'getLevelFilter', 'classifyDataRef', 'init',
];

test.beforeEach(async ({ page }) => { await recordEvents(page); });

test('API object has every 2.5.0 member', async ({ page }) => {
  await open(page, harness());
  const shape = await page.evaluate(() => {
    const a = window.seguruDebugToolbar;
    const o = {};
    Object.keys(a).forEach((k) => { o[k] = typeof a[k]; });
    return o;
  });
  for (const m of MEMBERS) expect(shape, m).toHaveProperty(m);
  expect(shape.version).toBe('string');
  for (const m of MEMBERS.filter((x) => x !== 'version')) expect(shape[m], m).toBe('function');
});

test('version matches package.json', async ({ page }) => {
  await open(page, harness());
  expect(await page.evaluate(() => window.seguruDebugToolbar.version)).toBe(pkg.version);
});

test('starts hidden; show/hide/toggle/isVisible', async ({ page }) => {
  await open(page, harness());
  const host = page.locator('#' + HOST_ID);
  expect(await page.evaluate(() => window.seguruDebugToolbar.isVisible())).toBe(false);
  await expect(host).toBeHidden();
  expect(await page.evaluate(() => document.body.classList.contains('stadiaref-presentation'))).toBe(true);

  await page.evaluate(() => window.seguruDebugToolbar.show());
  expect(await page.evaluate(() => window.seguruDebugToolbar.isVisible())).toBe(true);
  expect(await page.evaluate(() => document.body.classList.contains('stadiaref-presentation'))).toBe(false);
  await expect(shadow(page, '.stadiaref-toolbar')).toBeVisible();

  // idempotent
  await page.evaluate(() => window.seguruDebugToolbar.show());
  expect((await events(page, 'show')).length).toBe(1);

  await page.evaluate(() => window.seguruDebugToolbar.toggle());
  expect(await page.evaluate(() => window.seguruDebugToolbar.isVisible())).toBe(false);
  await page.evaluate(() => window.seguruDebugToolbar.toggle());
  expect(await page.evaluate(() => window.seguruDebugToolbar.isVisible())).toBe(true);
  await page.evaluate(() => window.seguruDebugToolbar.hide());
  await page.evaluate(() => window.seguruDebugToolbar.hide());
  expect((await events(page, 'hide')).length).toBe(2);
});

test('setState / getState drive label mode', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getState())).toBe(2);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(2);

  await page.evaluate(() => window.seguruDebugToolbar.setState(0));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getState())).toBe(0);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
  expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(2);

  await page.evaluate(() => window.seguruDebugToolbar.setState(1));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getState())).toBe(1);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
  expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(0);
  expect(await page.evaluate(() => document.body.classList.contains('stadiaref-hide'))).toBe(true);
  await expect(shadow(page, '[data-stadiaref-toggle="mode"] .stadiaref-toolbar__value')).toHaveText('Off');
});

test('setDepth / getDepth toggle auto-ref per tier', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDepth())).toBe('off');
  expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length)).toBe(0);

  await page.evaluate(() => window.seguruDebugToolbar.setDepth('all'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDepth())).toBe('all');
  const allCount = await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length);
  expect(allCount).toBeGreaterThan(0);

  for (const d of ['section', 'block', 'element']) {
    await page.evaluate((v) => window.seguruDebugToolbar.setDepth(v), d);
    expect(await page.evaluate(() => window.seguruDebugToolbar.getDepth())).toBe(d);
    const levels = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-stadiaref-auto-tier')));
    for (const l of levels) expect(l).toBe(d);
  }

  await page.evaluate(() => window.seguruDebugToolbar.setDepth('off'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDepth())).toBe('off');
  expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length)).toBe(0);
  // authored addresses survive every depth change
  expect(await page.evaluate(() => document.querySelectorAll('[data-ref]').length)).toBe(2);
});

test('setOutline / getOutline', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getOutline())).toBe('off');
  await page.evaluate(() => window.seguruDebugToolbar.setOutline('section'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getOutline())).toBe('section');
  await page.evaluate(() => window.seguruDebugToolbar.setOutline('block'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getOutline())).toBe('block');
  await page.evaluate(() => window.seguruDebugToolbar.setOutline('nonsense'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getOutline())).toBe('off');
});

test('setLevelFilter / getLevelFilter', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getLevelFilter())).toBe('all');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getLevelFilter())).toBe('section');
  // 3.0 keeps the Show state on <html>; 2.5.0 used body classes.
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-stadiaref-hidden-tiers'))).toBe('block element');
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('section-block'));
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-stadiaref-hidden-tiers'))).toBe('element');
  // invalid values are ignored with a warning
  const warnings = [];
  page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
  await page.evaluate(() => window.seguruDebugToolbar.setLevelFilter('bogus'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getLevelFilter())).toBe('section-block');
  expect(warnings.some((w) => w.includes('setLevelFilter'))).toBe(true);
});

test('toggleTree opens and closes the Tree panel', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const panel = shadow(page, '.stadiaref-tree-panel');
  await expect(panel).not.toHaveClass(/stadiaref-tree-panel--open/);
  await page.evaluate(() => window.seguruDebugToolbar.toggleTree());
  await expect(panel).toHaveClass(/stadiaref-tree-panel--open/);
  await expect(panel).toContainText('home-hero');
  await page.evaluate(() => window.seguruDebugToolbar.toggleTree());
  await expect(panel).not.toHaveClass(/stadiaref-tree-panel--open/);
});

test('setHotkey / getHotkey normalise to one upper-case letter or false', async ({ page }) => {
  await open(page, harness());
  const get = () => page.evaluate(() => window.seguruDebugToolbar.getHotkey());
  expect(await get()).toBe('D');
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey('k'));
  expect(await get()).toBe('K');
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey('zebra'));
  expect(await get()).toBe('Z');
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey(false));
  expect(await get()).toBe(false);
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey('false'));
  expect(await get()).toBe(false);
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey('7'));
  expect(await get()).toBe('D');
  await page.evaluate(() => window.seguruDebugToolbar.setHotkey(''));
  expect(await get()).toBe('D');
});

test('setTheme / getTheme, persisted to localStorage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, harness());
  expect(await page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('light');
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('dark'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('stadiaref:theme'))).toBe('dark');
  expect(await page.evaluate((id) => document.getElementById(id).classList.contains('stadiaref-theme-dark'), HOST_ID)).toBe(true);
  // invalid ignored
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('purple'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('dark');
  // auto follows html.dark
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('auto'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('light');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect.poll(() => page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('dark');
  // persisted theme is read on next load
  await page.evaluate(() => window.seguruDebugToolbar.setTheme('dark'));
  await open(page, harness());
  expect(await page.evaluate(() => window.seguruDebugToolbar.getTheme())).toBe('dark');
});

test('setUser / getUser keep only documented fields', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getUser())).toBe(null);
  await page.evaluate(() => window.seguruDebugToolbar.setUser({ name: 'Ada Lovelace', role: 'reviewer', id: 'u1', email: 'ada@example.com', token: 'secret' }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getUser())).toEqual({ name: 'Ada Lovelace', role: 'reviewer', id: 'u1', email: 'ada@example.com' });
  await expect(shadow(page, '[data-stadiaref-user-name]')).toHaveText('Ada Lovelace');
  await expect(shadow(page, '[data-stadiaref-user-avatar]')).toHaveText('A');
  // returned object is a copy
  await page.evaluate(() => { window.seguruDebugToolbar.getUser().name = 'X'; });
  expect((await page.evaluate(() => window.seguruDebugToolbar.getUser())).name).toBe('Ada Lovelace');
  // non-object ignored
  await page.evaluate(() => window.seguruDebugToolbar.setUser('nope'));
  expect((await page.evaluate(() => window.seguruDebugToolbar.getUser())).name).toBe('Ada Lovelace');
  await page.evaluate(() => window.seguruDebugToolbar.setUser(null));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getUser())).toBe(null);
  await expect(shadow(page, '[data-stadiaref-user-name]')).toHaveText('');
});

test('setDock / getDock move the toolbar', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDock())).toBe('bottom-right');
  for (const d of ['bottom-left', 'top-right', 'top-left', 'bottom-right']) {
    await page.evaluate((v) => window.seguruDebugToolbar.setDock(v), d);
    expect(await page.evaluate(() => window.seguruDebugToolbar.getDock())).toBe(d);
    const box = await shadow(page, '.stadiaref-toolbar').boundingBox();
    const vp = page.viewportSize();
    if (d.startsWith('top')) expect(box.y).toBeLessThan(vp.height / 2); else expect(box.y).toBeGreaterThan(vp.height / 2);
    if (d.endsWith('left')) expect(box.x).toBeLessThan(vp.width / 2); else expect(box.x).toBeGreaterThan(vp.width / 2);
  }
  await page.evaluate(() => window.seguruDebugToolbar.setDock('middle'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDock())).toBe('bottom-right');
  await page.evaluate(() => window.seguruDebugToolbar.setDock('auto'));
  expect(await page.evaluate(() => window.seguruDebugToolbar.getDock())).toBe('bottom-right');
});

test('init() accepts hotkey, theme, dock, user and returns the API', async ({ page }) => {
  await open(page, harness());
  const same = await page.evaluate(() => window.seguruDebugToolbar.init({ hotkey: 'q', theme: 'dark', dock: 'top-left', user: { name: 'Bo' } }) === window.seguruDebugToolbar);
  expect(same).toBe(true);
  expect(await page.evaluate(() => {
    const a = window.seguruDebugToolbar;
    return [a.getHotkey(), a.getTheme(), a.getDock(), a.getUser().name];
  })).toEqual(['Q', 'dark', 'top-left', 'Bo']);
  // 2.5.0 init() ignored every other key. 3.0 init() takes every config key,
  // 2.x names included, so this now shows the toolbar in Icons mode.
  await page.evaluate(() => window.seguruDebugToolbar.init({ startHidden: false, defaultMode: 0 }));
  expect(await page.evaluate(() => [window.seguruDebugToolbar.isVisible(), window.seguruDebugToolbar.getState()])).toEqual([true, 0]);
  expect(await page.evaluate(() => window.seguruDebugToolbar.init(null) === window.seguruDebugToolbar)).toBe(true);
});

test('classifyDataRef is exposed', async ({ page }) => {
  await open(page, harness());
  expect(await page.evaluate(() => window.seguruDebugToolbar.classifyDataRef('home-hero'))).toBe('section');
});

test('refresh() picks up nodes added after boot', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(2);
  await page.evaluate(() => {
    const s = document.createElement('section');
    s.setAttribute('data-ref', 'home-late');
    s.textContent = 'late';
    document.querySelector('main').appendChild(s);
  });
  // 2.5.0 has no childList observer: nothing happens until refresh()
  await page.waitForTimeout(100);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(2);
  await page.evaluate(() => window.seguruDebugToolbar.refresh());
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(3);
  // refresh is idempotent: no double injection
  await page.evaluate(() => window.seguruDebugToolbar.refresh());
  expect(await page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label').length)).toBe(3);
});
