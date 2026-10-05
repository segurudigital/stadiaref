// Profiles in the overlay: the default, switching, unregistered names,
// third-party profiles, re-classification on survey, invalid and duplicate
// addresses.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, labelTiers as tiers } from './helpers.mjs';

const { harness, open: openHidden, recordEvents, eventsSoon } = makeHelpers(NEW);

// These tests read the labels, so StadiaRef is shown first.
async function open(page, url) {
  await openHidden(page, url);
  await page.evaluate(() => window.stadiaref.show());
}

function warnings(page, needle) {
  const list = [];
  page.on('console', (m) => { if (m.type() === 'warning' && m.text().includes(needle)) list.push(m.text()); });
  return list;
}

test('the default profile is generic: tiers from nesting', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  expect(await page.evaluate(() => window.stadiaref.getProfile())).toBe('generic');
  expect(await tiers(page)).toEqual({
    'home-plans': 'section',
    'home-plans-card-01': 'block',
    'home-plans-card-01-title': 'element',
    'home-plans-card-01-cta': 'element',
    'home-plans-card-02': 'element', // nothing addressed inside it
    'Bad_Address': 'unclassified',
    'home-dup': 'section',
  });
});

test('classify() and validate() on the API use the active profile', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  expect(await page.evaluate(() => ['home-plans', 'home-plans-card-01', 'home-plans-card-01-cta', 'not-on-this-page', 'Bad_Address'].map(window.stadiaref.classify)))
    .toEqual(['section', 'block', 'element', 'unclassified', 'unclassified']);
  expect(await page.evaluate(() => window.stadiaref.validate('Bad_Address'))).toEqual({ valid: false, problems: ['uppercase letters', 'underscore'] });
  expect(await page.evaluate(() => window.stadiaref.validate('home-plans'))).toEqual({ valid: true, problems: [] });
  await page.evaluate(() => window.stadiaref.setProfile('titan'));
  // Titan reads the address itself, so an address that isn't on the page classifies.
  expect(await page.evaluate(() => ['home-hero-card-01', 'not-on-this-page-01'].map(window.stadiaref.classify))).toEqual(['block', 'unclassified']);
  expect(await page.evaluate(() => window.stadiaref.validate('home-01').problems)).toEqual(["doesn't match the Titan grammar"]);
});

test('profile from config, the data-profile attribute, setProfile() and init()', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { profile: 'titan' } }));
  expect(await page.evaluate(() => window.stadiaref.getProfile())).toBe('titan');
  let t = await tiers(page);
  expect([t['home-plans-card-01'], t['home-plans-card-01-title']]).toEqual(['block', 'section']);

  await open(page, harness({ body: 'nesting', attrs: { 'data-profile': 'app' } }));
  expect(await page.evaluate(() => window.stadiaref.getProfile())).toBe('app');
  t = await tiers(page);
  expect(Object.values(t).every((x) => x === 'unclassified')).toBe(true);

  await page.evaluate(() => window.stadiaref.setProfile('generic'));
  t = await tiers(page);
  expect(t['home-plans-card-01']).toBe('block');

  await page.evaluate(() => window.stadiaref.init({ profile: 'titan' }));
  t = await tiers(page);
  expect(t['home-plans-card-01-title']).toBe('section');
});

test('an unregistered profile warns once, uses generic, and takes over when registered', async ({ page }) => {
  const warned = warnings(page, 'no profile named');
  await open(page, harness({ body: 'nesting', page: { profile: 'flat' } }));
  expect(await page.evaluate(() => window.stadiaref.getProfile())).toBe('flat');
  expect((await tiers(page))['home-plans-card-01']).toBe('block');
  await page.evaluate(() => window.stadiaref.setProfile('flat'));
  expect(warned).toHaveLength(1);
  // Register a made-up profile that calls everything an element.
  await page.evaluate(() => window.stadiaref.registerProfile({ name: 'flat', classify: () => 'element' }));
  const t = await tiers(page);
  expect(t['home-plans']).toBe('element');
  expect(t['home-plans-card-01']).toBe('element');
  expect(t['Bad_Address']).toBe('unclassified'); // core rules still apply
});

test('registerProfile() throws for a taken name; profiles registered on the page are shared with classify()', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  expect(await page.evaluate(() => { try { window.stadiaref.registerProfile({ name: 'titan', classify: () => 'section' }); return 'no error'; } catch (e) { return e.message; } }))
    .toContain('already registered');
  await page.evaluate(() => window.stadiaref.registerProfile({
    name: 'kite-page',
    classify: (a) => ({ 1: 'section', 2: 'block', 3: 'element' })[(a.match(/-\d+/g) || []).length] || null,
  }));
  await page.evaluate(() => window.stadiaref.setProfile('kite-page'));
  expect(await page.evaluate(() => ['kite-3', 'kite-3-7', 'kite-3-7-2'].map(window.stadiaref.classify))).toEqual(['section', 'block', 'element']);
});

test('automatic addresses never change an authored tier', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  const before = await tiers(page);
  await page.evaluate(() => window.stadiaref.setDepth('all'));
  expect(await page.evaluate(() => document.querySelector('#pro-title').hasAttribute('data-stadiaref-auto'))).toBe(true);
  const after = await tiers(page);
  for (const k of Object.keys(before)) expect(after[k], k).toBe(before[k]);
});

test('tiers are recomputed on every survey', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  expect((await tiers(page))['home-plans-card-02']).toBe('element');
  await page.evaluate(() => { document.querySelector('#pro-title').setAttribute('data-ref', 'home-plans-card-02-title'); window.stadiaref.refresh(); });
  const t = await tiers(page);
  expect([t['home-plans-card-02'], t['home-plans-card-02-title']]).toEqual(['block', 'element']);
});

test('a duplicated address gets one warning per survey and its normal style', async ({ page }) => {
  const warned = warnings(page, 'duplicate address');
  await open(page, harness({ body: 'nesting' }));
  await expect.poll(() => warned.length).toBe(1);
  expect(warned[0]).toContain('home-dup');
  await page.evaluate(() => window.stadiaref.refresh());
  await expect.poll(() => warned.length).toBe(2);
  expect((await tiers(page))['home-dup']).toBe('section');
});

test('an invalid address is unclassified in its label and its events', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await recordEvents(page);
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  await page.locator('[data-ref="Bad_Address"] > .stadiaref-ref-full-label').click();
  const [click] = await eventsSoon(page, 'address-click');
  expect(click.detail).toMatchObject({ address: 'Bad_Address', tier: 'unclassified' });
});
