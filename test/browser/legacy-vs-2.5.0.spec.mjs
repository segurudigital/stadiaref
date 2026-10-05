// The 2.x Target and Level calls against the real 2.5.0 build.
//
// The same page is loaded twice: once with the frozen 2.5.0 bundle and once
// with the current build (titan profile, as 2.5.0 classified). Each run
// calls setDepth() or setLevelFilter() and lists which elements show a full
// label. The two lists must match, apart from the differences 3.0 makes on
// purpose, which are listed and explained below.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const V250 = fs.readFileSync(new URL('../../wordpress/bridge/assets/seguru-debug-toolbar.min.js', import.meta.url), 'utf8');

const PAGES = [
  '/test/demo.html',
  '/test/demo.html?cc=1',
  '/test/fixtures/v5-data-ref/block-bearing-dense.html',
  '/test/fixtures/v5-data-ref/block-bearing-small.html',
  '/test/fixtures/v5-data-ref/mixed.html',
  '/test/fixtures/v5-data-ref/non-block-bearing.html',
];

// Give every page element a stable id before either overlay starts, so the
// two runs can be compared element by element.
async function stampIds(page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      let n = 0;
      document.body.querySelectorAll('*').forEach((el) => { el.setAttribute('data-tid', String(++n)); });
    });
  });
}

async function load(page, url, which) {
  await stampIds(page);
  if (which === 'v250') {
    await page.route('**/seguru-debug-toolbar.js', (r) => r.fulfill({ body: V250, contentType: 'text/javascript' }));
  } else {
    await page.addInitScript(() => { window.stadiarefConfig = { profile: 'titan' }; });
  }
  await page.goto(url);
  // 2.5.0 mounts its host at start; 3.0 resolves `ready` and mounts on show.
  await page.waitForFunction(() => window.seguruDebugToolbar && (document.querySelector('#seguru-debug-toolbar-host') || window.seguruDebugToolbar.ready));
  await page.evaluate(() => { window.seguruDebugToolbar.show(); window.seguruDebugToolbar.setState(2); });
}

// Elements whose full label is on screen, with their tag and address. A
// label folded into a "+N" badge by the overlap solver counts: it is on
// screen through the badge, and which labels fold depends on label size,
// which 3.0 changed. A folded label only counts if it would show without
// the fold (2.5.0 also folded labels its Level filter had hidden).
function onScreen(page) {
  return page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const out = {};
    document.querySelectorAll('.sdt-ref-full-label, .stadiaref-ref-full-label').forEach((label) => {
      const folded = ['sdt-ref-clustered', 'stadiaref-ref-clustered'].filter((c) => label.classList.contains(c));
      folded.forEach((c) => label.classList.remove(c));
      const shown = getComputedStyle(label).display !== 'none' && label.getClientRects().length > 0;
      folded.forEach((c) => label.classList.add(c));
      if (!shown) return;
      const host = label.parentElement;
      const isVoidHost = host.classList.contains('sdt-ref-void-host') || host.classList.contains('stadiaref-ref-void-host');
      const owner = host._sdtOwner || (isVoidHost ? host.previousElementSibling : host);
      out[owner.getAttribute('data-tid')] = { tag: owner.tagName.toLowerCase(), address: owner.getAttribute('data-ref') };
    });
    resolve(out);
  }))));
}

// Differences 3.0 makes on purpose.
//   void: an <img>, <input> and so on keeps its label in a host beside it.
//         2.5.0's Level filter matched labels inside the element, so a
//         void element's label escaped it. Show hides it like any other.
//   rules: an address that breaks the core rules (bad--ref) is
//         unclassified in 3.0, where 2.5.0 called it a section, so a
//         narrowed Show hides it.
const VOID = new Set(['img', 'video', 'audio', 'iframe', 'canvas', 'input', 'select', 'textarea', 'hr', 'br', 'embed', 'object', 'svg']);
function explained(entry, call) {
  if (!call.startsWith('setLevelFilter') || call.includes("'all'")) return null;
  if (VOID.has(entry.tag)) return 'void';
  if (entry.address === 'bad--ref') return 'rules';
  return null;
}

const CALLS = [
  ...['section', 'block', 'element', 'all', 'off'].map((v) => `setDepth('${v}')`),
  ...['section', 'section-block', 'all'].map((v) => `setLevelFilter('${v}')`),
];

for (const url of PAGES) {
  test(`Target and Level match 2.5.0 on ${url}`, async ({ browser }) => {
    const results = {};
    for (const which of ['v250', 'now']) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      await load(page, url, which);
      results[which] = {};
      for (const call of CALLS) {
        await page.evaluate('window.seguruDebugToolbar.' + call);
        results[which][call] = await onScreen(page);
      }
      await ctx.close();
    }
    const unexplained = [];
    const allowed = [];
    for (const call of CALLS) {
      const a = results.v250[call];
      const b = results.now[call];
      for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (!!a[id] === !!b[id]) continue;
        const entry = a[id] || b[id];
        const why = explained(entry, call);
        const line = `${call}: <${entry.tag}> ${entry.address} ${a[id] ? 'shown by 2.5.0 only' : 'shown by 3.0 only'}`;
        if (why) allowed.push(line + ` (${why})`); else unexplained.push(line);
      }
      // Never an empty screen where 2.5.0 showed something.
      if (Object.keys(a).length) expect(Object.keys(b).length, call).toBeGreaterThan(0);
    }
    if (allowed.length) test.info().annotations.push({ type: 'intended differences', description: allowed.join('\n') });
    expect(unexplained).toEqual([]);
  });
}
