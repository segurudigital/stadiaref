// Pick and Find (brief 5.6, stage 6).
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, OLD, shadow, settle, press } from './helpers.mjs';

const { harness, open, recordEvents, events, eventsSoon, clearEvents } = makeHelpers(NEW);

async function center(page, sel) {
  const b = await page.locator(sel).boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}

const chipParts = (page) => shadow(page, '.stadiaref-pick-chip__part').allTextContents();
const chipHint = (page) => shadow(page, '.stadiaref-pick-chip__hint').textContent();

test.describe('Pick', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await recordEvents(page);
    await open(page, harness({ body: 'pickfind', page: { startHidden: false } }));
  });

  test('by pointer: labels step aside, the chip shows the chain, a click copies the element', async ({ page }) => {
    await shadow(page, '[data-stadiaref-pick]').click();
    await expect(shadow(page, '[data-stadiaref-pick]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-stadiaref-mode'))).toBe('pick');
    await settle(page);
    expect(await page.locator('.stadiaref-ref-full-label').evaluateAll((ls) => ls.filter((l) => getComputedStyle(l).display !== 'none').length)).toBe(0);

    await page.mouse.move(...await center(page, '#price'));
    // Section, block, element; the shared prefix is dropped from each later part.
    expect(await chipParts(page)).toEqual(['shop-grid', 'card-06', 'text-02-06-price']);
    expect(await chipHint(page)).toBe('Click copies shop-grid-text-02-06-price. Up arrow selects the block, Esc leaves pick mode.');
    await expect(shadow(page, '.stadiaref-highlight--pick-current')).toBeVisible();
    const [frame, el] = [await shadow(page, '.stadiaref-highlight--pick-current').boundingBox(), await page.locator('#price').boundingBox()];
    expect(Math.abs(frame.x - el.x)).toBeLessThan(2);

    await page.mouse.down();
    await page.mouse.up();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'shop-grid-text-02-06-price', tier: 'element', source: 'pick', copied: true });
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('shop-grid-text-02-06-price');
  });

  test('the arrow keys move up and down the chain', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.move(...await center(page, '#price'));
    await page.keyboard.press('ArrowUp');
    expect(await chipHint(page)).toBe('Click copies shop-grid-card-06. Up arrow selects the section, down arrow goes back, Esc leaves pick mode.');
    await expect(shadow(page, '.stadiaref-pick-chip__part--current')).toHaveText('card-06');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp'); // already at the top
    expect(await chipHint(page)).toBe('Click copies shop-grid. Down arrow goes back, Esc leaves pick mode.');
    await page.keyboard.press('ArrowDown');
    await page.mouse.click(...await center(page, '#price'));
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail.address).toBe('shop-grid-card-06');
  });

  test('Esc and P leave Pick; the labels come back', async ({ page }) => {
    await press(page, 'p');
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-stadiaref-mode'))).toBe('pick');
    await press(page, 'Escape');
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-mode'))).toBe(false);
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
    await expect(shadow(page, '.stadiaref-pick-chip')).toBeHidden();
    await press(page, 'p');
    await press(page, 'p');
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-mode'))).toBe(false);
    await page.evaluate(() => { window.stadiaref.pick(); window.stadiaref.pick(false); });
    await expect(shadow(page, '[data-stadiaref-pick]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('something with no address shows its nearest addressed ancestor, or says so', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.move(...await center(page, '#plain'));
    expect(await chipParts(page)).toEqual(['shop-grid', 'card-06']);
    await page.mouse.move(...await center(page, '#top'));
    await expect(shadow(page, '.stadiaref-pick-chip__parts')).toHaveText('No address here');
    await page.mouse.click(...await center(page, '#top'));
    await page.waitForTimeout(100);
    expect(await events(page, 'address-click')).toHaveLength(0);
  });

  test('a Pick click never reaches the page', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.click(...await center(page, '#buy'));
    await page.mouse.click(...await center(page, '#plain'));
    await eventsSoon(page, 'address-click');
    expect(await page.evaluate(() => [window.__hostClicks, location.hash])).toEqual([0, '']);
    // The toolbar still works while picking.
    await shadow(page, '[data-stadiaref-pick]').click();
    await expect(shadow(page, '[data-stadiaref-pick]')).toHaveAttribute('aria-pressed', 'false');
    // With Pick off the page gets its clicks again (labels off, so the
    // link's own label isn't on top of it).
    await page.evaluate(() => window.stadiaref.setLabels('off'));
    await page.locator('#buy').click();
    expect(await page.evaluate(() => [window.__hostClicks, location.hash])).toEqual([1, '#bought']);
  });

  test('the 2.x click event carries the chip as current', async ({ page }) => {
    const O = makeHelpers(OLD);
    await O.recordEvents(page);
    await open(page, harness({ body: 'pickfind', page: { startHidden: false } }));
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.click(...await center(page, '#price'));
    const [old] = await O.eventsSoon(page, 'dataref-click');
    expect(old.detail.dataRef).toBe('shop-grid-text-02-06-price');
    expect(old.detail.current.cls).toBe('stadiaref-pick-chip');
  });
});

test.describe('Find', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await recordEvents(page);
    await open(page, harness({ body: 'pickfind', page: { startHidden: false } }));
  });

  const rows = (page) => shadow(page, '.stadiaref-find__row').evaluateAll((rs) => rs.map((r) => [r.querySelector('.stadiaref-tag').textContent, r.querySelector('.stadiaref-find__address').textContent, r.getAttribute('aria-selected'), r.querySelector('.stadiaref-find__note') ? 'hidden' : '']));
  const status = (page) => shadow(page, '.stadiaref-find__status').textContent();

  test('an exact address: jumps to it and lists what is inside', async ({ page }) => {
    const found = await page.evaluate(() => window.stadiaref.find('shop-grid-card-06'));
    expect(found).toEqual(['shop-grid-card-06', 'shop-grid-card-06-title', 'shop-grid-card-06-buy']);
    await expect(shadow(page, '[data-stadiaref-find]')).toHaveAttribute('aria-pressed', 'true');
    expect(await rows(page)).toEqual([
      ['BLK', 'shop-grid-card-06', 'true', ''],
      ['EL', 'shop-grid-card-06-title', 'false', ''],
      ['EL', 'shop-grid-text-02-06-price', 'false', ''],
      ['EL', 'shop-grid-card-06-buy', 'false', ''],
    ]);
    expect(await status(page)).toBe('1 match, plus the 3 addresses inside it. Enter jumps to the first.');
    // Jumped: framed, with the page dimmed by one fixed layer that takes no pointer events.
    const dim = shadow(page, '.stadiaref-highlight--find');
    await expect(dim).toBeVisible();
    expect(await dim.evaluate((d) => [getComputedStyle(d).position, getComputedStyle(d).pointerEvents, getComputedStyle(d).boxShadow.includes('rgba(17, 24, 39, 0.45)')])).toEqual(['fixed', 'none', true]);
    expect(await shadow(page, '.stadiaref-highlight--find').count()).toBe(1);
  });

  test('by substring, with the keyboard; a click on a row jumps and copies', async ({ page }) => {
    await press(page, '/');
    await expect(shadow(page, '.stadiaref-find__input')).toBeFocused();
    await page.keyboard.type('title');
    expect((await rows(page)).map((r) => r[1])).toEqual(['shop-grid-card-06-title', 'shop-grid-card-07-title']);
    expect(await status(page)).toBe('2 matches. Enter jumps to the first.');
    await page.keyboard.press('ArrowDown');
    expect((await rows(page)).map((r) => r[2])).toEqual(['false', 'true']);
    await page.keyboard.press('ArrowDown');
    expect((await rows(page)).map((r) => r[2])).toEqual(['true', 'false']);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(shadow(page, '.stadiaref-highlight--find')).toBeVisible();
    await settle(page);
    const [frame, el] = [await shadow(page, '.stadiaref-highlight--find').boundingBox(), await page.locator('[data-ref="shop-grid-card-07-title"]').boundingBox()];
    expect(Math.abs(frame.y - el.y)).toBeLessThan(3);
    await shadow(page, '.stadiaref-find__row').first().click();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'shop-grid-card-06-title', source: 'find', copied: true });
  });

  test('no match', async ({ page }) => {
    expect(await page.evaluate(() => window.stadiaref.find('zzz'))).toEqual([]);
    expect(await rows(page)).toEqual([]);
    expect(await status(page)).toBe('No address contains “zzz”.');
  });

  test('a match in a closed container is listed as hidden and skipped', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.find('menu'));
    expect(await rows(page)).toEqual([['EL', 'shop-grid-card-menu', 'false', 'hidden']]);
    await shadow(page, '.stadiaref-find__input').press('Enter');
    await expect(shadow(page, '.stadiaref-highlight--find')).toHaveCount(0);
    await page.evaluate(() => window.stadiaref.find('card'));
    // The hidden match isn't the one Enter jumps to.
    expect((await rows(page)).find((r) => r[2] === 'true')[3]).toBe('');
  });

  test('typing a letter that is also a shortcut key types it', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.find(''));
    await shadow(page, '.stadiaref-find__input').pressSequentially('dl123po/');
    expect(await shadow(page, '.stadiaref-find__input').inputValue()).toBe('dl123po/');
    expect(await page.evaluate(() => [window.stadiaref.isVisible(), window.stadiaref.getLabels(), window.stadiaref.getTiers().length, window.stadiaref.getOutline()])).toEqual([true, 'full', 3, 'off']);
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-mode'))).toBe(false);
  });

  test('Esc closes Find and clears the dim layer; find(false) closes it too', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.find('shop-grid-card-07'));
    await expect(shadow(page, '.stadiaref-highlight--find')).toBeVisible();
    await shadow(page, '.stadiaref-find__input').press('Escape');
    await expect(shadow(page, '.stadiaref-find')).toBeHidden();
    await expect(shadow(page, '.stadiaref-highlight--find')).toBeHidden();
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
    await page.evaluate(() => window.stadiaref.find('shop'));
    await page.evaluate(() => window.stadiaref.find(false));
    await expect(shadow(page, '.stadiaref-find')).toBeHidden();
    await expect(shadow(page, '[data-stadiaref-find]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('Pick and Find replace each other', async ({ page }) => {
    await page.evaluate(() => window.stadiaref.find('shop'));
    await page.evaluate(() => window.stadiaref.pick());
    await expect(shadow(page, '.stadiaref-find')).toBeHidden();
    await page.evaluate(() => window.stadiaref.find('shop'));
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-mode'))).toBe(false);
  });
});

test('find() before start returns an empty list', async ({ page }) => {
  await page.goto(harness({ body: 'pickfind', post: 'window.__early = window.stadiaref.find("shop");' }));
  await page.evaluate(() => window.stadiaref.ready);
  expect(await page.evaluate(() => window.__early)).toEqual([]);
});

test('Esc leaves Pick before a host dialog sees it', async ({ page }) => {
  await open(page, harness({ body: 'pickfind', page: { startHidden: false }, pre: "document.addEventListener('keydown',function(e){if(e.key==='Escape')window.__dialogClosed=true;});" }));
  await page.evaluate(() => window.stadiaref.pick());
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => [window.__dialogClosed || false, document.documentElement.hasAttribute('data-stadiaref-mode')])).toEqual([false, false]);
});

test.describe('the copied flag', () => {
  test('false when the clipboard is refused, with an honest toast', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => ({ writeText: () => Promise.reject(new Error('denied')) }), configurable: true });
      document.execCommand = () => false;
    });
    await recordEvents(page);
    await open(page, harness({ body: 'pickfind', page: { startHidden: false } }));
    await page.locator('[data-ref="shop-grid"] > .stadiaref-ref-full-label').click();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'shop-grid', copied: false, source: 'label' });
    await expect(shadow(page, '.stadiaref-toast')).toHaveText('Could not copy: shop-grid');
  });

  test('true through the fallback when the clipboard API is missing', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined, configurable: true });
      document.execCommand = () => true;
    });
    await recordEvents(page);
    await open(page, harness({ body: 'pickfind', page: { startHidden: false } }));
    await page.locator('[data-ref="shop-grid"] > .stadiaref-ref-full-label').click();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail.copied).toBe(true);
    await expect(shadow(page, '.stadiaref-toast')).toHaveText('Copied: shop-grid');
  });
});
