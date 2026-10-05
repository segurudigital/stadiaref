// Apps (brief stage 7, rules 2, 4, 5 and 7 of 5.7): watching the page,
// dialogs, touch Pick, safe areas and docking.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow, settle, press, visibleFullLabelRefs, HOST_ID } from './helpers.mjs';

const { harness, open, recordEvents, eventsSoon } = makeHelpers(NEW);

const surveys = (page) => page.evaluate(() => performance.getEntriesByName('stadiaref:survey').length);
const labelCount = (page) => page.evaluate(() => document.querySelectorAll('.stadiaref-ref-full-label').length);

test.describe('watching the page', () => {
  test('a route change: labels appear for the new screen and go for the old one, with no refresh()', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    expect(await visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01', 'ops-app-jobs-card-01-status']);

    await page.locator('#to-settings').click();
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-settings', 'ops-app-settings-users', 'ops-app-settings-users-role']);
    expect(await labelCount(page)).toBe(3);

    // Back: popstate, and the router renders the old screen again.
    await page.goBack();
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01', 'ops-app-jobs-card-01-status']);
    expect(await labelCount(page)).toBe(3);
  });

  test('a framework-style text update wipes a label, and it is back within two frames', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await settle(page);
    const back = await page.evaluate(() => new Promise((resolve) => {
      const el = document.getElementById('status');
      // What a framework does on a re-render: replace the children, rewrite the class.
      el.textContent = 'Done';
      el.className = 'status status--done';
      const wiped = !el.querySelector('.stadiaref-ref-full-label');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        resolve({ wiped, back: !!el.querySelector('.stadiaref-ref-full-label'), text: el.firstChild.nodeValue });
      }));
    }));
    expect(back).toEqual({ wiped: true, back: true, text: 'Done' });
    expect(await visibleFullLabelRefs(page)).toContain('ops-app-jobs-card-01-status');
    // StadiaRef's own nodes aren't in the element's class.
    expect(await page.locator('#status').getAttribute('class')).toBe('status status--done');
  });

  test('an address changed on a reused node is relabelled', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await page.evaluate(() => document.getElementById('status').setAttribute('data-ref', 'ops-app-jobs-card-01-state'));
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01', 'ops-app-jobs-card-01-state']);
    expect(await page.locator('#status .stadiaref-ref-full-label').count()).toBe(1);
  });

  test('one survey per frame: a page that adds 1,000 nodes in one tick gets one survey', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await settle(page);
    await settle(page);
    const before = await surveys(page);
    await page.evaluate(() => {
      const main = document.querySelector('main');
      for (let i = 0; i < 1000; i++) {
        const d = document.createElement('div');
        d.setAttribute('data-ref', 'ops-app-jobs-row-' + i);
        d.textContent = 'row ' + i;
        main.appendChild(d);
      }
    });
    await settle(page);
    await settle(page);
    expect(await surveys(page) - before).toBe(1);
    expect(await labelCount(page)).toBe(1003);
    // StadiaRef's own changes don't schedule another.
    await settle(page);
    expect(await surveys(page) - before).toBe(1);
  });

  test('a quiet page is not surveyed again and again', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false, outline: 'block' } }));
    await settle(page);
    await settle(page);
    const before = await surveys(page);
    await page.waitForTimeout(300);
    expect(await surveys(page)).toBe(before);
  });

  test('with watch off, added nodes wait for refresh(); init({ watch }) switches it', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false, watch: false } }));
    await page.locator('#to-settings').click();
    await page.waitForTimeout(100);
    expect(await visibleFullLabelRefs(page)).toEqual([]);
    await page.evaluate(() => window.stadiaref.refresh());
    expect(await visibleFullLabelRefs(page)).toEqual(['ops-app-settings', 'ops-app-settings-users', 'ops-app-settings-users-role']);
    await page.evaluate(() => window.stadiaref.init({ watch: true }));
    await page.locator('#to-jobs').click();
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01', 'ops-app-jobs-card-01-status']);
  });

  test('nothing is observed or written while hidden; changes made then show on first show', async ({ page }) => {
    await open(page, harness({ body: 'spa' }));
    await page.locator('#to-settings').click();
    await settle(page);
    expect(await page.evaluate(() => [document.querySelectorAll('.stadiaref-ref-full-label').length, !!document.getElementById('stadiaref-host')])).toEqual([0, false]);
    await press(page, 'd');
    expect(await visibleFullLabelRefs(page)).toEqual(['ops-app-settings', 'ops-app-settings-users', 'ops-app-settings-users-role']);
  });
});

test.describe('self-repair', () => {
  test('a client router swapping <body>: the host and labels come back', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await page.evaluate(() => {
      const body = document.createElement('body');
      body.innerHTML = '<main data-ref="ops-app-billing" style="padding:30px"><p data-ref="ops-app-billing-total">Total</p></main>';
      document.documentElement.replaceChild(body, document.body);
    });
    await expect.poll(() => page.evaluate((id) => !!document.getElementById(id) && document.getElementById(id).isConnected, HOST_ID)).toBe(true);
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-billing', 'ops-app-billing-total']);
    // The toolbar works.
    await shadow(page, '[data-stadiaref-toggle-tree]').click();
    await expect(shadow(page, '.stadiaref-tree-panel')).toBeVisible();
  });

  test('the label stylesheet and the <html> attributes are put back if removed', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await page.evaluate(() => {
      document.getElementById('stadiaref-styles').remove();
      document.documentElement.removeAttribute('data-stadiaref-visible');
      document.documentElement.removeAttribute('data-stadiaref-labels');
    });
    await expect.poll(() => page.evaluate(() => [
      !!document.getElementById('stadiaref-styles'),
      document.documentElement.hasAttribute('data-stadiaref-visible'),
      document.documentElement.getAttribute('data-stadiaref-labels'),
    ])).toEqual([true, true, 'full']);
    expect(await visibleFullLabelRefs(page)).toHaveLength(3);
  });

  test('astro:after-swap re-surveys; the host is marked to persist across Astro swaps', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false, watch: false } }));
    expect(await page.locator('#' + HOST_ID).getAttribute('data-astro-transition-persist')).toBeTruthy();
    await page.evaluate(() => {
      document.getElementById('app').innerHTML = '<main data-ref="ops-app-team"></main>';
      document.dispatchEvent(new Event('astro:after-swap'));
    });
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-team']);
  });
});

test.describe('never boot twice', () => {
  test('a second copy of StadiaRef does not start, and says so once', async ({ page }) => {
    const warnings = [];
    page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    await page.evaluate(() => new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = '/overlay.js';
      s.onload = resolve;
      document.body.appendChild(s);
    }));
    await settle(page);
    expect(await page.locator('[data-stadiaref-root]').count()).toBe(1);
    expect(warnings.filter((w) => w.includes('already running'))).toHaveLength(1);
    expect(await labelCount(page)).toBe(3);
  });

  test('a 2.x overlay already on the page: StadiaRef does not start', async ({ page }) => {
    const warnings = [];
    page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
    await page.goto(harness({ body: 'spa', page: { startHidden: false }, pre: 'window.seguruDebugToolbar = { version: "2.5.0" };' }));
    await page.waitForLoadState('load');
    await settle(page);
    expect(await page.evaluate(() => typeof window.stadiaref)).toBe('undefined');
    expect(await page.locator('[data-stadiaref-root]').count()).toBe(0);
    expect(warnings.filter((w) => w.includes('already running'))).toHaveLength(1);
  });
});

test.describe('dialogs', () => {
  test('a <dialog> opened with showModal(): narrowed, the toolbar clickable, Find accepts typing, then restored', async ({ page }) => {
    await open(page, harness({ body: 'dialogs', page: { startHidden: false } }));
    await page.locator('#open-dialog').click();
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual([
      'ops-app-jobs-dialog-edit', 'ops-app-jobs-dialog-edit-field-customer', 'ops-app-jobs-dialog-edit-save',
    ]);
    const status = shadow(page, '.stadiaref-dialog-status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText('Dialog opened. Showing the 3 addresses inside it.');
    await expect(status).toHaveAttribute('role', 'status');
    expect(await page.evaluate((id) => document.getElementById(id).parentElement.id, HOST_ID)).toBe('dlg');

    // The toolbar takes a real click (Playwright checks nothing covers it).
    await shadow(page, '[data-stadiaref-find]').click();
    await page.keyboard.type('customer');
    await expect(shadow(page, '.stadiaref-find__input')).toHaveValue('customer');
    await expect(shadow(page, '.stadiaref-find__address')).toHaveText(['ops-app-jobs-dialog-edit-field-customer']);
    // Esc leaves Find first and the dialog stays open.
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.getElementById('dlg').open)).toBe(true);

    await page.evaluate(() => document.getElementById('dlg').close());
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01']);
    await expect(status).toBeHidden();
    expect(await page.evaluate((id) => document.getElementById(id).parentElement === document.body, HOST_ID)).toBe(true);
  });

  test('Esc closes the host dialog without hiding StadiaRef', async ({ page }) => {
    await recordEvents(page);
    await open(page, harness({ body: 'dialogs', page: { startHidden: false } }));
    await page.locator('#open-dialog').click();
    await settle(page);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => [document.getElementById('dlg').open, window.stadiaref.isVisible()])).toEqual([false, true]);
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01']);
    // With no dialog open, Esc hides StadiaRef as before.
    await press(page, 'Escape');
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
  });

  test('a scripted role="dialog" with a focus trap: narrowed, and the Find field keeps focus', async ({ page }) => {
    await open(page, harness({ body: 'dialogs', page: { startHidden: false } }));
    await page.locator('#open-scripted').click();
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs-dialog-scripted', 'ops-app-jobs-dialog-scripted-field']);
    await expect(shadow(page, '.stadiaref-dialog-status')).toHaveText('Dialog opened. Showing the 2 addresses inside it.');
    expect(await page.evaluate((id) => document.getElementById(id).parentElement.id, HOST_ID)).toBe('scripted');

    await shadow(page, '[data-stadiaref-find]').click();
    await page.keyboard.type('field');
    await expect(shadow(page, '.stadiaref-find__input')).toHaveValue('field');
    expect(await page.evaluate((id) => document.activeElement.id, HOST_ID)).toBe(HOST_ID);
    // Find searches inside the dialog only.
    await expect(shadow(page, '.stadiaref-find__address')).toHaveText(['ops-app-jobs-dialog-scripted-field']);
    await page.keyboard.press('Escape');

    // Esc now goes to the dialog, which closes itself; StadiaRef stays.
    await page.locator('#scripted-field').focus();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => [document.getElementById('scripted').hidden, window.stadiaref.isVisible()])).toEqual([true, true]);
    await expect.poll(() => visibleFullLabelRefs(page)).toEqual(['ops-app-jobs', 'ops-app-jobs-card-01']);
    expect(await page.evaluate((id) => document.getElementById(id).parentElement === document.body, HOST_ID)).toBe(true);
  });
});

test.describe('touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('Pick by tap: a sheet with the chain, the full address, Copy address, Parent and Close', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await recordEvents(page);
    // The sample cards are fixed-width; let them fit a phone.
    await open(page, harness({ body: 'pickfind', page: { startHidden: false }, post: "document.querySelectorAll('article').forEach(function (a) { a.style.width = 'auto'; });" }));
    await shadow(page, '[data-stadiaref-pick]').tap();
    await page.locator('#price').tap();

    const sheet = shadow(page, '.stadiaref-pick-sheet');
    await expect(sheet).toBeVisible();
    await expect(shadow(page, '.stadiaref-pick-chip')).toBeHidden();
    await expect(sheet.locator('.stadiaref-pick-chip__part')).toHaveText(['shop-grid', 'card-06', 'text-02-06-price']);
    await expect(sheet.locator('.stadiaref-pick-sheet__address')).toHaveText('shop-grid-text-02-06-price');
    const buttons = sheet.locator('.stadiaref-pick-sheet__btn');
    await expect(buttons).toHaveText(['Copy address', 'Parent', 'Close']);
    for (const b of await buttons.all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
    // The tap didn't reach the page.
    expect(await page.evaluate(() => window.__hostClicks)).toBe(0);

    await buttons.nth(1).tap();
    await expect(sheet.locator('.stadiaref-pick-sheet__address')).toHaveText('shop-grid-card-06');
    await buttons.nth(0).tap();
    const [click] = await eventsSoon(page, 'address-click');
    expect(click.detail).toMatchObject({ address: 'shop-grid-card-06', tier: 'block', source: 'pick' });

    await buttons.nth(2).tap();
    await expect(sheet).toBeHidden();
    expect(await page.evaluate(() => window.stadiaref.getLabels())).toBeTruthy();
  });
});

test.describe('docking', () => {
  const gapBelowToolbar = (page) => page.evaluate((id) => {
    const bar = document.getElementById(id).shadowRoot.querySelector('.stadiaref-toolbar');
    return Math.round(window.innerHeight - bar.getBoundingClientRect().bottom);
  }, HOST_ID);

  // The tab bar is 64px plus its 1px top border.
  const BAR = 65;

  test('the toolbar docks above a fixed bottom bar', async ({ page }) => {
    await open(page, harness({ body: 'tabbar', page: { startHidden: false } }));
    expect(await gapBelowToolbar(page)).toBe(BAR + 20);
  });

  test('dockOffset replaces the detected bar on the side it sets', async ({ page }) => {
    await open(page, harness({ body: 'tabbar', page: { startHidden: false, dockOffset: { bottom: 100 } } }));
    expect(await gapBelowToolbar(page)).toBe(100 + 20);
    await page.evaluate(() => window.stadiaref.init({ dockOffset: { right: 10 } }));
    expect(await gapBelowToolbar(page)).toBe(BAR + 20);
  });

  test('with no bar the toolbar sits at the usual distance; the safe area is part of the offset', async ({ page }) => {
    await open(page, harness({ body: 'spa', page: { startHidden: false } }));
    expect(await gapBelowToolbar(page)).toBe(20);
    expect(await page.evaluate((id) => document.getElementById(id).shadowRoot.querySelector('.stadiaref-toolbar').style.bottom, HOST_ID)).toContain('safe-area-inset-bottom');
  });
});
