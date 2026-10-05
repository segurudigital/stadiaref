// Integration checks for the package as published (stage 8). Run with
// `npm run test:integration`. Needs the network the first time, to install
// Vite, Astro and TypeScript into the projects under test/integration/.
//
//   1. npm pack the repo into test/integration/.pack/stadiaref.tgz
//   2. Node: import('stadiaref') resolves and does nothing; core works
//   3. vite, astro-7: install; the dev server serves a page with
//      StadiaRef running, the setup module's profile in use; a production
//      build contains no data-stadiaref-root
//   4. types: check.ts type-checks under strict with moduleResolution
//      bundler and node16; the declarations check with skipLibCheck off
//
// Each check prints ok or not ok; the exit code is the number of failures.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const PACK = path.join(HERE, '.pack');
const only = process.argv.slice(2);
let failures = 0;

function log(ok, name, detail) {
  if (!ok) failures++;
  console.log((ok ? 'ok     ' : 'not ok ') + name + (detail ? '\n       ' + String(detail).split('\n').join('\n       ') : ''));
}

async function check(name, fn) {
  try {
    await fn();
    log(true, name);
  } catch (err) {
    log(false, name, err && err.stack ? err.stack : err);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function run(cmd, args, cwd, env) {
  return execFileSync(cmd, args, { cwd, env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function pack() {
  fs.rmSync(PACK, { recursive: true, force: true });
  fs.mkdirSync(PACK);
  const out = run('npm', ['pack', '--pack-destination', PACK, '--json'], ROOT);
  const file = JSON.parse(out)[0].filename;
  fs.renameSync(path.join(PACK, path.basename(file)), path.join(PACK, 'stadiaref.tgz'));
}

function install(project) {
  const dir = path.join(HERE, project);
  // The setup module sits inside each project, as it would in a real one,
  // so its own imports resolve to that project's copy of stadiaref.
  fs.copyFileSync(path.join(HERE, 'shared/stadiaref.setup.js'), path.join(dir, 'stadiaref.setup.js'));
  // The tarball changes on every run; make npm take the new one.
  fs.rmSync(path.join(dir, 'node_modules', 'stadiaref'), { recursive: true, force: true });
  run('npm', ['install', '--no-package-lock', '--no-audit', '--no-fund'], dir);
  return dir;
}

function filesUnder(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(p));
    else out.push(p);
  }
  return out;
}

function startServer(cmd, args, cwd, port, env) {
  // Its own process group, so stop() reaches the server under npx too.
  const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const url = 'http://localhost:' + port + '/';
  const ready = (async () => {
    for (let i = 0; i < 120; i++) {
      if (child.exitCode !== null) throw new Error('dev server exited:\n' + output);
      try {
        const res = await fetch(url);
        if (res.ok) return;
      } catch { /* not up yet */ }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error('dev server did not start:\n' + output);
  })();
  return { child, url, port, ready, output: () => output };
}

function listeners(port) {
  try {
    return execFileSync('lsof', ['-ti', 'tcp:' + port, '-sTCP:LISTEN'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map(Number);
  } catch { return []; }
}

async function stop(server) {
  if (!server || server.child.exitCode !== null) return;
  const exited = new Promise((resolve) => server.child.once('exit', resolve));
  try { process.kill(-server.child.pid, 'SIGTERM'); } catch { /* already gone */ }
  await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))]);
  // Some CLIs re-spawn the server in a process group of its own; stop
  // whatever still listens on the port, by force if it won't go.
  for (const signal of ['SIGTERM', 'SIGTERM', 'SIGKILL']) {
    const pids = listeners(server.port);
    if (!pids.length) break;
    for (const pid of pids) { try { process.kill(pid, signal); } catch { /* gone */ } }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// What every dev page must show: StadiaRef running, the setup module run
// before init(), its profile in use, labels drawn with its tiers.
async function checkDevPage(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.stadiaref && window.__setupRan, null, { timeout: 15000 });
  await page.evaluate(() => window.stadiaref.ready);
  await page.waitForFunction(() => document.querySelectorAll('.stadiaref-ref-full-label').length === 3, null, { timeout: 15000 });
  const state = await page.evaluate(() => ({
    root: !!document.querySelector('[data-stadiaref-root]'),
    profile: window.stadiaref.getProfile(),
    setupSawDefault: window.__setupRan.profileBefore,
    coreSees: window.__setupRan.coreSees,
    classify: window.stadiaref.classify('zeta-s01-b01'),
    tiers: Array.from(document.querySelectorAll('.stadiaref-ref-full-label')).map((l) => l.parentElement.getAttribute('data-ref') + ':' + (l.className.match(/stadiaref-tier-(\w+)/) || [])[1]).sort(),
  }));
  assert(state.root, 'no data-stadiaref-root on the dev page');
  assert(state.profile === 'zeta', 'profile is ' + state.profile + ', expected zeta');
  assert(state.setupSawDefault === 'generic', 'setup ran after init(): it saw profile ' + state.setupSawDefault);
  assert(state.coreSees === true, 'stadiaref/core does not see the profile registered through the overlay');
  assert(state.classify === 'block', 'classify gave ' + state.classify);
  assert(state.tiers.join() === 'zeta-s01-b01-title:element,zeta-s01-b01:block,zeta-s01:section', 'label tiers ' + state.tiers.join());
}

function checkBuild(dir, outDir) {
  const files = filesUnder(path.join(dir, outDir));
  assert(files.length > 0, 'the build produced no files');
  const hits = files.filter((f) => fs.readFileSync(f, 'utf8').includes('data-stadiaref-root'));
  assert(hits.length === 0, 'data-stadiaref-root in ' + hits.map((f) => path.relative(dir, f)).join(', '));
}

const want = (name) => !only.length || only.includes(name);

console.log('Packing stadiaref…');
execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore' });
pack();

await check('node: import("stadiaref") resolves and does nothing', async () => {
  const dir = install('vite');
  const out = run('node', ['--input-type=module', '-e',
    "const m = await import('stadiaref'); const core = await import('stadiaref/core');" +
    "console.log(JSON.stringify({ def: m.default === undefined, keys: Object.keys(m), win: typeof globalThis.window, cls: core.classify('home-hero-card-01', { profile: 'titan' }) }));"], dir);
  const r = JSON.parse(out.trim().split('\n').pop());
  assert(r.def && r.keys.join() === 'default' && r.win === 'undefined', 'unexpected: ' + out);
  assert(r.cls === 'block', 'core classify gave ' + r.cls);
});

const browser = await chromium.launch();

if (want('vite')) {
  const dir = install('vite');
  const server = startServer('npx', ['vite', '--port', '5391', '--strictPort'], dir, 5391);
  await check('vite: the dev server serves a page with StadiaRef, setup profile in use', async () => {
    await server.ready;
    const page = await browser.newPage();
    try { await checkDevPage(page, server.url); } finally { await page.close(); }
  });
  await stop(server);
  await check('vite: a production build has no data-stadiaref-root', async () => {
    run('npx', ['vite', 'build'], dir);
    checkBuild(dir, 'dist');
  });
}

for (const project of ['astro-7']) {
  if (!want(project)) continue;
  const dir = install(project);
  const version = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules/astro/package.json'), 'utf8')).version;
  const port = 5394;
  // Astro 7 runs `astro dev` in the background when it thinks an agent
  // started it; --ignore-lock keeps it in the foreground, where stop() can
  // reach it.
  const devArgs = (p) => ['astro', 'dev', '--port', String(p), '--ignore-lock'];
  let server = startServer('npx', devArgs(port), dir, port, { ASTRO_TELEMETRY_DISABLED: '1' });
  await check(project + ' (astro ' + version + '): dev page with StadiaRef, setup profile in use, controls in the Dev Toolbar', async () => {
    await server.ready;
    const page = await browser.newPage();
    try {
      await checkDevPage(page, server.url);
      // The floating toolbar gives way to the Dev Toolbar app.
      await page.waitForFunction(() => {
        const bar = document.getElementById('stadiaref-host').shadowRoot.querySelector('.stadiaref-toolbar');
        return document.querySelector('astro-dev-toolbar') && getComputedStyle(bar).display === 'none';
      }, null, { timeout: 15000 });
      // Open the app from Astro's bar; the panel drives StadiaRef.
      await page.locator('astro-dev-toolbar').locator('button.item[data-app-id="stadiaref"]').click();
      const panel = page.locator('astro-dev-toolbar-app-canvas[data-app-id="stadiaref"]').locator('.stadiaref-panel');
      await panel.waitFor({ state: 'visible', timeout: 15000 });
      const count = await panel.locator('.stadiaref-panel__count').textContent();
      assert(count === '3 addresses', 'count reads ' + count);
      await panel.getByRole('button', { name: 'Icons' }).click();
      assert(await page.evaluate(() => window.stadiaref.getLabels()) === 'icons', 'the Labels control did not set icons');
      assert(await panel.getByRole('button', { name: 'Icons' }).getAttribute('aria-pressed') === 'true', 'Icons not pressed');
      await panel.getByRole('button', { name: 'Elements' }).click();
      assert((await page.evaluate(() => window.stadiaref.getTiers())).join() === 'section,block', 'the Show control did not hide elements');
      // Keys still work in the Astro host.
      await page.locator('body').press('l');
      assert(await page.evaluate(() => window.stadiaref.getLabels()) === 'full', 'L did not cycle labels (icons to full)');
    } finally { await page.close(); }
  });
  await stop(server);

  server = startServer('npx', devArgs(port + 1), dir, port + 1, { ASTRO_TELEMETRY_DISABLED: '1', STADIAREF_NO_DEV_TOOLBAR: '1' });
  await check(project + ': with the Dev Toolbar off, the floating toolbar is drawn', async () => {
    await server.ready;
    const page = await browser.newPage();
    try {
      await checkDevPage(page, server.url);
      const display = await page.evaluate(() => getComputedStyle(document.getElementById('stadiaref-host').shadowRoot.querySelector('.stadiaref-toolbar')).display);
      assert(!(await page.evaluate(() => !!document.querySelector('astro-dev-toolbar'))), 'the Dev Toolbar is still there. Server output:\n' + server.output());
      assert(display !== 'none', 'floating toolbar hidden');
    } finally { await page.close(); }
  });
  await stop(server);

  await check(project + ': a production build has no data-stadiaref-root', async () => {
    run('npx', ['astro', 'build'], dir, { ASTRO_TELEMETRY_DISABLED: '1' });
    checkBuild(dir, 'dist');
  });
}

await browser.close();

if (want('types')) {
  const dir = install('types');
  // check.ts against the real Vite and Astro types, with skipLibCheck on as
  // their own recommended configs have it; then StadiaRef's declarations
  // on their own with skipLibCheck off, against stand-ins for Vite and Astro.
  for (const config of ['tsconfig.bundler.json', 'tsconfig.node16.json', 'tsconfig.declarations.json']) {
    await check('types: ' + (config.includes('declarations') ? 'the declarations, skipLibCheck off' : 'check.ts under strict, ' + config.replace('tsconfig.', '').replace('.json', '')), async () => {
      try {
        run('npx', ['tsc', '-p', config], dir);
      } catch (err) {
        throw new Error((err.stdout || '') + (err.stderr || ''));
      }
    });
  }
}

console.log(failures ? failures + ' failed' : 'all passed');
process.exit(failures);
