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

test.describe('clipping and covering', () => {
  const slotState = (page, address) => page.evaluate((a) => {
    const slot = document.getElementById('stadiaref-host').shadowRoot.querySelector('[data-stadiaref-for="' + a + '"]');
    const label = slot.querySelector('.stadiaref-ref-full-label');
    const cs = getComputedStyle(label);
    return { clipped: slot.hasAttribute('data-clipped'), covered: slot.hasAttribute('data-covered'), clip: slot.style.clipPath, shown: getComputedStyle(slot).display !== 'none' && cs.visibility !== 'hidden' };
  }, address);

  test('a label inside a scroll container is clipped to it, and hidden once scrolled out', async ({ page }) => {
    await open(page, page0());
    // In view inside the box: clipped to the box, still shown.
    let s = await slotState(page, 'home-list-item-01');
    expect(s.clip).toMatch(/^inset\(/);
    expect([s.clipped, s.shown]).toEqual([false, true]);
    // Scrolled past: the label goes, and takes no click.
    await page.evaluate(() => { document.getElementById('box').scrollTop = 400; });
    await expect.poll(async () => (await slotState(page, 'home-list-item-01')).clipped).toBe(true);
    s = await slotState(page, 'home-list-item-01');
    expect(s.shown).toBe(false);
    // An element with no clipping ancestor is never clipped.
    expect((await slotState(page, 'home-hero')).clip).toBe('');
    // Back in view: back.
    await page.evaluate(() => { document.getElementById('box').scrollTop = 0; });
    await expect.poll(async () => (await slotState(page, 'home-list-item-01')).shown).toBe(true);
  });

  test("a label whose element is under the page's fixed UI hides, and comes back when it is clear", async ({ page }) => {
    await open(page, page0());
    await page.evaluate(() => {
      const bar = document.createElement('header');
      bar.id = 'bar';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:120px;background:#333;z-index:10';
      document.body.appendChild(bar);
    });
    await expect.poll(async () => (await slotState(page, 'home-hero-heading')).covered).toBe(true);
    expect((await slotState(page, 'home-hero-heading')).shown).toBe(false);
    // Moved clear of the bar: shown again.
    await page.evaluate(() => { document.getElementById('hero').style.paddingTop = '200px'; });
    await expect.poll(async () => (await slotState(page, 'home-hero-heading')).covered).toBe(false);
    expect((await slotState(page, 'home-hero-heading')).shown).toBe(true);
  });

  test('an overlap that is not fixed UI (a stretched link) leaves the label alone', async ({ page }) => {
    await open(page, page0());
    await page.evaluate(() => {
      const hero = document.getElementById('hero');
      hero.style.position = 'relative';
      const a = document.createElement('a');
      a.href = '#x';
      a.style.cssText = 'position:absolute;inset:0';
      hero.appendChild(a);
    });
    await page.waitForTimeout(400);
    expect((await slotState(page, 'home-hero-heading')).covered).toBe(false);
  });
});

test.describe('top layer and transforms', () => {
  test('an open popover takes the host, so the labels inside it are drawn over it; closing it brings it back', async ({ page }) => {
    await open(page, page0());
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<div id="pop" popover style="top:200px;left:200px;margin:0;padding:20px"><p data-ref="home-pop-text" id="poptext">In a popover</p></div>');
      document.getElementById('pop').showPopover();
    });
    await expect.poll(() => page.evaluate(() => document.getElementById('stadiaref-host').parentElement.id)).toBe('pop');
    await expect(shadow(page, '[data-stadiaref-for="home-pop-text"] > .stadiaref-ref-full-label')).toBeVisible();
    await expect.poll(() => offset(page, 'home-pop-text', 'poptext')).toEqual([0, 0, 0, 0]);
    // The label is what is hit at its own position: on top.
    const hit = await page.evaluate(() => {
      const label = document.getElementById('stadiaref-host').shadowRoot.querySelector('[data-stadiaref-for="home-pop-text"] > .stadiaref-ref-full-label');
      const r = label.getBoundingClientRect();
      const top = document.getElementById('stadiaref-host').shadowRoot.elementFromPoint(r.left + 3, r.top + 3);
      return top === label || label.contains(top);
    });
    expect(hit).toBe(true);
    await page.evaluate(() => document.getElementById('pop').hidePopover());
    await expect.poll(() => page.evaluate(() => document.getElementById('stadiaref-host').parentElement === document.body)).toBe(true);
  });

  test('inside a modal centred with a transform, slots still sit over their elements', async ({ page }) => {
    await open(page, page0());
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<div id="modal" role="dialog" aria-modal="true" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;padding:30px;background:#fff;border:1px solid #000"><p data-ref="home-modal-text" id="modaltext">In a modal</p></div>');
    });
    await expect.poll(() => page.evaluate(() => document.getElementById('stadiaref-host').parentElement.id)).toBe('modal');
    await expect.poll(() => offset(page, 'home-modal-text', 'modaltext')).toEqual([0, 0, 0, 0]);
  });
});

test('1,000 addresses: a survey and a scroll stay within budget', async ({ page }) => {
  await open(page, harness({
    body: 'layer',
    cfg: { startHidden: true },
    post: "(function(){var m=document.createElement('main');m.setAttribute('data-ref','perf');for(var i=1;i<=1000;i++){var d=document.createElement('div');d.setAttribute('data-ref','perf-item-'+String(i).padStart(4,'0'));d.textContent='Item '+i;d.style.cssText='display:inline-block;width:110px;height:30px;margin:2px';m.appendChild(d);}document.body.appendChild(m);})();",
  }));
  const surveyMs = await page.evaluate(() => {
    const t = performance.now();
    window.stadiaref.show();
    return performance.now() - t;
  });
  await settle(page);
  expect(await shadow(page, '.stadiaref-slot').count()).toBeGreaterThan(1000);
  // A scroll: the placement pass runs in the next frame.
  const scrollMs = await page.evaluate(() => new Promise((resolve) => {
    const t = performance.now();
    window.scrollBy(0, 400);
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - t)));
  }));
  console.log('1,000 addresses: first show and survey ' + Math.round(surveyMs) + 'ms, scroll to placed ' + Math.round(scrollMs) + 'ms');
  expect(surveyMs).toBeLessThan(1500);
  expect(scrollMs).toBeLessThan(100);
});
