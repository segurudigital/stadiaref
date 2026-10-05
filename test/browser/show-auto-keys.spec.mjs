// Show (tiers), auto-address and the keymap.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, OLD, shadow, settle, press } from './helpers.mjs';

const { harness, open, recordEvents, events } = makeHelpers(NEW);

// Tier of every rendered full label.
async function shownTiers(page) {
  await settle(page);
  return page.evaluate(() => Array.from(document.querySelectorAll('.stadiaref-ref-full-label')).filter((l) => {
    const cs = getComputedStyle(l);
    return cs.display !== 'none' && l.getClientRects().length > 0;
  }).map((l) => (l.className.match(/stadiaref-tier-(\w+)/) || [])[1]));
}

// Tiers present on the page, whatever Show says.
const presentTiers = (page) => page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('.stadiaref-ref-full-label')).map((l) => (l.className.match(/stadiaref-tier-(\w+)/) || [])[1]))));

const COMBOS = [
  ['section', 'block', 'element'], ['section', 'block'], ['section', 'element'], ['block', 'element'],
  ['section'], ['block'], ['element'], [],
];

for (const [name, opts] of [
  ['authored addresses', { body: 'nesting', page: { startHidden: false } }],
  ['automatic addresses only', { body: 'auto-only', page: { startHidden: false, autoAddress: true } }],
]) {
  test(`every Show combination shows what it says: ${name}`, async ({ page }) => {
    await open(page, harness(opts));
    const present = await presentTiers(page);
    expect(present).toEqual(expect.arrayContaining(['section', 'block', 'element']));
    for (const combo of COMBOS) {
      await page.evaluate((c) => window.stadiaref.setTiers(c), combo);
      expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(combo);
      const shown = await shownTiers(page);
      // Unclassified labels belong to no tier: they show only with all three.
      for (const t of shown) expect(t === 'unclassified' ? combo.length === 3 : combo.includes(t), `${combo.join('+') || 'none'} showed a ${t}`).toBe(true);
      for (const t of combo) {
        if (present.includes(t)) expect(shown, `${combo.join('+') || 'none'} shows no ${t}`).toContain(t);
      }
      if (combo.length) expect(shown.length).toBeGreaterThan(0);
      else expect(shown).toEqual([]);
    }
  });
}

test('unclassified labels show only while every tier is shown', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  expect(await shownTiers(page)).toContain('unclassified');
  await page.evaluate(() => window.stadiaref.setTiers(['section', 'block']));
  expect(await shownTiers(page)).not.toContain('unclassified');
});

test('setTiers rejects anything but an array of tier names', async ({ page }) => {
  await open(page, harness({ body: 'nesting' }));
  for (const bad of ['section', ['section', 'banner'], null]) {
    await page.evaluate((v) => window.stadiaref.setTiers(v), bad);
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['section', 'block', 'element']);
  }
});

test('tiers from config; tiers-change and its 2.x twin', async ({ page }) => {
  const O = makeHelpers(OLD);
  await O.recordEvents(page);
  await recordEvents(page);
  await open(page, harness({ body: 'nesting', page: { tiers: ['block'] } }));
  expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['block']);
  await page.evaluate(() => { window.stadiaref.setTiers(['section']); window.stadiaref.setTiers(['element', 'section']); });
  expect((await events(page, 'tiers-change')).map((e) => e.detail)).toEqual([{ tiers: ['section'] }, { tiers: ['section', 'element'] }]);
  expect((await O.events(page, 'level-filter-change')).map((e) => e.detail)).toEqual([{ levelFilter: 'section' }, { levelFilter: 'all' }]);
});

test('the Show menu: tick boxes, a menu that stays open, the button value', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  const button = shadow(page, '[data-stadiaref-toggle="show"]');
  await expect(button.locator('.stadiaref-toolbar__value')).toHaveText('All');
  await expect(button).not.toHaveClass(/stadiaref-toolbar__select--active/);
  await button.click();
  const menu = shadow(page, '[data-stadiaref-menu="show"]');
  await expect(menu).toHaveClass(/stadiaref-toolbar__dropdown--open/);
  await expect(menu.locator('.stadiaref-toolbar__hint')).toHaveText('Tick any mix. Keys 1, 2 and 3');
  const rows = menu.locator('[role="menuitemcheckbox"]');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toHaveAttribute('aria-checked', 'true');
  await rows.nth(1).click();
  await expect(menu).toHaveClass(/stadiaref-toolbar__dropdown--open/);
  await expect(rows.nth(1)).toHaveAttribute('aria-checked', 'false');
  await expect(button.locator('.stadiaref-toolbar__value')).toHaveText('Sec + El');
  await expect(button).toHaveClass(/stadiaref-toolbar__select--active/);
  await rows.nth(0).click();
  await rows.nth(2).click();
  await expect(button.locator('.stadiaref-toolbar__value')).toHaveText('None');
  expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual([]);
  // No Target or Level controls, and no S/B/E letter chips.
  expect(await shadow(page, '[data-stadiaref-toggle="depth"], [data-stadiaref-toggle="level"]').count()).toBe(0);
});

test('Show button names every combination as the wireframe does', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  const names = {};
  for (const combo of COMBOS) {
    await page.evaluate((c) => window.stadiaref.setTiers(c), combo);
    names[combo.join('+') || 'none'] = await shadow(page, '[data-stadiaref-toggle="show"] .stadiaref-toolbar__value').textContent();
  }
  expect(names).toEqual({
    'section+block+element': 'All', 'section+block': 'Sec + Blk', 'section+element': 'Sec + El', 'block+element': 'Blk + El',
    section: 'Sections', block: 'Blocks', element: 'Elements', none: 'None',
  });
});

test.describe('auto-address', () => {
  test('one switch; the AUTO chip shows only while it is on; events', async ({ page }) => {
    const O = makeHelpers(OLD);
    await O.recordEvents(page);
    await recordEvents(page);
    await open(page, harness({ body: 'auto-only', page: { startHidden: false } }));
    const chip = shadow(page, '[data-stadiaref-auto-chip]');
    await expect(chip).toBeHidden();
    expect(await page.evaluate(() => window.stadiaref.getAutoAddress())).toBe(false);
    await page.evaluate(() => window.stadiaref.setAutoAddress(true));
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText('AUTO');
    await expect(chip).toHaveAttribute('role', 'status');
    await expect(chip).toHaveAttribute('aria-label', 'Auto-address is on');
    const tiers = await page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-stadiaref-auto-tier')))).sort());
    expect(tiers).toEqual(['block', 'element', 'section']);
    await page.evaluate(() => window.stadiaref.setAutoAddress('yes'));
    expect(await page.evaluate(() => window.stadiaref.getAutoAddress())).toBe(true);
    await page.evaluate(() => window.stadiaref.setAutoAddress(false));
    await expect(chip).toBeHidden();
    expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto]').length)).toBe(0);
    expect((await events(page, 'auto-address-change')).map((e) => e.detail)).toEqual([{ autoAddress: true }, { autoAddress: false }]);
    expect((await O.events(page, 'depth-change')).map((e) => e.detail)).toEqual([{ depth: 'all' }, { depth: 'off' }]);
  });

  test('automatic addresses are valid, unique and unchanged across ten forced surveys', async ({ page }) => {
    for (const url of [harness({ body: 'auto-only', page: { autoAddress: true } }), '/test/demo.html?ar=1&cc=1']) {
      await open(page, url);
      const read = () => page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
      const first = await read();
      expect(first.length).toBeGreaterThan(5);
      expect(new Set(first).size).toBe(first.length);
      const all = await page.evaluate(() => Array.from(document.querySelectorAll('[data-ref]')).map((e) => e.getAttribute('data-ref')));
      expect(new Set(all).size, 'no automatic address repeats an authored one').toBe(all.length);
      const problems = await page.evaluate((list) => list.map((a) => [a, window.stadiaref.validate(a)]).filter(([, v]) => !v.valid), first);
      expect(problems).toEqual([]);
      for (let i = 0; i < 10; i++) await page.evaluate(() => window.stadiaref.refresh());
      expect(await read()).toEqual(first);
      // Switching off and on keeps them too.
      await page.evaluate(() => { window.stadiaref.setAutoAddress(false); window.stadiaref.setAutoAddress(true); });
      expect(await read()).toEqual(first);
    }
  });

  test('a new element gets a new number, never a reused one', async ({ page }) => {
    await open(page, harness({ body: 'auto-only', page: { autoAddress: true, pageSlug: 'demo' } }));
    const before = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    const max = Math.max(...before.map((a) => Number(a.split('-')[1])));
    await page.evaluate(() => {
      document.querySelector('h1').remove();
      const p = document.createElement('p');
      p.textContent = 'new';
      document.querySelector('section').appendChild(p);
      window.stadiaref.refresh();
    });
    const after = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    const added = after.filter((a) => !before.includes(a));
    expect(added).toHaveLength(1);
    expect(Number(added[0].split('-')[1])).toBe(max + 1);
  });

  test('a slug or context that breaks the rules is sanitised', async ({ page }) => {
    await open(page, harness({ body: 'auto-only', page: { autoAddress: true, pageSlug: 'About_Us/Team.v2' } }));
    const addrs = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    for (const a of addrs) expect(a).toMatch(/^about-us-team-v2-\d{2,}-[a-z0-9-]+$/);
  });

  test('2.x single-tier Target leaves Show alone; setAutoAddress() clears it', async ({ page }) => {
    await open(page, harness({ body: 'auto-only', page: { startHidden: false } }));
    await page.evaluate(() => window.stadiaref.setDepth('section'));
    expect(await page.evaluate(() => [window.stadiaref.getDepth(), window.stadiaref.getAutoAddress(), window.stadiaref.getTiers().length])).toEqual(['section', true, 3]);
    expect(await page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-stadiaref-auto-tier')))))).toEqual(['section']);
    await page.evaluate(() => window.stadiaref.setAutoAddress(true));
    expect(await page.evaluate(() => window.stadiaref.getDepth())).toBe('all');
  });
});

test.describe('keys', () => {
  const vis = (page) => page.evaluate(() => window.stadiaref.isVisible());

  test('1, 2 and 3 switch tiers, and are cancelled for the page', async ({ page }) => {
    await open(page, harness({ body: 'nesting' }));
    for (const k of ['1', '2', '3']) await press(page, k);
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual([]);
    await press(page, '2');
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['block']);
    const prevented = await page.evaluate(() => {
      const e = new KeyboardEvent('keydown', { key: '1', bubbles: true, cancelable: true });
      document.body.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(true);
  });

  test('a digit typed with Shift held still works (layouts where digits need Shift)', async ({ page }) => {
    await open(page, harness({ body: 'nesting' }));
    await page.evaluate(() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '1', shiftKey: true, bubbles: true, cancelable: true })));
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['block', 'element']);
  });

  test('rebind, disable, and the defaults', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { keys: { toggle: 'v', section: false, labels: 'K' } } }));
    expect(await page.evaluate(() => window.stadiaref.getKeys())).toEqual({ toggle: 'v', labels: 'K', section: false, block: '2', element: '3', pick: 'P', find: '/', outline: 'O', hide: 'Escape' });
    await press(page, 'd');
    expect(await vis(page)).toBe(false);
    await press(page, 'v');
    expect(await vis(page)).toBe(true);
    await press(page, '1');
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['section', 'block', 'element']);
    await press(page, 'k');
    expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('off');
    await page.evaluate(() => window.stadiaref.setKeys({ hide: false, section: 'q', bogus: 'x', block: 7 }));
    expect(await page.evaluate(() => window.stadiaref.getKeys())).toMatchObject({ hide: false, section: 'q', block: '2' });
    await press(page, 'Escape');
    expect(await vis(page)).toBe(true);
    await press(page, 'q');
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['block', 'element']);
  });

  test('2.x hotkey and setHotkey() set the toggle key', async ({ page }) => {
    await open(page, harness({ body: 'nesting', legacyPage: { hotkey: 'j' } }));
    expect(await page.evaluate(() => [window.stadiaref.getKeys().toggle, window.stadiaref.getHotkey()])).toEqual(['J', 'J']);
    await page.evaluate(() => window.stadiaref.setHotkey('m'));
    expect(await page.evaluate(() => window.stadiaref.getKeys().toggle)).toBe('M');
  });

  test('typing in a field inside a shadow root does not fire keys', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
    await page.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'widget';
      document.body.appendChild(host);
      host.attachShadow({ mode: 'open' }).innerHTML = '<input id="q">';
    });
    await page.locator('#widget input').fill('');
    await page.locator('#widget input').pressSequentially('d1l');
    expect(await page.evaluate(() => [window.stadiaref.isVisible(), window.stadiaref.getTiers().length, window.stadiaref.getLabels()])).toEqual([true, 3, 'full']);
  });

  test('Esc is left to an open modal dialog of the host page', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
    await page.evaluate(() => {
      const d = document.createElement('dialog');
      d.innerHTML = '<p>Host dialog</p><button>OK</button>';
      document.body.appendChild(d);
      d.showModal();
    });
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => [document.querySelector('dialog').open, window.stadiaref.isVisible()])).toEqual([false, true]);
    await page.keyboard.press('Escape');
    expect(await vis(page)).toBe(false);
  });
});
