// The 3.0 toolbar and labels against the wireframe values (Toolbar.dc.html,
// Pills.dc.html, Toolbar-Phone.dc.html, Brand-Zone.dc.html), keyboard use,
// accessible names and states, and the permanent brand. Screenshots are
// attached to the test report for review.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow, settle } from './helpers.mjs';
import { TOOLBAR, LABELS } from '../../src/overlay/styles/tokens.js';

const { harness, open } = makeHelpers(NEW);

const rgb = (c) => {
  if (c.startsWith('#')) {
    const n = parseInt(c.slice(1), 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  }
  const p = c.match(/[\d.]+/g).map(Number);
  return p.length > 3 && p[3] !== 1 ? `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})` : `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
};

function style(locator, props) {
  return locator.evaluate((el, ps) => { const cs = getComputedStyle(el); return Object.fromEntries(ps.map((p) => [p, cs.getPropertyValue(p)])); }, props);
}

for (const theme of ['light', 'dark']) {
  for (const [label, viewport] of [['desktop', { width: 1280, height: 800 }], ['390px', { width: 390, height: 760 }]]) {
    test(`toolbar, ${theme}, ${label}: wireframe values`, async ({ page }, info) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ colorScheme: theme });
      await open(page, harness({ body: 'nesting', page: { startHidden: false, autoAddress: true, tiers: ['section', 'block'], user: { name: 'Ada', role: 'QA' } } }));
      await settle(page);
      const t = TOOLBAR[theme];
      const bar = shadow(page, '.stadiaref-toolbar');
      expect(await style(bar, ['background-color', 'border-top-color', 'border-top-left-radius', 'padding-top', 'font-size', 'box-shadow'])).toEqual({
        'background-color': rgb(t.barBg), 'border-top-color': rgb(t.barBd), 'border-top-left-radius': '6px', 'padding-top': '4px', 'font-size': '12px',
        'box-shadow': 'rgba(0, 0, 0, 0.08) 0px 4px 12px 0px, rgba(0, 0, 0, 0.06) 0px 1px 3px 0px',
      });
      // Brand: 20px icon, logotype 7px from it, dropped under 480px.
      expect((await shadow(page, '.stadiaref-brand__icon').boundingBox()).width).toBe(20);
      expect(await style(shadow(page, '.stadiaref-brand'), ['column-gap'])).toEqual({ 'column-gap': '7px' });
      const logo = shadow(page, '.stadiaref-brand__logotype');
      if (label === 'desktop') {
        const box = await logo.boundingBox();
        expect([Math.round(box.width), Math.round(box.height)]).toEqual([65, 11]);
        expect(await logo.locator('.stadiaref-brand__ref').evaluate((p) => getComputedStyle(p).fill)).toBe(rgb(t.refFg));
      } else {
        await expect(logo).toBeHidden();
        await expect(shadow(page, '.stadiaref-brand__icon')).toBeVisible();
      }
      // Show narrowed: the active wash. Value text: All → Sec + Blk.
      const showBtn = shadow(page, '[data-stadiaref-toggle="show"]');
      await expect(showBtn.locator('.stadiaref-toolbar__value')).toHaveText('Sec + Blk');
      expect(await style(showBtn, ['background-color', 'color'])).toEqual({ 'background-color': rgb(t.wash), color: rgb(t.accent) });
      expect(await style(showBtn.locator('.stadiaref-toolbar__key--long').first(), ['font-size', 'text-transform'])).toEqual(label === 'desktop' ? { 'font-size': '10px', 'text-transform': 'uppercase' } : { 'font-size': '10px', 'text-transform': 'uppercase' });
      // AUTO chip: dashed 1px, mono 10px bold.
      const chip = shadow(page, '[data-stadiaref-auto-chip]');
      expect(await style(chip, ['border-top-style', 'border-top-width', 'font-size', 'font-weight'])).toEqual({ 'border-top-style': 'dashed', 'border-top-width': '1px', 'font-size': '10px', 'font-weight': '700' });
      // Order: brand, user, Labels, Show, AUTO, Pick, Find, | Outline, Tree.
      const order = await bar.evaluate((b) => Array.from(b.querySelectorAll('.stadiaref-brand, [data-stadiaref-user-pill], [data-stadiaref-toggle], [data-stadiaref-auto-chip], [data-stadiaref-pick], [data-stadiaref-find], [data-stadiaref-toggle-tree]'))
        .map((n) => n.getAttribute('data-stadiaref-toggle') || (n.classList.contains('stadiaref-brand') ? 'brand' : n.hasAttribute('data-stadiaref-user-pill') ? 'user' : n.hasAttribute('data-stadiaref-auto-chip') ? 'auto' : n.hasAttribute('data-stadiaref-pick') ? 'pick' : n.hasAttribute('data-stadiaref-find') ? 'find' : 'tree')));
      expect(order).toEqual(['brand', 'user', 'mode', 'show', 'auto', 'pick', 'find', 'outline', 'tree']);
      if (label === '390px') {
        // Compact: inside the viewport, wrapped, 44px controls, short keys.
        const box = await bar.boundingBox();
        expect(box.width).toBeLessThanOrEqual(390 - 40);
        expect(box.height).toBeGreaterThan(60);
        for (const sel of ['[data-stadiaref-toggle="mode"]', '[data-stadiaref-pick]', '[data-stadiaref-toggle-tree]']) {
          expect((await shadow(page, sel).boundingBox()).height).toBeGreaterThanOrEqual(44);
        }
        await expect(shadow(page, '[data-stadiaref-short="mode"]')).toHaveText('L');
        await expect(shadow(page, '[data-stadiaref-toggle="mode"] .stadiaref-toolbar__key--long')).toBeHidden();
      } else {
        expect((await bar.boundingBox()).height).toBeLessThan(48);
      }
      await info.attach(`toolbar-${theme}-${label}.png`, { body: await page.screenshot(), contentType: 'image/png' });
    });
  }
}

for (const mode of ['full', 'icons', 'off']) {
  test(`sample page, labels ${mode}`, async ({ page }, info) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false, labels: mode, autoAddress: true } }));
    await settle(page);
    if (mode === 'full') {
      for (const [tier, surface, sel] of [['section', 'light', '[data-ref="home-plans"]'], ['block', 'light', '[data-ref="home-plans-card-01"]'], ['element', 'light', '[data-ref="home-plans-card-01-cta"]'], ['unclassified', 'light', '[data-ref="Bad_Address"]']]) {
        const l = LABELS[tier][surface];
        const label = page.locator(sel + ' > .stadiaref-ref-full-label');
        expect(await style(label, ['background-color', 'color', 'font-size', 'border-top-left-radius', 'padding-left']), tier).toEqual({
          'background-color': rgb(l.bg), color: rgb(l.fg), 'font-size': '10px', 'border-top-left-radius': '3px', 'padding-left': '5px',
        });
        // One line, however narrow the element.
        expect((await label.boundingBox()).height).toBeLessThan(20);
      }
      expect(await style(page.locator('[data-ref="Bad_Address"] > .stadiaref-ref-full-label'), ['border-top-style'])).toEqual({ 'border-top-style': 'dashed' });
      const auto = page.locator('[data-stadiaref-auto] > .stadiaref-ref-full-label').first();
      await expect(auto.locator('.stadiaref-ref-tag')).toHaveText('AUTO');
      expect(await style(auto, ['border-top-style'])).toEqual({ 'border-top-style': 'dashed' });
    }
    if (mode === 'icons') {
      const dot = page.locator('[data-ref="home-plans"] > .stadiaref-ref-icon');
      await expect(dot).toHaveText('S');
      const box = await dot.boundingBox();
      expect([box.width, box.height]).toEqual([16, 16]);
      await expect(page.locator('[data-ref="home-plans-card-01"] > .stadiaref-ref-icon')).toHaveText('B');
      await expect(page.locator('[data-ref="Bad_Address"] > .stadiaref-ref-icon')).toHaveText('?');
    }
    if (mode === 'off') {
      expect(await page.locator('.stadiaref-ref-full-label, .stadiaref-ref-icon').evaluateAll((ls) => ls.filter((l) => getComputedStyle(l).display !== 'none').length)).toBe(0);
    }
    await info.attach(`labels-${mode}.png`, { body: await page.screenshot(), contentType: 'image/png' });
  });
}

test('dark surface labels use their dark versions', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  const l = LABELS.section.dark;
  expect(await style(page.locator('[data-ref="home-features"] > .stadiaref-ref-full-label'), ['background-color', 'color'])).toEqual({ 'background-color': rgb(l.bg), color: rgb(l.fg) });
});

test('accessible names and states', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  const host = page.locator('#stadiaref-host');
  await expect(host.getByRole('toolbar', { name: 'StadiaRef' })).toBeVisible();
  await expect(host.getByRole('link', { name: 'StadiaRef by Seguru Digital' })).toHaveAttribute('href', 'https://seguru.digital');
  for (const name of [/Labels/, /Show/, /Outline/]) {
    const b = host.getByRole('button', { name });
    await expect(b).toHaveAttribute('aria-haspopup', 'menu');
    await expect(b).toHaveAttribute('aria-expanded', 'false');
  }
  for (const name of ['Pick', 'Find', 'Tree']) await expect(host.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'false');
  await host.getByRole('button', { name: 'Tree', exact: true }).click();
  await expect(host.getByRole('button', { name: 'Tree', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(host.getByRole('dialog', { name: 'Address tree' })).toBeVisible();
  await expect(host.getByRole('button', { name: 'Copy home-plans', exact: true })).toBeVisible();
  await host.getByRole('button', { name: /Labels/ }).click();
  await expect(host.getByRole('button', { name: /Labels/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(host.getByRole('menu', { name: 'Labels' })).toBeVisible();
  await expect(host.getByRole('menuitemradio', { name: /Full/ })).toHaveAttribute('aria-checked', 'true');
  await host.getByRole('menuitemradio', { name: /Icons/ }).click();
  expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('icons');
});

test('the toolbar is usable from the keyboard, with a visible focus ring', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  // Tab from the page into the toolbar (it is the last thing in <body>).
  await page.locator('body').focus();
  const focusedLabel = () => page.evaluate(() => {
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    return a ? (a.getAttribute('aria-label') || a.getAttribute('data-stadiaref-toggle') || a.textContent.trim()) : null;
  });
  const seen = [];
  for (let i = 0; i < 20 && seen.length < 7; i++) {
    await page.keyboard.press('Tab');
    const f = await focusedLabel();
    if (f && !seen.includes(f) && (f.startsWith('StadiaRef') || ['mode', 'show', 'Pick', 'Find', 'outline', 'Tree'].includes(f))) seen.push(f);
  }
  expect(seen).toEqual(['StadiaRef by Seguru Digital', 'mode', 'show', 'Pick', 'Find', 'outline', 'Tree']);
  // Focus ring: 2px solid orange on :focus-visible.
  const ring = await page.evaluate(() => {
    const b = document.getElementById('stadiaref-host').shadowRoot.activeElement;
    const cs = getComputedStyle(b);
    return [cs.outlineStyle, cs.outlineWidth];
  });
  expect(ring).toEqual(['solid', '2px']);
  // Shift+Tab back to Show, open it with Enter: focus goes to the first row.
  for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+Tab');
  expect(await focusedLabel()).toBe('show');
  await page.keyboard.press('Enter');
  await expect(shadow(page, '[data-stadiaref-toggle="show"]')).toHaveAttribute('aria-expanded', 'true');
  expect(await focusedLabel()).toMatch(/^✓?Sections/);
  await page.keyboard.press('ArrowDown');
  expect(await focusedLabel()).toMatch(/^✓?Blocks/);
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['section', 'element']);
  await expect(shadow(page, '[data-stadiaref-menu="show"]')).toHaveClass(/stadiaref-toolbar__dropdown--open/);
});

test('nothing public removes the brand', async ({ page }) => {
  const attempts = { brand: false, hideBrand: true, showBrand: false, logo: false, branding: 'none', whiteLabel: true };
  await open(page, harness({ body: 'nesting', page: { startHidden: false, ...attempts }, attrs: { 'data-brand': 'false', 'data-hide-brand': '' } }));
  await page.evaluate((a) => window.stadiaref.init(a), attempts);
  await expect(shadow(page, '.stadiaref-brand')).toBeVisible();
  await expect(shadow(page, '.stadiaref-brand__icon')).toBeVisible();
  await expect(shadow(page, '.stadiaref-brand__logotype')).toBeVisible();
  expect(Object.keys(await page.evaluate(() => window.stadiaref)).filter((k) => /brand|logo|label?white/i.test(k))).toEqual([]);
});
