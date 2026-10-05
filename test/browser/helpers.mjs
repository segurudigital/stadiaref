// Shared helpers for the browser suite.
import { expect } from '@playwright/test';

// Every public event name the 2.5.0 overlay passes to emitEvent().
export const EVENT_NAMES = [
  'ready', 'show', 'hide', 'theme-change', 'user-change',
  'dataref-click', 'dataref-hover', 'dataref-leave',
  'depth-change', 'outline-change', 'level-filter-change',
];

export const GLOBAL = 'seguruDebugToolbar';
export const HOST_ID = 'seguru-debug-toolbar-host';
export const EVENT_PREFIX = 'sdt:';

// Builds a /__harness URL. See test/support/server.mjs for the parameters.
export function harness(opts = {}) {
  const q = new URLSearchParams();
  if (opts.body) q.set('body', opts.body);
  if (opts.page !== undefined) q.set('page', JSON.stringify(opts.page));
  if (opts.wp !== undefined) q.set('wp', JSON.stringify(opts.wp));
  if (opts.attrs) q.set('attrs', JSON.stringify(opts.attrs));
  if (opts.pre) q.set('pre', opts.pre);
  if (opts.noscript) q.set('noscript', '1');
  if (opts.defer) q.set('defer', '1');
  return '/__harness?' + q.toString();
}

// Records every public event into window.__ev before any page script runs.
// Element values in the detail are reduced to something serialisable.
export async function recordEvents(page, prefix = EVENT_PREFIX, names = EVENT_NAMES, globalName = GLOBAL) {
  await page.addInitScript(({ prefix, names, globalName }) => {
    window.__ev = [];
    names.forEach((n) => {
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
  }, { prefix, names, globalName });
}

export async function events(page, name) {
  const all = await page.evaluate(() => window.__ev || []);
  return name ? all.filter((e) => e.name === name) : all;
}

export async function clearEvents(page) {
  await page.evaluate(() => { window.__ev = []; });
}

// Loads a page and waits until the overlay has booted (host mounted, API set).
export async function open(page, url, { globalName = GLOBAL, hostId = HOST_ID } = {}) {
  await page.goto(url);
  await page.waitForFunction(({ globalName, hostId }) =>
    !!window[globalName] && !!document.getElementById(hostId) && document.getElementById(hostId).shadowRoot,
  { globalName, hostId });
}

export function api(page, fn, arg) {
  return page.evaluate(fn, arg);
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

// Addresses whose full label is rendered.
export async function visibleFullLabelRefs(page) {
  await settle(page);
  return page.evaluate(() => Array.from(document.querySelectorAll('.sdt-ref-full-label')).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && el.getClientRects().length > 0;
  }).map((el) => {
    const host = el.parentElement;
    const owner = host && host.classList.contains('sdt-ref-void-host') ? host._sdtOwner : host;
    return owner && owner.getAttribute('data-ref');
  }).sort());
}

// Query inside the toolbar's shadow root.
export function shadow(page, selector, hostId = HOST_ID) {
  return page.locator('#' + hostId).locator(selector);
}

export async function press(page, key) {
  // Keys go to <body> so they aren't treated as typing.
  await page.locator('body').press(key);
}

export async function expectVisible(page, visible) {
  await expect.poll(() => page.evaluate((g) => window[g].isVisible(), GLOBAL)).toBe(visible);
}
