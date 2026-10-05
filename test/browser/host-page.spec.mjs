// Rules for host pages (brief 5.7): nothing written while hidden (rule 1),
// no state on the page's own elements (rule 3), the root marker (rule 6).
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, settle } from './helpers.mjs';

const { harness, open } = makeHelpers(NEW);

const PAGES = [
  harness({ body: 'basic' }),
  harness({ body: 'nesting', page: { autoAddress: true, outline: 'block', tiers: ['section'], labels: 'icons' } }),
  '/test/demo.html?hidden',
  '/test/demo.html?ar=1&hidden',
  '/test/fixtures/v5-data-ref/mixed.html?hidden',
];

// The page's DOM as text, after load and a couple of frames. The demo
// page's own script logs StadiaRef's events into #event-log; that is the
// host page writing, not StadiaRef, so the log is emptied in both runs.
async function domAfterLoad(page) {
  await page.waitForLoadState('load');
  await settle(page);
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const log = document.getElementById('event-log');
    if (log) log.textContent = '';
    return document.documentElement.outerHTML;
  });
}

for (const url of PAGES) {
  test(`hidden StadiaRef leaves the page DOM byte-identical: ${url}`, async ({ browser }) => {
    // Without StadiaRef: the same page, the overlay script answered empty.
    const ctxA = await browser.newContext();
    const without = await ctxA.newPage();
    await without.route(/\/(seguru-debug-toolbar|stadiaref|overlay)(\.min)?\.js$/, (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
    // The demo and fixtures start visible; ?hidden (above) keeps them hidden.
    await without.addInitScript(() => { window.stadiarefConfig = Object.assign({ startHidden: true }, window.stadiarefConfig || {}); });
    await without.goto(url);
    const a = await domAfterLoad(without);
    await ctxA.close();

    const ctxB = await browser.newContext();
    const withIt = await ctxB.newPage();
    await withIt.addInitScript(() => { window.stadiarefConfig = Object.assign({ startHidden: true }, window.stadiarefConfig || {}); });
    await open(withIt, url);
    // Calls made while hidden change state only.
    await withIt.evaluate(() => {
      const s = window.stadiaref;
      s.setLabels('full'); s.setTiers(['block']); s.setOutline('section'); s.setAutoAddress(true); s.refresh(); s.setTheme('dark');
    });
    const b = await domAfterLoad(withIt);
    expect(await withIt.evaluate(() => window.stadiaref.isVisible())).toBe(false);
    await ctxB.close();
    expect(b).toBe(a);
  });
}

test('the class converter is the one thing that runs while hidden', async ({ page }) => {
  await open(page, harness({ body: 'converter', page: { classConverter: true } }));
  expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe('home-intro');
  expect(await page.evaluate(() => !!document.querySelector('[data-stadiaref-root], #stadiaref-styles'))).toBe(false);
});

test('no classes or state on the page\'s own elements', async ({ page }) => {
  await open(page, '/test/fixtures/v5-data-ref/block-bearing-dense.html');
  const snapshot = () => page.evaluate(() => {
    const out = {};
    let n = 0;
    document.body.querySelectorAll('*').forEach((el) => {
      if (el.closest('[data-stadiaref-root]') || /\bstadiaref-/.test(el.className)) return;
      const attrs = {};
      Array.from(el.attributes).forEach((a) => { attrs[a.name] = a.value; });
      out[++n + ':' + el.tagName] = attrs;
    });
    return { els: out, body: document.body.className, bodyAttrs: Array.from(document.body.attributes).map((a) => a.name) };
  });
  const before = await snapshot();
  await page.evaluate(() => {
    const s = window.stadiaref;
    s.show(); s.setOutline('block'); s.setLabels('icons'); s.setLabels('full'); s.setTiers(['section', 'block']); s.setTiers(['section', 'block', 'element']); s.toggleTree();
  });
  // Hover a Tree row: the highlight is drawn in the shadow root.
  await page.locator('#stadiaref-host .stadiaref-tree-row').first().hover();
  await settle(page);
  const after = await snapshot();
  expect(after.body).toBe(before.body);
  expect(after.bodyAttrs).toEqual(before.bodyAttrs);
  for (const key of Object.keys(before.els)) {
    const was = before.els[key];
    const now = after.els[key];
    // Allowed: position: relative on a static element that hosts labels or
    // an outline frame.
    if (now.style !== was.style) expect(now.style, key).toMatch(/position: relative;?$/);
    expect({ ...now, style: undefined }, key).toEqual({ ...was, style: undefined });
  }
});

test('global state lives on <html> as data-stadiaref-* attributes', async ({ page }) => {
  await open(page, harness({ body: 'nesting', page: { startHidden: false } }));
  await page.evaluate(() => window.stadiaref.setTiers(['element']));
  expect(await page.evaluate(() => Object.fromEntries(Array.from(document.documentElement.attributes).filter((a) => a.name.startsWith('data-stadiaref')).map((a) => [a.name, a.value]))))
    .toEqual({ 'data-stadiaref-visible': '', 'data-stadiaref-labels': 'full', 'data-stadiaref-hidden-tiers': 'section block' });
  await page.evaluate(() => window.stadiaref.hide());
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stadiaref-visible'))).toBe(false);
});

test('the shadow host carries data-stadiaref-root', async ({ page }) => {
  await open(page, harness({ page: { startHidden: false } }));
  expect(await page.evaluate(() => {
    const roots = document.querySelectorAll('[data-stadiaref-root]');
    return [roots.length, roots[0].id, !!roots[0].shadowRoot];
  })).toEqual([1, 'stadiaref-host', true]);
});
