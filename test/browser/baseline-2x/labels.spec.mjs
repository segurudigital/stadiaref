// Baseline: labels on test/demo.html in each mode, click-to-copy, the
// clipboard fallback, surface detection, void hosts and hidden ancestors.
import { test, expect } from '@playwright/test';
import { harness, open, countVisible, visibleFullLabelRefs, shadow } from './helpers.mjs';

const DEMO_AUTHORED = ['home-01-hero-standard', 'home-02-features-grid', 'home-07-cta-banner', 'home-08-footer'];

async function demo(page, query = '') {
  await open(page, '/test/demo.html' + query);
  await page.evaluate(() => window.seguruDebugToolbar.show());
}

test.describe('demo page label counts', () => {
  test('defaults: four authored addresses, Full mode', async ({ page }) => {
    await demo(page);
    expect(await page.evaluate(() => document.querySelectorAll('[data-ref]').length)).toBe(4);
    expect(await visibleFullLabelRefs(page)).toEqual([...DEMO_AUTHORED].sort());
    expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(0);
  });

  test('Icons mode shows one dot per address', async ({ page }) => {
    await demo(page);
    await page.evaluate(() => window.seguruDebugToolbar.setState(0));
    expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(4);
    expect(await countVisible(page, '.stadiaref-ref-full-label')).toBe(0);
    // tooltips are laid out but transparent until hover
    expect(await page.evaluate(() => Array.from(document.querySelectorAll('.stadiaref-ref-tooltip')).map((t) => getComputedStyle(t).opacity))).toEqual(['0', '0', '0', '0']);
  });

  test('Off mode shows nothing', async ({ page }) => {
    await demo(page);
    await page.evaluate(() => window.seguruDebugToolbar.setState(1));
    expect(await countVisible(page, '.stadiaref-ref-icon, .stadiaref-ref-full-label, .stadiaref-ref-tooltip')).toBe(0);
  });

  test('hidden toolbar shows no labels in any mode', async ({ page }) => {
    await open(page, '/test/demo.html?hidden');
    for (const s of [0, 1, 2]) {
      await page.evaluate((v) => window.seguruDebugToolbar.setState(v), s);
      expect(await countVisible(page, '.stadiaref-ref-icon, .stadiaref-ref-full-label, .stadiaref-ref-tooltip')).toBe(0);
    }
  });

  test('class converter adds the testimonials address', async ({ page }) => {
    await demo(page, '?cc=1');
    expect(await visibleFullLabelRefs(page)).toEqual([...DEMO_AUTHORED, 'home-03-testimonials'].sort());
  });

  test('auto-ref labels every candidate; authored ones keep their value', async ({ page }) => {
    await demo(page, '?ar=1');
    const autos = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => [e.getAttribute('data-ref'), e.getAttribute('data-stadiaref-auto-tier')]));
    expect(autos.length).toBe(AUTO_COUNT_DEMO);
    // Over http the slug is the path, sanitised: /test/demo.html → "test-demo-html".
    for (const [ref] of autos) expect(ref).toMatch(/^test-demo-html-\d{2}-[a-z0-9]+$/);
    for (const r of DEMO_AUTHORED) expect(await page.locator(`[data-ref="${r}"]`).count()).toBe(1);
    // Every label is shown or folded into a "+N" badge; which ones fold
    // depends on label size (2.5.0 folded two).
    const folded = await page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label.stadiaref-ref-clustered').length);
    expect(await countVisible(page, '.stadiaref-ref-full-label') + folded).toBe(4 + AUTO_COUNT_DEMO);
    if (folded) expect(await countVisible(page, '.stadiaref-cluster-badge')).toBeGreaterThan(0);
  });

  test('auto-ref section depth numbers by position in the section list', async ({ page }) => {
    await open(page, '/test/demo.html?ar=1');
    await page.evaluate(() => window.seguruDebugToolbar.show());
    await page.evaluate(() => window.seguruDebugToolbar.setDepth('section'));
    const autos = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.getAttribute('data-ref')));
    // The two unaddressed sections keep the addresses they were given when the
    // page loaded with auto-address on (2.5.0 renumbered them: -03-, -04-).
    expect(autos).toEqual(['test-demo-html-25-section', 'test-demo-html-28-section']);
  });
});

test.describe('click to copy', () => {
  test('clicking a full label copies its address and shows the toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await demo(page);
    await page.locator('[data-ref="home-02-features-grid"] > .stadiaref-ref-full-label').click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('home-02-features-grid');
    const toast = shadow(page, '.stadiaref-toast');
    await expect(toast).toHaveText('Copied: home-02-features-grid');
    await expect(toast).toHaveClass(/stadiaref-toast--visible/);
    // the toast stays 1800ms
    await page.waitForTimeout(1500);
    await expect(toast).toHaveClass(/stadiaref-toast--visible/);
    await expect(toast).not.toHaveClass(/stadiaref-toast--visible/, { timeout: 1000 });
  });

  test('label clicks do not reach the host page', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await demo(page);
    await page.evaluate(() => {
      window.__hostClicks = 0;
      document.querySelector('[data-ref="home-08-footer"]').addEventListener('click', () => { window.__hostClicks++; });
    });
    await page.locator('[data-ref="home-08-footer"] > .stadiaref-ref-full-label').click();
    expect(await page.evaluate(() => window.__hostClicks)).toBe(0);
  });

  test('without the clipboard API, falls back to execCommand and still toasts', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined, configurable: true });
      window.__execCopy = [];
      const orig = document.execCommand.bind(document);
      document.execCommand = function (cmd) {
        if (cmd === 'copy') window.__execCopy.push(document.activeElement && document.activeElement.value);
        return orig.apply(document, arguments);
      };
    });
    await demo(page);
    await page.locator('[data-ref="home-01-hero-standard"] > .stadiaref-ref-full-label').click();
    expect(await page.evaluate(() => window.__execCopy)).toEqual(['home-01-hero-standard']);
    await expect(shadow(page, '.stadiaref-toast')).toHaveText('Copied: home-01-hero-standard');
  });

  test('a rejected clipboard write falls back to execCommand', async ({ page }) => {
    await page.addInitScript(() => {
      window.__execCopy = 0;
      const orig = document.execCommand.bind(document);
      document.execCommand = function (cmd) { if (cmd === 'copy') window.__execCopy++; return orig.apply(document, arguments); };
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => ({ writeText: () => Promise.reject(new Error('denied')) }), configurable: true });
    });
    await demo(page);
    await page.locator('[data-ref="home-01-hero-standard"] > .stadiaref-ref-full-label').click();
    await expect.poll(() => page.evaluate(() => window.__execCopy)).toBe(1);
  });
});

test.describe('label structure', () => {
  test('each address gets link, icon, tooltip and full label once', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false } }));
    const kinds = await page.evaluate(() => Array.from(document.querySelector('[data-ref="home-hero"]').children)
      .map((c) => c.className.split(' ')[0]).filter((c) => c.startsWith('stadiaref-')));
    expect(kinds).toEqual(['stadiaref-ref-link', 'stadiaref-ref-icon', 'stadiaref-ref-tooltip', 'stadiaref-ref-full-label']);
    // 3.0: a tier tag and the address (2.5.0: "section · home-hero").
    const label = page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label');
    await expect(label.locator('.stadiaref-ref-tag')).toHaveText('SEC');
    await expect(label.locator('.stadiaref-ref-address')).toHaveText('home-hero');
    await expect(page.locator('[data-ref="home-hero"] > .stadiaref-ref-icon')).toHaveText('S');
  });

  test('luminance check marks labels on dark backgrounds', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false } }));
    await expect(page.locator('[data-ref="home-features"] > .stadiaref-ref-full-label')).toHaveClass(/stadiaref-on-dark/);
    await expect(page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label')).toHaveClass(/stadiaref-on-light/);
  });

  test('static hosts get position: relative', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false } }));
    expect(await page.evaluate(() => document.querySelector('[data-ref="home-hero"]').style.position)).toBe('relative');
  });

  test('labels mount in the page DOM; toolbar and toast in the shadow root', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false } }));
    expect(await page.evaluate(() => !!document.getElementById('stadiaref-styles'))).toBe(true);
    expect(await page.evaluate(() => !!document.querySelector('.stadiaref-toolbar'))).toBe(false);
    expect(await shadow(page, '.stadiaref-toolbar').count()).toBe(1);
    expect(await shadow(page, '.stadiaref-toast').count()).toBe(1);
  });

  test('void elements get a sibling label host', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false }, pre: "document.addEventListener('DOMContentLoaded',function(){document.querySelector('main').insertAdjacentHTML('beforeend','<div id=wrap><img data-ref=\"home-photo\" width=200 height=100 alt=\"\" src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\"></div>');});" }));
    const host = page.locator('#wrap > .stadiaref-ref-void-host');
    await expect(host).toHaveCount(1);
    await expect(host).toHaveAttribute('data-stadiaref-host-for', 'home-photo');
    await expect(host.locator('.stadiaref-ref-full-label .stadiaref-ref-address')).toHaveText('home-photo');
    expect(await visibleFullLabelRefs(page)).toContain('home-photo');
  });

  test('labels inside a display:none ancestor are suppressed and come back', async ({ page }) => {
    await open(page, harness({ page: { startHidden: false }, pre: "document.addEventListener('DOMContentLoaded',function(){document.querySelector('main').insertAdjacentHTML('beforeend','<div id=menu style=\"display:none\"><nav data-ref=\"home-menu\">menu</nav></div>');});" }));
    expect(await visibleFullLabelRefs(page)).not.toContain('home-menu');
    await page.evaluate(() => { document.getElementById('menu').style.display = 'block'; });
    await expect.poll(() => visibleFullLabelRefs(page)).toContain('home-menu');
  });
});

// Measured on 2.5.0 (Target All on the demo page): every unaddressed
// candidate in the selector lists, demo controls included, gets an address.
// 3.0 numbers them 01–31 from a counter; 2.5.0 used positions in the full
// candidate list.
// The demo gained two buttons in stage 10 (31 before); 2.5.0 agrees on
// the same page (legacy-vs-2.5.0.spec.mjs).
const AUTO_COUNT_DEMO = 33;
