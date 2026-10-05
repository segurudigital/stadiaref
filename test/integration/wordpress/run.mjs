// The WordPress plugin on a real WordPress (WordPress Playground: WordPress
// and PHP in Node, nothing installed on the machine). Run with
// `npm run test:wordpress`; it needs the network the first time.
//
// Everything goes through wp-admin in a browser, as a site owner would:
//   1. install Seguru Debug Toolbar 2.5.0 from its release zip, configure it
//   2. upload the 2.5.1 bridge over it: the toolbar keeps working, the
//      "now StadiaRef" notice shows
//   3. install StadiaRef: the settings carry over, a notice asks for the old
//      plugin to be deactivated, and only one copy loads on the front end
//   4. deactivate the old plugin: StadiaRef loads for an admin, with the
//      settings; not for a visitor; a page's own stadiarefConfig wins
//   5. change a setting on Settings → StadiaRef and see it on the front end
//
// WP_VERSION and PHP_VERSION choose the versions (default: the latest
// WordPress on PHP 8.3).
//
// Prints ok / not ok per check; the exit code is the number of failures.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../../..');
const PORT = 9488;
const BASE = 'http://127.0.0.1:' + PORT;
const PAGE = BASE + '/?pagename=stadiaref-test';
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const ZIPS = {
  old: path.join(ROOT, 'dist/seguru-debug-toolbar-wp-v2.5.0.zip'),
  bridge: path.join(ROOT, 'dist/seguru-debug-toolbar-wp-v2.5.1.zip'),
  stadiaref: path.join(ROOT, 'dist/stadiaref-wp-v' + pkg.version + '.zip'),
};
let failures = 0;
let stop = false;

async function check(name, fn) {
  if (stop) { console.log('skip   ' + name); return; }
  try {
    await fn();
    console.log('ok     ' + name);
  } catch (err) {
    failures++;
    // Later steps build on earlier ones; stop at the first failure.
    stop = true;
    console.log('not ok ' + name + '\n       ' + String(err && err.stack || err).split('\n').slice(0, 6).join('\n       '));
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function startWordPress() {
  const bin = path.join(HERE, 'node_modules/.bin/wp-playground-cli');
  // WP_VERSION picks the WordPress version (default: the latest).
  const args = ['server', '--port', String(PORT), '--blueprint=./blueprint.json', '--blueprint-may-read-adjacent-files'];
  if (process.env.WP_VERSION) args.push('--wp=' + process.env.WP_VERSION);
  // PHP_VERSION picks PHP (default: Playground's, 8.3).
  if (process.env.PHP_VERSION) args.push('--php=' + process.env.PHP_VERSION);
  const child = spawn(bin, args, { cwd: HERE, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const ready = (async () => {
    for (let i = 0; i < 240; i++) {
      if (child.exitCode !== null) throw new Error('Playground exited:\n' + output);
      if (output.includes('Ready!')) return;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('Playground did not start:\n' + output);
  })();
  return { child, ready };
}

async function login(page) {
  // The first requests after a cold start can be slow (Playground warms up).
  try { await page.goto(BASE + '/wp-login.php'); } catch { await page.goto(BASE + '/wp-login.php'); }
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'password');
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/);
}

// Upload a plugin zip through Plugins → Add New → Upload. When the plugin is
// already installed, WordPress offers to replace it; accept.
async function upload(page, zip) {
  await page.goto(BASE + '/wp-admin/plugin-install.php?tab=upload');
  await page.setInputFiles('#pluginzip', zip);
  await page.click('#install-plugin-submit');
  await page.waitForLoadState('load');
  const replace = page.locator('a.update-from-upload-overwrite');
  if (await replace.count()) {
    await replace.click();
    await page.waitForLoadState('load');
  }
  const text = await page.locator('#wpbody-content').innerText();
  assert(/Plugin (installed|updated) successfully/i.test(text), 'upload of ' + path.basename(zip) + ' failed:\n' + text.slice(0, 600));
}

async function activate(page, slug) {
  await page.goto(BASE + '/wp-admin/plugins.php');
  const link = page.locator('tr[data-slug="' + slug + '"] .activate a');
  if (await link.count()) {
    await link.click();
    await page.waitForLoadState('load');
  }
  assert(await page.locator('tr[data-slug="' + slug + '"].active').count() === 1, slug + ' is not active');
}

async function deactivate(page, slug) {
  await page.goto(BASE + '/wp-admin/plugins.php');
  await page.locator('tr[data-slug="' + slug + '"] .deactivate a').click();
  await page.waitForLoadState('load');
  assert(await page.locator('tr[data-slug="' + slug + '"].inactive').count() === 1, slug + ' is still active');
}

// What is on the test page: which overlay scripts, and the state of each.
async function frontEnd(page, url = PAGE) {
  await page.goto(url);
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  return page.evaluate(() => ({
    scripts: Array.from(document.scripts).map((s) => s.src).filter((s) => /seguru-debug-toolbar|stadiaref/.test(s)).map((s) => s.split('/').slice(-3).join('/').split('?')[0]),
    legacy: !!window.seguruDebugToolbar && !window.stadiaref,
    stadiaref: window.stadiaref ? {
      labels: window.stadiaref.getLabels(),
      dock: window.stadiaref.getDock(),
      visible: window.stadiaref.isVisible(),
      profile: window.stadiaref.getProfile(),
      autoAddress: window.stadiaref.getAutoAddress(),
    } : null,
    hosts: document.querySelectorAll('[data-stadiaref-root]').length,
  }));
}

for (const [name, file] of Object.entries(ZIPS)) {
  if (!fs.existsSync(file)) {
    if (name === 'old') throw new Error('missing ' + file);
    execFileSync('npm', ['run', name === 'bridge' ? 'build:wp-bridge' : 'build:wp'], { cwd: ROOT, stdio: 'ignore' });
  }
}

const wpServer = startWordPress();
const browser = await chromium.launch();
const admin = await browser.newPage();
admin.setDefaultTimeout(60000);

try {
  await check('WordPress ' + (process.env.WP_VERSION || '(latest)') + ' on PHP ' + (process.env.PHP_VERSION || '8.3') + ' starts', () => wpServer.ready);

  await check('Seguru Debug Toolbar 2.5.0 installs, takes settings and runs', async () => {
    await login(admin);
    await upload(admin, ZIPS.old);
    await activate(admin, 'seguru-debug-toolbar');
    await admin.goto(BASE + '/wp-admin/options-general.php?page=seguru-debug-toolbar');
    await admin.check('input[name="sdt_enabled"]');
    await admin.check('input[name="sdt_default_mode"][value="0"]');
    await admin.uncheck('input[name="sdt_start_hidden"]');
    await admin.check('input[name="sdt_position"][value="top-left"]');
    await admin.click('#submit');
    await admin.waitForLoadState('load');
    const fe = await frontEnd(admin);
    assert(fe.scripts.join() === 'seguru-debug-toolbar/assets/seguru-debug-toolbar.min.js', 'scripts: ' + fe.scripts.join());
    assert(fe.legacy, '2.5.0 is not running');
  });

  await check('the 2.5.1 bridge installs over 2.5.0; the toolbar keeps working; the notice shows', async () => {
    await upload(admin, ZIPS.bridge);
    await admin.goto(BASE + '/wp-admin/plugins.php');
    const row = await admin.locator('tr[data-slug="seguru-debug-toolbar"]').innerText();
    assert(/Version 2\.5\.1/.test(row), 'plugin row: ' + row);
    assert(await admin.locator('tr[data-slug="seguru-debug-toolbar"].active').count() === 1, 'the bridge is not active');
    const notice = await admin.locator('.notice', { hasText: 'Seguru Debug Toolbar is now StadiaRef' }).count();
    assert(notice === 1, 'no "now StadiaRef" notice');
    const fe = await frontEnd(admin);
    assert(fe.legacy && fe.scripts.join() === 'seguru-debug-toolbar/assets/seguru-debug-toolbar.min.js', 'front end: ' + JSON.stringify(fe));
    // Dismiss it; it stays dismissed.
    await admin.goto(BASE + '/wp-admin/plugins.php');
    await admin.locator('.notice', { hasText: 'now StadiaRef' }).getByRole('link', { name: 'Dismiss' }).click();
    await admin.waitForLoadState('load');
    await admin.goto(BASE + '/wp-admin/plugins.php');
    assert(await admin.locator('.notice', { hasText: 'now StadiaRef' }).count() === 0, 'notice still there after Dismiss');
  });

  await check('StadiaRef installs next to it: settings carried over, a deactivate notice, one copy on the front end', async () => {
    await upload(admin, ZIPS.stadiaref);
    await activate(admin, 'stadiaref');
    assert(await admin.locator('.notice', { hasText: 'Seguru Debug Toolbar is still active' }).count() === 1, 'no deactivate notice');
    await admin.goto(BASE + '/wp-admin/options-general.php?page=stadiaref');
    assert(await admin.isChecked('input[name="stadiaref_enabled"]'), 'enabled not carried over');
    assert(await admin.isChecked('input[name="stadiaref_labels"][value="icons"]'), 'labels not carried over');
    assert(!(await admin.isChecked('input[name="stadiaref_start_hidden"]')), 'start hidden not carried over');
    assert(await admin.isChecked('input[name="stadiaref_dock"][value="top-left"]'), 'dock not carried over');
    assert(await admin.locator('select[name="stadiaref_profile"]').inputValue() === 'generic', 'profile not generic');
    const fe = await frontEnd(admin);
    assert(fe.scripts.length === 1 && fe.legacy && fe.hosts === 0, 'two copies or the wrong one: ' + JSON.stringify(fe));
  });

  await check('with the old plugin deactivated, StadiaRef loads for an admin with the carried-over settings', async () => {
    await deactivate(admin, 'seguru-debug-toolbar');
    const fe = await frontEnd(admin);
    assert(fe.scripts.join() === 'stadiaref/assets/stadiaref.min.js', 'scripts: ' + fe.scripts.join());
    const s = fe.stadiaref;
    assert(s && s.labels === 'icons' && s.dock === 'top-left' && s.visible === true && s.profile === 'generic' && s.autoAddress === false, 'state: ' + JSON.stringify(s));
    assert(fe.hosts === 1, 'hosts: ' + fe.hosts);
  });

  await check('not for a visitor', async () => {
    const visitor = await browser.newPage();
    try {
      const fe = await frontEnd(visitor);
      assert(fe.scripts.length === 0 && !fe.stadiaref, 'visitor got: ' + JSON.stringify(fe));
    } finally { await visitor.close(); }
  });

  await check("a page's own window.stadiarefConfig wins over the settings", async () => {
    const fe = await frontEnd(admin, PAGE + '&pagecfg=1');
    const s = fe.stadiaref;
    assert(s && s.labels === 'off' && s.dock === 'bottom-left' && s.visible === true, 'state: ' + JSON.stringify(s));
  });

  await check('Settings → StadiaRef saves, and the front end follows', async () => {
    await admin.goto(BASE + '/wp-admin/options-general.php?page=stadiaref');
    assert(await admin.locator('h1').innerText() === 'StadiaRef', 'page title');
    await admin.selectOption('select[name="stadiaref_profile"]', 'titan');
    await admin.check('input[name="stadiaref_auto_address"]');
    await admin.check('input[name="stadiaref_labels"][value="full"]');
    await admin.click('#submit');
    await admin.waitForLoadState('load');
    assert(await admin.locator('select[name="stadiaref_profile"]').inputValue() === 'titan', 'profile not saved');
    const s = (await frontEnd(admin)).stadiaref;
    assert(s && s.profile === 'titan' && s.autoAddress === true && s.labels === 'full', 'state: ' + JSON.stringify(s));
    const tiers = await admin.evaluate(() => window.stadiaref.classify('home-hero-card-01'));
    assert(tiers === 'block', 'titan classify gave ' + tiers);
  });
} finally {
  await browser.close();
  try { process.kill(-wpServer.child.pid, 'SIGTERM'); } catch { /* gone */ }
  // Make sure nothing is left listening.
  await new Promise((r) => setTimeout(r, 1000));
  try {
    for (const pid of execFileSync('lsof', ['-ti', 'tcp:' + PORT, '-sTCP:LISTEN'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)) process.kill(Number(pid), 'SIGKILL');
  } catch { /* nothing listening */ }
}

console.log(failures ? failures + ' failed' : 'all passed');
process.exit(failures);
