// Shared helpers for the browser suite.
//
// makeHelpers(names) returns the helpers bound to one naming scheme, so the
// same tests can run against the 3.0 names and against the 2.x aliases.
import { expect } from '@playwright/test';

export const HOST_ID = 'stadiaref-host';

export const NEW = {
  global: 'stadiaref',
  prefix: 'stadiaref:',
  configParam: 'cfg', // window.stadiarefConfig
  events: [
    'ready', 'show', 'hide', 'theme-change', 'user-change', 'labels-change', 'outline-change',
    'tiers-change', 'auto-address-change',
    'address-click', 'address-hover', 'address-leave',
  ],
};

export const OLD = {
  global: 'seguruDebugToolbar',
  prefix: 'sdt:',
  configParam: 'page', // window.seguruDebugConfig
  events: [
    'ready', 'show', 'hide', 'theme-change', 'user-change',
    'dataref-click', 'dataref-hover', 'dataref-leave',
    'depth-change', 'outline-change', 'level-filter-change',
  ],
};

export function makeHelpers(names) {
  // Builds a /__harness URL. See test/support/server.mjs for the parameters.
  // `page` is the per-page config object for this naming scheme; `cfg`,
  // `legacyPage` and `wp` name a specific global.
  function harness(opts = {}) {
    const q = new URLSearchParams();
    if (opts.body) q.set('body', opts.body);
    if (opts.page !== undefined) q.set(names.configParam, JSON.stringify(opts.page));
    if (opts.cfg !== undefined) q.set('cfg', JSON.stringify(opts.cfg));
    if (opts.legacyPage !== undefined) q.set('page', JSON.stringify(opts.legacyPage));
    if (opts.wp !== undefined) q.set('wp', JSON.stringify(opts.wp));
    if (opts.attrs) q.set('attrs', JSON.stringify(opts.attrs));
    if (opts.pre) q.set('pre', opts.pre);
    if (opts.noscript) q.set('noscript', '1');
    if (opts.defer) q.set('defer', '1');
    return '/__harness?' + q.toString();
  }

  // Records every public event into window.__ev before any page script runs.
  // Element values in the detail are reduced to something serialisable.
  async function recordEvents(page) {
    await page.addInitScript(({ prefix, names: list, globalName }) => {
      window.__ev = [];
      list.forEach((n) => {
        window.addEventListener(prefix + n, (e) => {
          const d = e.detail || {};
          const o = {};
          Object.keys(d).forEach((k) => {
            const v = d[k];
            o[k] = v && v.nodeType === 1
              ? { node: true, tag: v.tagName.toLowerCase(), ref: v.getAttribute('data-ref'), cls: String(v.className) }
              : v;
          });
          window.__ev.push({ name: n, detail: o, globalExists: !!window[globalName], cancelable: e.cancelable, bubbles: e.bubbles });
        });
      });
    }, { prefix: names.prefix, names: names.events, globalName: names.global });
  }

  async function events(page, name) {
    const all = await page.evaluate(() => window.__ev || []);
    return name ? all.filter((e) => e.name === name) : all;
  }

  async function clearEvents(page) {
    await page.evaluate(() => { window.__ev = []; });
  }

  // Loads a page and waits until the overlay has started (the `ready`
  // promise has resolved). StadiaRef mounts its host only on first show.
  async function open(page, url) {
    await page.goto(url);
    await page.waitForFunction((globalName) => !!window[globalName] && !!window[globalName].ready, names.global);
    await page.evaluate((globalName) => window[globalName].ready.then(() => true), names.global);
  }

  async function expectVisible(page, visible) {
    await expect.poll(() => page.evaluate((g) => window[g].isVisible(), names.global)).toBe(visible);
  }

  return { harness, recordEvents, events, clearEvents, open, expectVisible, GLOBAL: names.global, EVENT_PREFIX: names.prefix };
}

// Wait two animation frames so rAF-batched visibility checks have run.
export function settle(page) {
  return page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

// Count elements matching a selector that are actually rendered.
export async function countVisible(page, selector) {
  await settle(page);
  return page.evaluate((sel) => Array.from(document.querySelectorAll(sel)).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0;
  }).length, selector);
}

// Addresses whose full label is rendered. A label's owner is its parent,
// or, for a void element (an <img> and so on), the element just before
// the label host StadiaRef puts beside it.
export async function visibleFullLabelRefs(page) {
  await settle(page);
  return page.evaluate(() => Array.from(document.querySelectorAll('.stadiaref-ref-full-label')).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && el.getClientRects().length > 0;
  }).map((el) => {
    const host = el.parentElement;
    const owner = host.classList.contains('stadiaref-ref-void-host') ? host.previousElementSibling : host;
    return owner.getAttribute('data-ref');
  }).sort());
}

// { address: tier } for every labelled element, read from its full label.
export function labelTiers(page) {
  return page.evaluate(() => {
    const out = {};
    document.querySelectorAll('.stadiaref-ref-full-label').forEach((el) => {
      const host = el.parentElement;
      const owner = host.classList.contains('stadiaref-ref-void-host') ? host.previousElementSibling : host;
      const m = el.className.match(/stadiaref-tier-(\w+)/);
      out[owner.getAttribute('data-ref')] = m ? m[1] : null;
    });
    return out;
  });
}

// Query inside the toolbar's shadow root.
export function shadow(page, selector) {
  return page.locator('#' + HOST_ID).locator(selector);
}

export async function press(page, key) {
  // Keys go to <body> so they aren't treated as typing.
  await page.locator('body').press(key);
}
