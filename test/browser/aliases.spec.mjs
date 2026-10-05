// Every 2.x name (docs: migrating-from-2.x) keeps working with its 2.x
// behaviour. If one stops working or changes behaviour, this file fails.
import { test, expect } from '@playwright/test';
import { makeHelpers, NEW, OLD, countVisible, press, shadow } from './helpers.mjs';

const N = makeHelpers(NEW);
const O = makeHelpers(OLD);

// Record both event families in dispatch order.
async function recordAll(page) {
  await page.addInitScript(({ names }) => {
    window.__all = [];
    names.forEach((type) => {
      window.addEventListener(type, (e) => {
        const d = e.detail || {};
        const o = {};
        Object.keys(d).forEach((k) => {
          const v = d[k];
          o[k] = v && v.nodeType === 1 ? { node: true, ref: v.getAttribute('data-ref'), cls: String(v.className) } : v;
        });
        window.__all.push({ type, detail: o });
      });
    });
  }, { names: [...NEW.events.map((n) => NEW.prefix + n), ...OLD.events.map((n) => OLD.prefix + n), 'stadiaref:auto-address-change', 'stadiaref:tiers-change'] });
}
const all = (page) => page.evaluate(() => window.__all);

function consoleNotices(page) {
  const msgs = [];
  page.on('console', (m) => { if (m.text().includes('seguruDebugToolbar')) msgs.push(m.text()); });
  return msgs;
}

test.describe('global, config objects and storage', () => {
  test('window.seguruDebugToolbar is window.stadiaref, with one notice on first access', async ({ page }) => {
    const notices = consoleNotices(page);
    await N.open(page, N.harness());
    expect(notices).toHaveLength(0);
    expect(await page.evaluate(() => window.seguruDebugToolbar === window.stadiaref)).toBe(true);
    await page.evaluate(() => { window.seguruDebugToolbar.getDock(); window.seguruDebugToolbar.getDock(); });
    await expect.poll(() => notices.length).toBe(1);
    expect(notices[0]).toContain('window.stadiaref');
  });

  test('assigning window.seguruDebugToolbar does not replace the API', async ({ page }) => {
    await N.open(page, N.harness());
    await page.evaluate(() => { window.seguruDebugToolbar = { stub: true }; });
    expect(await page.evaluate(() => window.seguruDebugToolbar === window.stadiaref)).toBe(true);
  });

  test('window.seguruDebugConfig and window.sdtConfig are read', async ({ page }) => {
    await N.open(page, N.harness({ legacyPage: { dock: 'top-left' } }));
    expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('top-left');
    await N.open(page, N.harness({ wp: { dock: 'bottom-left' } }));
    expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('bottom-left');
  });

  test('precedence: stadiarefConfig, then seguruDebugConfig, then sdtConfig, key by key', async ({ page }) => {
    await N.open(page, N.harness({
      cfg: { dock: 'top-left' },
      legacyPage: { dock: 'top-right', theme: 'dark', labels: 'off' },
      wp: { dock: 'bottom-left', theme: 'light', labels: 'icons', outline: 'block' },
    }));
    expect(await page.evaluate(() => {
      const a = window.stadiaref;
      return [a.getDock(), a.getTheme(), a.getLabels(), a.getOutline()];
    })).toEqual(['top-left', 'dark', 'off', 'block']);
  });

  test('a 2.x key in a higher source beats the 3.0 key in a lower one', async ({ page }) => {
    // defaultMode in seguruDebugConfig maps to labels, which stadiarefConfig doesn't set.
    await N.open(page, N.harness({ cfg: { dock: 'top-left' }, legacyPage: { defaultMode: 0 }, wp: { labels: 'off' } }));
    expect(await page.evaluate(() => window.stadiaref.getLabels())).toBe('icons');
  });

  test('sdtConfig strings are coerced as in 2.5.0', async ({ page }) => {
    await N.open(page, N.harness({ body: 'converter', wp: { defaultMode: '0', startHidden: '0', autoRef: '1', classConverter: '1' } }));
    expect(await page.evaluate(() => [window.stadiaref.getLabels(), window.stadiaref.isVisible(), window.stadiaref.getDepth()])).toEqual(['icons', true, 'all']);
    expect(await page.evaluate(() => document.querySelector('.intro').getAttribute('data-ref'))).toBe('home-intro');
    await N.open(page, N.harness({ wp: { defaultMode: '1', startHidden: '1', autoRef: '0' } }));
    expect(await page.evaluate(() => [window.stadiaref.getLabels(), window.stadiaref.isVisible(), window.stadiaref.getDepth()])).toEqual(['off', false, 'off']);
  });

  test('localStorage seguru-debug-toolbar:theme is read once, moved to stadiaref:theme, and removed', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('seguru-debug-toolbar:theme', 'dark');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.emulateMedia({ colorScheme: 'light' });
    await N.open(page, N.harness());
    expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
    expect(await page.evaluate(() => [localStorage.getItem('stadiaref:theme'), localStorage.getItem('seguru-debug-toolbar:theme')])).toEqual(['dark', null]);
    await N.open(page, N.harness());
    expect(await page.evaluate(() => window.stadiaref.getTheme())).toBe('dark');
  });

  test('an existing stadiaref:theme is kept; the old key is still removed', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('stadiaref:theme', 'light');
        localStorage.setItem('seguru-debug-toolbar:theme', 'dark');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await N.open(page, N.harness());
    expect(await page.evaluate(() => [window.stadiaref.getTheme(), localStorage.getItem('seguru-debug-toolbar:theme')])).toEqual(['light', null]);
  });
});

test.describe('2.x config keys', () => {
  for (const [where, opt] of [['stadiarefConfig', 'cfg'], ['seguruDebugConfig', 'legacyPage'], ['sdtConfig', 'wp']]) {
    test(`defaultMode, outlineMode, position, hotkey, levelFilter, autoRef, autoRefDepth in ${where}`, async ({ page }) => {
      await N.open(page, N.harness({ [opt]: { defaultMode: 0, outlineMode: 'section', position: 'top-left', hotkey: 'k', levelFilter: 'section-block', autoRef: true, autoRefDepth: 'block' } }));
      expect(await page.evaluate(() => {
        const a = window.stadiaref;
        return [a.getLabels(), a.getState(), a.getOutline(), a.getDock(), a.getHotkey(), a.getLevelFilter(), a.getDepth()];
      })).toEqual(['icons', 0, 'section', 'top-left', 'K', 'section-block', 'block']);
    });
  }

  test('in one object, the 3.0 key wins over its 2.x name', async ({ page }) => {
    await N.open(page, N.harness({ cfg: { labels: 'off', defaultMode: 0, outline: 'block', outlineMode: 'section', dock: 'top-right', position: 'top-left' } }));
    expect(await page.evaluate(() => [window.stadiaref.getLabels(), window.stadiaref.getOutline(), window.stadiaref.getDock()])).toEqual(['off', 'block', 'top-right']);
  });

  test('script attributes data-hotkey, data-theme, data-dock, data-position', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await N.open(page, N.harness({ attrs: { 'data-hotkey': 'j', 'data-theme': 'dark', 'data-dock': 'top-left' } }));
    expect(await page.evaluate(() => [window.stadiaref.getHotkey(), window.stadiaref.getTheme(), window.stadiaref.getDock()])).toEqual(['J', 'dark', 'top-left']);
    await N.open(page, N.harness({ attrs: { 'data-position': 'bottom-left' } }));
    expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('bottom-left');
    await N.open(page, N.harness({ attrs: { 'data-position': 'bottom-left', 'data-dock': 'top-right' } }));
    expect(await page.evaluate(() => window.stadiaref.getDock())).toBe('top-right');
  });

  test('init() takes 2.x keys', async ({ page }) => {
    await N.open(page, N.harness());
    await page.evaluate(() => window.stadiaref.init({ defaultMode: 1, outlineMode: 'block', position: 'top-left', hotkey: 'q', levelFilter: 'section' }));
    expect(await page.evaluate(() => {
      const a = window.stadiaref;
      return [a.getLabels(), a.getOutline(), a.getDock(), a.getHotkey(), a.getLevelFilter()];
    })).toEqual(['off', 'block', 'top-left', 'Q', 'section']);
    await page.evaluate(() => window.stadiaref.init({ autoRef: true, autoRefDepth: 'section' }));
    expect(await page.evaluate(() => window.stadiaref.getDepth())).toBe('section');
    await page.evaluate(() => window.stadiaref.init({ autoRef: false }));
    expect(await page.evaluate(() => window.stadiaref.getDepth())).toBe('off');
  });
});

test.describe('2.x methods', () => {
  test('setState / getState and setLabels / getLabels are one setting', async ({ page }) => {
    await N.open(page, N.harness({ page: { startHidden: false } }));
    const pairs = [];
    for (const n of [0, 1, 2]) {
      await page.evaluate((v) => window.seguruDebugToolbar.setState(v), n);
      pairs.push(await page.evaluate(() => [window.stadiaref.getLabels(), window.seguruDebugToolbar.getState()]));
    }
    expect(pairs).toEqual([['icons', 0], ['off', 1], ['full', 2]]);
    await page.evaluate(() => window.stadiaref.setLabels('icons'));
    expect(await page.evaluate(() => window.seguruDebugToolbar.getState())).toBe(0);
    expect(await countVisible(page, '.stadiaref-ref-icon')).toBe(2);
  });

  test('setDepth / getDepth: every 2.x value', async ({ page }) => {
    await O.recordEvents(page);
    await O.open(page, O.harness({ page: { startHidden: false } }));
    // What 2.5.0 stamps on the basic body: one unaddressed <section>, no
    // block-level candidates, seven headings, paragraphs and links.
    const want = {
      section: ['section:section'],
      block: [],
      element: ['h1:element', 'p:element', 'h2:element', 'p:element', 'h2:element', 'p:element', 'a:element'],
      all: ['h1:element', 'p:element', 'h2:element', 'p:element', 'section:section', 'h2:element', 'p:element', 'a:element'],
      off: [],
    };
    for (const v of ['section', 'block', 'element', 'all', 'off']) {
      await page.evaluate((d) => window.seguruDebugToolbar.setDepth(d), v);
      expect(await page.evaluate(() => window.seguruDebugToolbar.getDepth())).toBe(v);
      const stamped = await page.evaluate(() => Array.from(document.querySelectorAll('[data-stadiaref-auto]')).map((e) => e.tagName.toLowerCase() + ':' + e.getAttribute('data-stadiaref-auto-tier')));
      expect(stamped, v).toEqual(want[v]);
      // authored addresses keep their labels whatever the depth
      expect(await page.evaluate(() => ['home-hero', 'home-features'].map((r) => !!document.querySelector('[data-ref="' + r + '"] > .stadiaref-ref-full-label')))).toEqual([true, true]);
    }
    expect((await O.events(page, 'depth-change')).map((e) => e.detail.depth)).toEqual(['section', 'block', 'element', 'all', 'off']);
  });

  test('setLevelFilter / getLevelFilter: every 2.x value', async ({ page }) => {
    await O.recordEvents(page);
    await O.open(page, '/test/fixtures/v5-data-ref/block-bearing-small.html');
    await page.evaluate(() => window.seguruDebugToolbar.show());
    const counts = {};
    for (const v of ['section', 'section-block', 'all']) {
      await page.evaluate((x) => window.seguruDebugToolbar.setLevelFilter(x), v);
      expect(await page.evaluate(() => window.seguruDebugToolbar.getLevelFilter())).toBe(v);
      counts[v] = await countVisible(page, '.stadiaref-ref-full-label');
    }
    // 1 section, 3 blocks, 7 elements in the fixture. (2.5.0 showed 5 for
    // Sec+Blk: an <img> label in a void host escaped its filter.)
    expect(counts).toEqual({ section: 1, 'section-block': 4, all: 11 });
    expect((await O.events(page, 'level-filter-change')).map((e) => e.detail.levelFilter)).toEqual(['section', 'section-block', 'all']);
  });

  test('classifyDataRef uses the Titan grammar', async ({ page }) => {
    await N.open(page, N.harness());
    expect(await page.evaluate(() => ['home-hero', 'home-hero-card-01', 'home-hero-heading-01-01-main', 'hero-card-01'].map(window.seguruDebugToolbar.classifyDataRef)))
      .toEqual(['section', 'block', 'element', 'unclassified']);
  });

  test('setHotkey / getHotkey rebind the toggle key', async ({ page }) => {
    await N.open(page, N.harness());
    await page.evaluate(() => window.seguruDebugToolbar.setHotkey('k'));
    expect(await page.evaluate(() => window.seguruDebugToolbar.getHotkey())).toBe('K');
    await press(page, 'd');
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(false);
    await press(page, 'k');
    expect(await page.evaluate(() => window.stadiaref.isVisible())).toBe(true);
  });

  test('unchanged methods are the same functions on both globals', async ({ page }) => {
    await N.open(page, N.harness());
    const names = ['show', 'hide', 'toggle', 'isVisible', 'init', 'refresh', 'toggleTree', 'setOutline', 'getOutline', 'setTheme', 'getTheme', 'setDock', 'getDock', 'setUser', 'getUser'];
    expect(await page.evaluate((list) => list.filter((n) => typeof window.seguruDebugToolbar[n] !== 'function' || window.seguruDebugToolbar[n] !== window.stadiaref[n]), names)).toEqual([]);
  });

  test('2.x calls made before start are applied once started', async ({ page }) => {
    // The QA page boots visible and calls seguruDebugToolbar.hide() between
    // the script tag and DOMContentLoaded.
    await O.open(page, '/test/qa-preboot-hide.html');
    expect(await page.evaluate(() => window.seguruDebugToolbar.isVisible())).toBe(false);
  });
});

test.describe('2.x events', () => {
  test('sdt:* twins fire after their stadiaref:* events with the same detail', async ({ page }) => {
    await recordAll(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await N.open(page, N.harness());
    await page.evaluate(() => {
      const a = window.stadiaref;
      a.show(); a.setTheme('dark'); a.setOutline('section'); a.setUser({ name: 'Ann' }); a.hide();
    });
    const log = (await all(page)).filter((e) => !e.type.includes('labels-change'));
    const pairs = [];
    for (let i = 0; i < log.length; i += 2) pairs.push([log[i].type, log[i + 1].type, JSON.stringify(log[i].detail) === JSON.stringify(log[i + 1].detail)]);
    expect(pairs).toEqual([
      ['stadiaref:ready', 'sdt:ready', true],
      ['stadiaref:show', 'sdt:show', true],
      ['stadiaref:theme-change', 'sdt:theme-change', true],
      ['stadiaref:outline-change', 'sdt:outline-change', true],
      ['stadiaref:user-change', 'sdt:user-change', true],
      ['stadiaref:hide', 'sdt:hide', true],
    ]);
  });

  test('sdt:dataref-click / -hover / -leave keep their 2.x detail', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await recordAll(page);
    await N.open(page, N.harness({ page: { startHidden: false } }));
    const label = page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label');
    await label.hover();
    await page.mouse.move(5, 890);
    await label.click();
    await expect.poll(async () => (await all(page)).some((e) => e.type === 'sdt:dataref-click')).toBe(true);
    const log = await all(page);
    for (const kind of ['click', 'hover', 'leave']) {
      const oldEv = log.find((e) => e.type === 'sdt:dataref-' + kind);
      const newEv = log.find((e) => e.type === 'stadiaref:address-' + kind);
      expect(Object.keys(oldEv.detail).sort()).toEqual(['current', 'dataRef', 'element']);
      expect(oldEv.detail.dataRef).toBe('home-hero');
      expect(oldEv.detail.element.ref).toBe('home-hero');
      expect(oldEv.detail.current.cls).toContain('stadiaref-ref-full-label');
      expect(newEv.detail.address).toBe('home-hero');
      expect(log.indexOf(newEv)).toBeLessThan(log.indexOf(oldEv));
    }
  });

  test('sdt:depth-change and sdt:level-filter-change', async ({ page }) => {
    await recordAll(page);
    await N.open(page, N.harness());
    await page.evaluate(() => { window.stadiaref.setDepth('block'); window.stadiaref.setLevelFilter('section'); });
    const log = await all(page);
    expect(log.filter((e) => e.type === 'sdt:depth-change').map((e) => e.detail)).toEqual([{ depth: 'block' }]);
    expect(log.filter((e) => e.type === 'sdt:level-filter-change').map((e) => e.detail)).toEqual([{ levelFilter: 'section' }]);
  });
});

test.describe('2.x keys', () => {
  test('T and F are not bound', async ({ page }) => {
    await N.open(page, N.harness());
    await press(page, 't');
    await press(page, 'f');
    expect(await page.evaluate(() => [window.stadiaref.getDepth(), window.stadiaref.getLevelFilter(), window.stadiaref.getTiers().length])).toEqual(['off', 'all', 3]);
  });
});

test.describe('names with no alias', () => {
  test('no sdt- classes or data-sdt- attributes are written', async ({ page }) => {
    await N.open(page, '/test/demo.html?cc=1&ar=1');
    await page.evaluate(() => { window.stadiaref.show(); window.stadiaref.setOutline('block'); window.stadiaref.toggleTree(); });
    const found = await page.evaluate(() => {
      const roots = [document, document.getElementById('stadiaref-host').shadowRoot];
      const hits = [];
      roots.forEach((r) => r.querySelectorAll('*').forEach((el) => {
        el.classList.forEach((c) => { if (c.startsWith('sdt-')) hits.push(c); });
        Array.from(el.attributes).forEach((a) => { if (a.name.startsWith('data-sdt-')) hits.push(a.name); });
      }));
      return hits;
    });
    expect(found).toEqual([]);
    expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto][data-stadiaref-auto-tier]').length)).toBeGreaterThan(0);
  });
});

test('a page that uses only 2.x names works, with one console notice', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const notices = consoleNotices(page);
  await page.goto(O.harness({
    page: { startHidden: false, defaultMode: 2 },
    pre: "window.__clicks=[];window.addEventListener('sdt:dataref-click',function(e){window.__clicks.push(e.detail.dataRef);});" +
      "window.addEventListener('sdt:ready',function(){window.seguruDebugToolbar.setDepth('section');});",
  }));
  await page.waitForFunction(() => window.seguruDebugToolbar && window.seguruDebugToolbar.getDepth() === 'section');
  await page.locator('[data-ref="home-hero"] > .stadiaref-ref-full-label').click();
  await expect.poll(() => page.evaluate(() => window.__clicks)).toEqual(['home-hero']);
  expect(await page.evaluate(() => document.querySelectorAll('[data-stadiaref-auto-tier="section"]').length)).toBe(1);
  await expect(shadow(page, '.stadiaref-toolbar')).toBeVisible();
  expect(notices).toHaveLength(1);
});
