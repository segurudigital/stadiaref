// Baseline on the 3.0 names: the API object, member by member.
// Target, Level, the hotkey and classifyDataRef have no 3.0 name until later
// stages; the 2.x copy in baseline-2x/ and aliases.spec.mjs cover them.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { harness, open, recordEvents, events, countVisible, shadow, HOST_ID } from './helpers.mjs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));

const MEMBERS = [
  'version', 'ready', 'init', 'show', 'hide', 'toggle', 'isVisible', 'refresh',
  'setLabels', 'getLabels', 'setOutline', 'getOutline', 'toggleTree',
  'setTheme', 'getTheme', 'setDock', 'getDock', 'setUser', 'getUser',
  'setProfile', 'getProfile', 'registerProfile', 'classify', 'validate',
];

test.beforeEach(async ({ page }) => { await recordEvents(page); });

test('API object has the 3.0 members built so far', async ({ page }) => {
  await open(page, harness());
  const shape = await page.evaluate(() => {
    const a = window.stadiaref;
    const o = {};
    Object.keys(a).forEach((k) => { o[k] = typeof a[k]; });
    o.readyIsPromise = a.ready instanceof Promise;
    return o;
  });
  for (const m of MEMBERS) expect(shape, m).toHaveProperty(m);
  expect(shape.version).toBe('string');
  expect(shape.readyIsPromise).toBe(true);
  for (const m of MEMBERS.filter((x) => x !== 'version' && x !== 'ready')) expect(shape[m], m).toBe('function');
});

test('version matches package.json; ready resolves with the API', async ({ page }) => {
  await open(page, harness());
  expect(await page.evaluate(() => window.stadiaref.version)).toBe(pkg.version);
  expect(await page.evaluate(async () => (await window.stadiaref.ready) === window.stadiaref)).toBe(true);
});

test('starts hidden; show/hide/toggle/isVisible', async ({ page }) => {
  await open(page, harness());
  const host = page.locator('#' + HOST_ID);
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  await expect(host).toBeHidden();
  expect(await page.evaluate(() => document.body.classList.contains('stadiaref-presentation'))).toBe(true);

  await page.evaluate(() => window.stadiaref.show());
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
  expect(await page.evaluate(() => document.body.classList.contains('stadiaref-presentation'))).toBe(false);
  await expect(shadow(page, '.stadiaref-toolbar')).toBeVisible();

  // idempotent
  await page.evaluate(() => window.stadiaref.show());
  expect((await events(page, 'show')).length).toBe(1);

  await page.evaluate(() => window.stadiaref.toggle());
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  await page.evaluate(() => window.stadiaref.toggle());
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
  await page.evaluate(() => window.stadiaref.hide());
  await page.evaluate(() => window.stadiaref.hide());
  expect((await events(page, 'hide')).length).toBe(2);
});

test('setLabels / getLabels drive label mode', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('full');
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(2);

  await page.evaluate(() => window.stadiaref.setLabels('icons'));
  expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('icons');
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
  expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(2);

  await page.evaluate(() => window.stadiaref.setLabels('off'));
  expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('off');
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
  expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(0);
  await expect(shadow(page, '[data-stadiaref-toggle="mode"] .stadiaref-toolbar__value')).toHaveText('Off');

  // invalid values are ignored with a warning
  const warnings = [];
  page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
  await page.evaluate(() => window.stadiaref.setLabels(2));
  expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('off');
  expect(warnings.some((w) => w.includes('setLabels'))).toBe(true);
});

test('setOutline / getOutline', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.stadiaref.getOutline())).toBe('off');
  await page.evaluate(() => window.stadiaref.setOutline('section'));
  expect(await page.evaluate(() => window.stadiaref.getOutline())).toBe('section');
  await page.evaluate(() => window.stadiaref.setOutline('block'));
  expect(await page.evaluate(() => window.stadiaref.getOutline())).toBe('block');
  await page.evaluate(() => window.stadiaref.setOutline('nonsense'));
  expect(await page.evaluate(() => window.stadiaref.getOutline())).toBe('off');
});

test('toggleTree opens and closes the Tree panel', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const panel = shadow(page, '.stadiaref-tree-panel');
  await expect(panel).not.toHaveClass(/stadiaref-tree-panel--open/);
  await page.evaluate(() => window.stadiaref.toggleTree());
  await expect(panel).toHaveClass(/stadiaref-tree-panel--open/);
  await expect(panel).toContainText('home-hero');
  await page.evaluate(() => window.stadiaref.toggleTree());
  await expect(panel).not.toHaveClass(/stadiaref-tree-panel--open/);
});

test('setTheme / getTheme, persisted to localStorage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, harness());
  expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('light');
  await page.evaluate(() => window.stadiaref.setTheme('dark'));
  expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('stadiaref:theme'))).toBe('dark');
  expect(await page.evaluate((id) => document.getElementById(id).classList.contains('stadiaref-theme-dark'), HOST_ID)).toBe(true);
  // invalid ignored
  await page.evaluate(() => window.stadiaref.setTheme('purple'));
  expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
  // auto follows html.dark
  await page.evaluate(() => window.stadiaref.setTheme('auto'));
  expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('light');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect.poll(() => page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
  // persisted theme is read on next load
  await page.evaluate(() => window.stadiaref.setTheme('dark'));
  await open(page, harness());
  expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
});

test('setUser / getUser keep only documented fields', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.stadiaref.getUser())).toBe(null);
  await page.evaluate(() => window.stadiaref.setUser({ name: 'Ada Lovelace', role: 'reviewer', id: 'u1', email: 'ada@example.com', token: 'secret' }));
  expect(await page.evaluate(() => window.stadiaref.getUser())).toEqual({ name: 'Ada Lovelace', role: 'reviewer', id: 'u1', email: 'ada@example.com' });
  await expect(shadow(page, '[data-stadiaref-user-name]')).toHaveText('Ada Lovelace');
  await expect(shadow(page, '[data-stadiaref-user-avatar]')).toHaveText('A');
  // returned object is a copy
  await page.evaluate(() => { window.stadiaref.getUser().name = 'X'; });
  expect((await page.evaluate(() => window.stadiaref.getUser())).name).toBe('Ada Lovelace');
  // non-object ignored
  await page.evaluate(() => window.stadiaref.setUser('nope'));
  expect((await page.evaluate(() => window.stadiaref.getUser())).name).toBe('Ada Lovelace');
  await page.evaluate(() => window.stadiaref.setUser(null));
  expect(await page.evaluate(() => window.stadiaref.getUser())).toBe(null);
  await expect(shadow(page, '[data-stadiaref-user-name]')).toHaveText('');
});

test('setDock / getDock move the toolbar', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('bottom-right');
  for (const d of ['bottom-left', 'top-right', 'top-left', 'bottom-right']) {
    await page.evaluate((v) => window.stadiaref.setDock(v), d);
    expect(await page.evaluate(() => window.stadiaref.getDock())).toBe(d);
    const box = await shadow(page, '.stadiaref-toolbar').boundingBox();
    const vp = page.viewportSize();
    if (d.startsWith('top')) expect(box.y).toBeLessThan(vp.height / 2); else expect(box.y).toBeGreaterThan(vp.height / 2);
    if (d.endsWith('left')) expect(box.x).toBeLessThan(vp.width / 2); else expect(box.x).toBeGreaterThan(vp.width / 2);
  }
  await page.evaluate(() => window.stadiaref.setDock('middle'));
  expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('bottom-right');
  await page.evaluate(() => window.stadiaref.setDock('auto'));
  expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('bottom-right');
});

test('init() applies config keys after start and returns the API', async ({ page }) => {
  await open(page, harness());
  const same = await page.evaluate(() => window.stadiaref.init({ theme: 'dark', dock: 'top-left', user: { name: 'Bo' }, labels: 'icons', outline: 'section' }) === window.stadiaref);
  expect(same).toBe(true);
  expect(await page.evaluate(() => {
    const a = window.stadiaref;
    return [a.getTheme(), a.getDock(), a.getUser().name, a.getLabels(), a.getOutline(), a.isVisible()];
  })).toEqual(['dark', 'top-left', 'Bo', 'icons', 'section', false]);
  // startHidden: true after start does nothing; false shows the toolbar
  await page.evaluate(() => window.stadiaref.init({ startHidden: true }));
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  await page.evaluate(() => window.stadiaref.init({ startHidden: false }));
  expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
  expect(await page.evaluate(() => window.stadiaref.init(null) === window.stadiaref)).toBe(true);
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
  // No childList observer yet (stage 7): nothing happens until refresh()
  await page.waitForTimeout(100);
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(2);
  await page.evaluate(() => window.stadiaref.refresh());
  expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(3);
  // refresh is idempotent: no double injection
  await page.evaluate(() => window.stadiaref.refresh());
  expect(await page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label').length)).toBe(3);
});
