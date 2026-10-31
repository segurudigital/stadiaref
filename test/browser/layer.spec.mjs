// The overlay layer (3.4): labels are drawn in StadiaRef's shadow root and
// follow their elements.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow, settle } from './helpers.mjs';

const { harness, open } = makeHelpers(NEW);
const page0 = (cfg = {}) => harness({ body: 'layer', cfg: { startHidden: false, ...cfg } });

// The slot's top-left against the element's, in CSS pixels.
const offset = (page, address, id) => page.evaluate(([a, i]) => {
  const slot = document.getElementById('stadiaref-host').shadowRoot.querySelector('[data-stadiaref-for="' + a + '"]');
  const s = slot.getBoundingClientRect();
  const e = document.getElementById(i).getBoundingClientRect();
  return [Math.round(s.left - e.left), Math.round(s.top - e.top), Math.round(s.width - e.width), Math.round(s.height - e.height)];
}, [address, id]);

test('labels sit over their elements and follow a page scroll', async ({ page }) => {
  await open(page, page0());
  expect(await offset(page, 'home-hero-heading', 'heading')).toEqual([0, 0, 0, 0]);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => offset(page, 'home-hero-heading', 'heading')).toEqual([0, 0, 0, 0]);
  const [label, el] = [await shadow(page, '[data-stadiaref-for="home-hero-heading"] > .stadiaref-ref-full-label').boundingBox(), await page.locator('#heading').boundingBox()];
  expect(Math.abs(label.y - el.y)).toBeLessThan(30);
});

test('they follow an element inside a scroll container when it scrolls', async ({ page }) => {
  await open(page, page0());
  await page.evaluate(() => { document.getElementById('box').scrollTop = 80; });
  await expect.poll(() => offset(page, 'home-list-item-01', 'inner')).toEqual([0, 0, 0, 0]);
});

test('they follow a layout shift and a resize, without a survey', async ({ page }) => {
  await open(page, page0({ watch: false }));
  await page.evaluate(() => { document.getElementById('hero').style.paddingTop = '200px'; });
  await expect.poll(() => offset(page, 'home-hero-heading', 'heading')).toEqual([0, 0, 0, 0]);
  await page.setViewportSize({ width: 700, height: 600 });
  await expect.poll(() => offset(page, 'home-hero', 'hero')).toEqual([0, 0, 0, 0]);
});

test('an element that leaves the page takes its slot with it', async ({ page }) => {
  await open(page, page0());
  await page.evaluate(() => document.getElementById('heading').remove());
  await expect(shadow(page, '[data-stadiaref-for="home-hero-heading"]')).toHaveCount(0);
  await expect(shadow(page, '[data-stadiaref-for="home-hero"]')).toHaveCount(1);
});

test('hidden: nothing is drawn, and the layer is made only on first show', async ({ page }) => {
  await open(page, harness({ body: 'layer' }));
  expect(await page.evaluate(() => !!document.getElementById('stadiaref-host'))).toBe(false);
  await page.evaluate(() => window.stadiaref.show());
  await settle(page);
  await expect(shadow(page, '.stadiaref-layer')).toHaveCount(1);
  await page.evaluate(() => window.stadiaref.hide());
  await expect(shadow(page, '.stadiaref-ref-full-label').first()).toBeHidden();
});
