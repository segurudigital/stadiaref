// The address card (3.3): a label click opens it by default; click: 'copy'
// keeps 3.2's click to copy. setLookup() adds the host's rows.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow, settle, press } from './helpers.mjs';

const { harness, open, recordEvents, events, eventsSoon, clearEvents } = makeHelpers(NEW);

const cardPage = (cfg = {}) => harness({ body: 'card', cfg: { startHidden: false, ...cfg } });
const label = (page, ref) => page.locator(`[data-ref="${ref}"] > .stadiaref-ref-full-label`);
const card = (page) => shadow(page, '.stadiaref-card');
const cardEvents = (page) => page.evaluate(() => window.__cards);

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await recordEvents(page);
  await page.addInitScript(() => {
    window.__cards = [];
    window.addEventListener('stadiaref:card', (e) => window.__cards.push({ open: e.detail.open, address: e.detail.address, tier: e.detail.tier, ref: e.detail.element.getAttribute('data-ref') }));
  });
});

test.describe('opening and placing', () => {
  test('a label click opens the card below the label, without copying', async ({ page }) => {
    await open(page, cardPage());
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('card');
    await label(page, 'home-hero-cta').click();
    await expect(card(page)).toBeVisible();
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('home-hero-cta');
    await expect(shadow(page, '.stadiaref-card__tier')).toHaveText('element');
    expect(await cardEvents(page)).toEqual([{ open: true, address: 'home-hero-cta', tier: 'element', ref: 'home-hero-cta' }]);
    await page.waitForTimeout(100);
    expect(await events(page, 'address-click')).toHaveLength(0);
    expect(await page.evaluate(() => window.__hostClicks)).toBe(0);
    const [box, lab] = [await card(page).boundingBox(), await label(page, 'home-hero-cta').boundingBox()];
    expect(box.y).toBeGreaterThanOrEqual(lab.y + lab.height);
    expect(Math.abs(box.x - lab.x)).toBeLessThan(2);
    await expect(card(page)).toHaveAttribute('data-placement', 'below');
    // The element is framed while its card is open.
    await expect(shadow(page, '.stadiaref-highlight--card')).toBeVisible();
  });

  test('the address chain box does not open beside the card', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero-cta').hover();
    await label(page, 'home-hero-cta').click();
    await expect(card(page)).toBeVisible();
    await expect(shadow(page, '.stadiaref-active-ref-tree')).not.toHaveClass(/--open/);
  });

  test('with no room below it flips above, and stays inside the viewport', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'foot-bar').click();
    await expect(card(page)).toHaveAttribute('data-placement', 'above');
    const [box, lab, vw] = [await card(page).boundingBox(), await label(page, 'foot-bar').boundingBox(), page.viewportSize()];
    expect(box.y + box.height).toBeLessThanOrEqual(lab.y);
    expect(box.x + box.width).toBeLessThanOrEqual(vw.width - 8 + 0.5);
    expect(box.x).toBeGreaterThanOrEqual(8);
  });

  test('on a narrow screen it fits the width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 700 });
    await open(page, cardPage());
    await label(page, 'home-hero-cta').click();
    const box = await card(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(352.5);
  });

  test('card() opens it from the API by address or element; card(false) closes it', async ({ page }) => {
    await open(page, cardPage({ click: 'copy' }));
    expect(await page.evaluate(() => window.stadiaref.card('home-hero'))).toBe(true);
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('home-hero');
    expect(await page.evaluate(() => window.stadiaref.card(document.getElementById('cta')))).toBe(true);
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('home-hero-cta');
    expect(await page.evaluate(() => window.stadiaref.card('no-such-address'))).toBe(false);
    await page.evaluate(() => window.stadiaref.card(false));
    await expect(card(page)).toBeHidden();
    expect((await cardEvents(page)).map((e) => [e.open, e.address])).toEqual([
      [true, 'home-hero'], [false, 'home-hero'], [true, 'home-hero-cta'], [false, 'home-hero-cta'],
    ]);
  });
});

test.describe('closing', () => {
  test('Esc closes the card first, then hides StadiaRef', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero').click();
    await page.keyboard.press('Escape');
    await expect(card(page)).toBeHidden();
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
    await press(page, 'Escape');
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  });

  test('a click elsewhere closes it', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero').click();
    await page.mouse.click(700, 600);
    await expect(card(page)).toBeHidden();
    expect((await cardEvents(page)).at(-1)).toMatchObject({ open: false, address: 'home-hero' });
  });

  test('a scroll closes it', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero').click();
    await page.mouse.wheel(0, 300);
    await expect(card(page)).toBeHidden();
  });

  test('hiding StadiaRef closes it', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero').click();
    await page.evaluate(() => window.stadiaref.hide());
    expect((await cardEvents(page)).at(-1)).toMatchObject({ open: false });
  });
});

test.describe('keyboard', () => {
  test('focus moves into the card, Tab stays inside it, and comes back when it closes', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.card('home-hero-heading'));
    const focused = () => page.evaluate(() => {
      const a = document.getElementById('stadiaref-host').shadowRoot.activeElement;
      return a ? (a.textContent || a.getAttribute('aria-label')) : null;
    });
    expect(await focused()).toBe('Copy');
    const seen = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); seen.push(await focused()); }
    expect(seen).toContain('Close');
    expect(seen).toContain('Show in Tree');
    expect(seen.every((s) => s !== null)).toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await focused()).not.toBeNull();
  });

  test('the chain and Parent buttons open the cards above, by keyboard', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.card('home-hero-cta'));
    await expect(shadow(page, '.stadiaref-card__section').first().locator('.stadiaref-card__ref-text')).toHaveText(['home-hero']);
    await shadow(page, '.stadiaref-card__btn', { hasText: 'Parent' });
    await shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Parent' }).focus();
    await page.keyboard.press('Enter');
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('home-hero');
    await expect(shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Parent' })).toBeDisabled();
  });
});

test.describe('content', () => {
  test('text is the first 140 characters, without the label text', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.card('home-hero-heading'));
    await expect(shadow(page, '.stadiaref-card__text')).toHaveText('Pick a plan that grows with you');
    await page.evaluate(() => window.stadiaref.card('home-hero-text-01'));
    const text = await shadow(page, '.stadiaref-card__text').textContent();
    expect(text.length).toBeLessThanOrEqual(140);
    expect(text.endsWith('…')).toBe(true);
    expect(text).not.toContain('home-hero');
  });

  test('the addresses directly inside, up to 14, then "+n more"', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.card('list-grid'));
    await expect(shadow(page, '.stadiaref-card__key').filter({ hasText: 'Contains' })).toHaveText('Contains 16');
    await expect(shadow(page, '.stadiaref-card__ref')).toHaveCount(14);
    await expect(shadow(page, '.stadiaref-card__more')).toHaveText('+2 more');
    await shadow(page, '.stadiaref-card__ref').nth(2).click();
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('list-grid-card-03');
  });

  test('Copy copies and fires address-click with source card', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero-cta').click();
    await shadow(page, '.stadiaref-card__btn--copy').click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('home-hero-cta');
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'home-hero-cta', tier: 'element', source: 'card', copied: true });
    await expect(shadow(page, '.stadiaref-toast')).toHaveText('Copied: home-hero-cta');
    await expect(card(page)).toBeVisible();
  });

  test('Copy for a brief copies one line: page, width, address, tier, text', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero-cta').click();
    await clearEvents(page);
    await shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Copy for a brief' }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('harness | 1280px | home-hero-cta | element | "Start now"');
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'home-hero-cta', source: 'brief', copied: true });
  });

  test('Show in Tree opens the Tree at the row', async ({ page }) => {
    await open(page, cardPage());
    await label(page, 'home-hero-cta').click();
    await shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Show in Tree' }).click();
    await expect(shadow(page, '.stadiaref-tree-panel')).toHaveClass(/--open/);
    expect(await page.evaluate(() => {
      const a = document.getElementById('stadiaref-host').shadowRoot.activeElement;
      return a && a.querySelector('.stadiaref-tree-ref').textContent;
    })).toBe('home-hero-cta');
  });

  test('a Tree row opens its card on the page', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.toggleTree());
    await shadow(page, '.stadiaref-tree-row').filter({ hasText: 'list-grid-card-16' }).click();
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('list-grid-card-16');
    await expect(shadow(page, '.stadiaref-highlight--jump')).toBeVisible();
  });
});

test.describe("click: 'copy'", () => {
  test('a label click copies as in 3.2, and no card opens', async ({ page }) => {
    await open(page, cardPage({ click: 'copy' }));
    await label(page, 'home-hero').click();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'home-hero', source: 'label', copied: true });
    await expect(card(page)).toBeHidden();
    expect(await cardEvents(page)).toEqual([]);
  });

  test('init({ click }) switches at any time; an unknown value is ignored', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.init({ click: 'copy' }));
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('copy');
    await page.evaluate(() => window.stadiaref.init({ click: 'nope' }));
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('copy');
    await page.evaluate(() => window.stadiaref.init({ click: 'card' }));
    await label(page, 'home-hero').click();
    await expect(card(page)).toBeVisible();
  });

  test('the data-click script attribute sets it', async ({ page }) => {
    await open(page, harness({ body: 'card', cfg: { startHidden: false }, attrs: { 'data-click': 'copy' } }));
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('copy');
  });

  test('a page configured through a 2.x object keeps click to copy unless it says otherwise', async ({ page }) => {
    await open(page, harness({ body: 'card', legacyPage: { startHidden: false } }));
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('copy');
    await open(page, harness({ body: 'card', legacyPage: { startHidden: false, click: 'card' } }));
    expect(await page.evaluate(() => window.stadiaref.getClick())).toBe('card');
  });
});

test.describe('setLookup', () => {
  test('rows from a function show under the text, as text only', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.setLookup((address, el) => [
      { label: 'Lock', value: 'Locked', tone: 'ok' },
      { label: 'Format', value: '<img src=x onerror="window.__pwned=1">', tone: 'error' },
      { label: 'Tag', value: el.tagName.toLowerCase(), tone: 'bogus' },
      { label: 'Spec', value: 'Open', href: 'https://example.com/spec#' + address },
      { label: 'Bad link', value: 'x', href: 'javascript:window.__pwned=2' },
    ]));
    await label(page, 'home-hero-cta').click();
    const rows = shadow(page, '.stadiaref-card__row');
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(0)).toHaveClass(/--ok/);
    await expect(rows.nth(1).locator('.stadiaref-card__row-value')).toHaveText('<img src=x onerror="window.__pwned=1">');
    await expect(rows.nth(1)).toHaveClass(/--error/);
    await expect(rows.nth(2)).toHaveText('Taga');
    expect(await rows.nth(2).getAttribute('class')).toBe('stadiaref-card__row');
    await expect(rows.nth(3).locator('a')).toHaveAttribute('href', 'https://example.com/spec#home-hero-cta');
    await expect(rows.nth(3).locator('a')).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(rows.nth(4).locator('a')).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  });

  test('a promise of rows: a placeholder, then the rows; a late answer for another card is dropped', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => {
      window.__resolvers = {};
      window.stadiaref.setLookup((address) => new Promise((r) => { window.__resolvers[address] = r; }));
    });
    await page.evaluate(() => window.stadiaref.card('home-hero'));
    await expect(shadow(page, '.stadiaref-card__row')).toHaveText(['Looking up…']);
    await page.evaluate(() => window.stadiaref.card('home-hero-cta'));
    await page.evaluate(() => window.__resolvers['home-hero']([{ label: 'Stale', value: 'yes' }]));
    await settle(page);
    await expect(shadow(page, '.stadiaref-card__row')).toHaveText(['Looking up…']);
    await page.evaluate(() => window.__resolvers['home-hero-cta']([{ label: 'Lock', value: 'Draft', tone: 'warn' }]));
    await expect(shadow(page, '.stadiaref-card__row')).toHaveText(['LockDraft']);
  });

  test('no rows, a throw or a rejection leave the rows out', async ({ page }) => {
    await open(page, cardPage());
    await page.evaluate(() => window.stadiaref.setLookup(() => []));
    await page.evaluate(() => window.stadiaref.card('home-hero'));
    await expect(shadow(page, '.stadiaref-card__rows')).toBeHidden();
    await page.evaluate(() => window.stadiaref.setLookup(() => { throw new Error('boom'); }));
    await page.evaluate(() => window.stadiaref.card('home-hero-cta'));
    await expect(shadow(page, '.stadiaref-card__rows')).toBeHidden();
    await page.evaluate(() => window.stadiaref.setLookup(() => Promise.reject(new Error('no'))));
    await page.evaluate(() => window.stadiaref.card('home-hero-heading'));
    await expect(shadow(page, '.stadiaref-card__rows')).toBeHidden();
    await page.evaluate(() => window.stadiaref.setLookup(null));
    await page.evaluate(() => window.stadiaref.card('home-hero'));
    await expect(shadow(page, '.stadiaref-card__rows')).toBeHidden();
  });
});

test.describe('Inspect in Pick', () => {
  const center = async (page, sel) => {
    const b = await page.locator(sel).boundingBox();
    return [b.x + b.width / 2, b.y + b.height / 2];
  };
  const pickPage = (cfg = {}) => harness({ body: 'pickfind', cfg: { startHidden: false, ...cfg } });

  test('a click anywhere opens the card for the pick target, and never reaches the page', async ({ page }) => {
    await open(page, pickPage());
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.move(...await center(page, '#price'));
    await expect(shadow(page, '.stadiaref-pick-chip__hint')).toHaveText('Click opens shop-grid-text-02-06-price. Up arrow selects the block, Esc leaves pick mode.');
    await page.mouse.click(...await center(page, '#price'));
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('shop-grid-text-02-06-price');
    // Something without an address opens its nearest addressed ancestor.
    // (Esc first: the card sits over #plain.)
    await page.keyboard.press('Escape');
    await page.mouse.click(...await center(page, '#plain'));
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('shop-grid-card-06');
    await page.keyboard.press('Escape');
    await page.mouse.click(...await center(page, '#buy'));
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('shop-grid-card-06-buy');
    expect(await page.evaluate(() => [window.__hostClicks, location.hash])).toEqual([0, '']);
    await page.waitForTimeout(100);
    expect(await events(page, 'address-click')).toHaveLength(0);
  });

  test('the arrow keys choose the level the click opens', async ({ page }) => {
    await open(page, pickPage());
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.move(...await center(page, '#price'));
    await page.keyboard.press('ArrowUp');
    await page.mouse.click(...await center(page, '#price'));
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('shop-grid-card-06');
  });

  test('nothing opens where there is no address; Esc closes the card, then leaves Pick', async ({ page }) => {
    await open(page, pickPage());
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.click(...await center(page, '#top'));
    await expect(shadow(page, '.stadiaref-card')).toHaveCount(0);
    await page.mouse.click(...await center(page, '#price'));
    await expect(shadow(page, '.stadiaref-card')).toBeVisible();
    // The card's own buttons work while picking.
    await shadow(page, '.stadiaref-card__btn').filter({ hasText: 'Parent' }).click();
    await expect(shadow(page, '.stadiaref-card__address')).toHaveText('shop-grid-card-06');
    await page.keyboard.press('Escape');
    await expect(shadow(page, '.stadiaref-card')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-stadiaref-mode'))).toBe('pick');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-mode'))).toBe(false);
  });

  test("with click: 'copy' a Pick click copies, as in 3.2", async ({ page }) => {
    await open(page, pickPage({ click: 'copy' }));
    await page.evaluate(() => window.stadiaref.pick());
    await page.mouse.click(...await center(page, '#price'));
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'shop-grid-text-02-06-price', source: 'pick' });
    await expect(shadow(page, '.stadiaref-card')).toHaveCount(0);
  });
});

test.describe('hover hint with labels off', () => {
  const hint = (page) => shadow(page, '.stadiaref-hint');
  const center = async (page, sel) => {
    const b = await page.locator(sel).boundingBox();
    return [b.x + b.width / 2, b.y + b.height / 2];
  };

  test('after a short delay, the address and tier beside the pointer', async ({ page }) => {
    await open(page, cardPage({ labels: 'off' }));
    await page.mouse.move(...await center(page, '#cta'));
    await page.waitForTimeout(150);
    await expect(hint(page)).toHaveCount(0);
    await expect(hint(page)).toBeVisible();
    await expect(shadow(page, '.stadiaref-hint__address')).toHaveText('home-hero-cta');
    await expect(shadow(page, '.stadiaref-hint__tier')).toHaveText('element');
    const [box, [x, y]] = [await hint(page).boundingBox(), await center(page, '#cta')];
    expect(box.x).toBeGreaterThan(x);
    expect(box.y).toBeGreaterThan(y);
    // Moving to something else hides it until the next pause.
    await page.mouse.move(...await center(page, '#heading'));
    await expect(hint(page)).toBeHidden();
    await expect(shadow(page, '.stadiaref-hint__address')).toHaveText('home-hero-heading');
    await page.mouse.down();
    await expect(hint(page)).toBeHidden();
  });

  test('not with labels on, not with hint: false', async ({ page }) => {
    await open(page, cardPage());
    await page.mouse.move(...await center(page, '#cta'));
    await page.waitForTimeout(600);
    await expect(hint(page)).toHaveCount(0);
    await page.evaluate(() => window.stadiaref.init({ labels: 'off', hint: false }));
    await page.mouse.move(...await center(page, '#heading'));
    await page.waitForTimeout(600);
    await expect(hint(page)).toHaveCount(0);
  });
});

test.describe('hover hint on touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('never shows', async ({ page }) => {
    await open(page, cardPage({ labels: 'off' }));
    await page.locator('#heading').tap();
    await page.waitForTimeout(700);
    await expect(shadow(page, '.stadiaref-hint')).toHaveCount(0);
  });
});
