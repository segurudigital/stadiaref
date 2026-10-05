// The ES module entry (dist/index.mjs) and the Astro host (stage 8).
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, shadow, settle, press, HOST_ID } from './helpers.mjs';

const { harness, open } = makeHelpers(NEW);

// Runs `code` as a module script on the page and waits for it.
async function runModule(page, code) {
  await page.evaluate((src) => new Promise((resolve, reject) => {
    window.__moduleDone = resolve;
    window.__moduleFailed = reject;
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = src + '\nwindow.__moduleDone();';
    s.onerror = reject;
    window.addEventListener('error', (e) => reject(e.message), { once: true });
    document.body.appendChild(s);
  }), code);
}

test.describe('dist/index.mjs', () => {
  test('importing it starts StadiaRef; the default export is window.stadiaref', async ({ page }) => {
    await page.goto(harness({ body: 'nesting', noscript: true }));
    await runModule(page, `
      import stadiaref from '/dist/index.mjs';
      window.__same = stadiaref === window.stadiaref;
      window.__version = stadiaref.version;
      await stadiaref.ready;
      stadiaref.show();
    `);
    expect(await page.evaluate(() => [window.__same, window.__version])).toEqual([true, await page.evaluate(() => window.stadiaref.version)]);
    await settle(page);
    expect(await page.locator('.stadiaref-ref-full-label').count()).toBeGreaterThan(0);
  });

  test('one profile registry: a profile registered through stadiaref/core is used by the overlay, and the other way round', async ({ page }) => {
    await page.goto(harness({ body: 'nesting', noscript: true }));
    await runModule(page, `
      import stadiaref from '/dist/index.mjs';
      import { registerProfile, profiles, classify } from '/dist/core.mjs';
      registerProfile({ name: 'zeta', classify: (a) => (/^zeta-s\\d{2}-b\\d{2}$/.test(a) ? 'block' : null) });
      stadiaref.setProfile('zeta');
      stadiaref.registerProfile({ name: 'omega', classify: () => 'element' });
      window.__r = {
        profile: stadiaref.getProfile(),
        overlay: stadiaref.validate('zeta-s01-b02').valid && stadiaref.classify('zeta-s01-b02'),
        core: classify('anything-here', { profile: 'omega' }),
        names: profiles.slice(),
      };
    `);
    const r = await page.evaluate(() => window.__r);
    expect(r.profile).toBe('zeta');
    expect(r.overlay).toBe('block');
    expect(r.core).toBe('element');
    expect(r.names).toEqual(expect.arrayContaining(['generic', 'app', 'titan', 'zeta', 'omega']));
  });

  test('a script tag after the module does not start a second copy', async ({ page }) => {
    const warnings = [];
    page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
    await page.goto(harness({ body: 'nesting', noscript: true }));
    await runModule(page, `import stadiaref from '/dist/index.mjs'; await stadiaref.ready; stadiaref.show();`);
    await page.evaluate(() => new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = '/overlay.js';
      s.onload = resolve;
      document.body.appendChild(s);
    }));
    expect(await page.locator('[data-stadiaref-root]').count()).toBe(1);
    expect(warnings.filter((w) => w.includes('already running'))).toHaveLength(1);
  });
});

test.describe('the Astro host', () => {
  // A stand-in for Astro's Dev Toolbar: the element, its bar, and the app
  // canvas the StadiaRef integration registers (id "stadiaref").
  const fakeAstro = (appId) => `
    var bar = document.createElement('astro-dev-toolbar');
    var root = bar.attachShadow({ mode: 'open' });
    root.innerHTML = '<div id="dev-bar" style="position:fixed;left:40%;bottom:20px;width:200px;height:48px"></div>';
    var canvas = document.createElement('astro-dev-toolbar-app-canvas');
    canvas.setAttribute('data-app-id', '${appId}');
    canvas.attachShadow({ mode: 'open' });
    root.appendChild(canvas);
    document.body.appendChild(bar);
  `;
  const toolbarDisplay = (page) => page.evaluate((id) => getComputedStyle(document.getElementById(id).shadowRoot.querySelector('.stadiaref-toolbar')).display, HOST_ID);
  const panel = (page) => page.locator('astro-dev-toolbar astro-dev-toolbar-app-canvas .stadiaref-panel');

  test('the panel replaces the floating toolbar and drives StadiaRef', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false }, post: fakeAstro('stadiaref') }));
    expect(await toolbarDisplay(page)).toBe('none');
    const p = panel(page);
    await expect(p).toBeVisible();
    // The brand is in the panel too.
    await expect(p.locator('.stadiaref-brand__icon')).toHaveCount(1);
    await expect(p.locator('.stadiaref-brand__logotype')).toHaveCount(1);
    const count = await page.evaluate(() => document.querySelectorAll('[data-ref]').length);
    await expect(p.locator('.stadiaref-panel__count')).toHaveText(count + ' addresses');

    await p.getByRole('button', { name: 'Icons' }).click();
    expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('icons');
    await expect(p.getByRole('button', { name: 'Icons' })).toHaveAttribute('aria-pressed', 'true');
    await p.getByRole('button', { name: 'Elements' }).click();
    expect(await page.evaluate(() => window.stadiaref.getTiers())).toEqual(['section', 'block']);
    await p.getByRole('button', { name: 'Blocks' }).last().click();
    expect(await page.evaluate(() => window.stadiaref.getOutline())).toBe('block');

    // The state also follows keys and the API.
    await press(page, 'l');
    await expect(p.getByRole('button', { name: 'Full' })).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => window.stadiaref.setAutoAddress(true));
    await expect(p.locator('.stadiaref-panel__auto')).toBeVisible();

    // Find opens in StadiaRef's own corner.
    await p.getByRole('button', { name: 'Find' }).click();
    await expect(shadow(page, '.stadiaref-find')).toBeVisible();
    await expect(p.getByRole('button', { name: 'Find' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the panel is there while StadiaRef is hidden; using it shows StadiaRef', async ({ page }) => {
    await open(page, harness({ body: 'nesting', post: fakeAstro('stadiaref') }));
    const p = panel(page);
    await expect(p).toBeVisible();
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
    await p.getByRole('button', { name: 'Icons' }).click();
    expect(await page.evaluate(() => [window.stadiaref.isVisible(), window.stadiaref.getLabels()])).toEqual([true, 'icons']);
    expect(await toolbarDisplay(page)).toBe('none');
  });

  test('a Dev Toolbar that arrives after StadiaRef has started is picked up when the app starts', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
    expect(await toolbarDisplay(page)).not.toBe('none');
    await page.evaluate(fakeAstro('stadiaref') + "window.dispatchEvent(new Event('stadiaref:astro-app'));");
    await expect(panel(page)).toBeVisible();
    expect(await toolbarDisplay(page)).toBe('none');
  });

  test('Astro\'s Dev Toolbar without the StadiaRef app (no integration): the floating toolbar is drawn', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false }, post: fakeAstro('astro:audit') }));
    await settle(page);
    expect(await toolbarDisplay(page)).not.toBe('none');
    await expect(panel(page)).toHaveCount(0);
  });

  test('page code has no way in: no hooks on the API, nothing in config', async ({ page }) => {
    await open(page, harness({ body: 'nesting', page: { startHidden: false, hostMode: 'astro', host: 'astro' } }));
    await page.evaluate(() => window.stadiaref.init({ hostMode: 'astro', host: 'astro' }));
    await page.evaluate(() => window.dispatchEvent(new Event('stadiaref:astro-app')));
    await settle(page);
    expect(await toolbarDisplay(page)).not.toBe('none');
    expect(await page.evaluate(() => [
      Object.getOwnPropertySymbols(window.stadiaref).length,
      Object.keys(window.stadiaref).some((k) => /host|panel/i.test(k)),
    ])).toEqual([0, false]);
  });
});
