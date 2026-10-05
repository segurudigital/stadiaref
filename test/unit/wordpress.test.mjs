// The WordPress plugin, the mu-plugin and the 2.5.1 bridge: settings copied
// over from 2.x, the config handed to the script, no second copy next to
// the old plugin, the zips. The PHP runs against a small stand-in for
// WordPress (test/unit/wp/harness.php). Skipped when PHP isn't installed.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '../..');
const HARNESS = path.join(ROOT, 'test/unit/wp/harness.php');
const hasPhp = spawnSync('php', ['-v']).status === 0;
const skip = hasPhp ? false : 'php not installed';
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// Copies of the plugins with a script file beside them, as when installed.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'stadiaref-wp-'));
const PLUGIN = path.join(TMP, 'stadiaref/stadiaref.php');
const MU = path.join(TMP, 'mu/stadiaref.php');
const BRIDGE = path.join(TMP, 'seguru-debug-toolbar/seguru-debug-toolbar.php');
before(() => {
  fs.mkdirSync(path.join(TMP, 'stadiaref/assets'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'wordpress/stadiaref/stadiaref.php'), PLUGIN);
  fs.writeFileSync(path.join(TMP, 'stadiaref/assets/stadiaref.min.js'), '/* overlay */');
  fs.mkdirSync(path.join(TMP, 'mu/stadiaref'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'wordpress/stadiaref.php'), MU);
  fs.writeFileSync(path.join(TMP, 'mu/stadiaref/stadiaref.min.js'), '/* overlay */');
  fs.mkdirSync(path.join(TMP, 'seguru-debug-toolbar/assets'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'wordpress/bridge/seguru-debug-toolbar.php'), BRIDGE);
  fs.copyFileSync(path.join(ROOT, 'wordpress/bridge/assets/seguru-debug-toolbar.min.js'), path.join(TMP, 'seguru-debug-toolbar/assets/seguru-debug-toolbar.min.js'));
});

function wp(file, scenario) {
  const out = execFileSync('php', [HARNESS, file, JSON.stringify(scenario)], { encoding: 'utf8' });
  return JSON.parse(out);
}

const OLD = {
  sdt_enabled: '1', sdt_default_mode: '0', sdt_start_hidden: '0', sdt_position: 'top-left',
  sdt_min_role: 'editor', sdt_class_converter: '1', sdt_auto_ref: '1',
};
const COPIED = {
  stadiaref_enabled: '1', stadiaref_labels: 'icons', stadiaref_start_hidden: '0', stadiaref_dock: 'top-left',
  stadiaref_min_role: 'editor', stadiaref_class_converter: '1', stadiaref_auto_address: '1',
};
const pick = (o, prefix) => Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith(prefix) && k !== 'stadiaref_migrated_2x'));

// Runs the inline config script in a fresh window and returns stadiarefConfig.
function handOver(js, page = {}) {
  const window = { ...page };
  vm.runInNewContext(js, { window, Object });
  return JSON.parse(JSON.stringify(window.stadiarefConfig));
}

for (const [name, file] of [['plugin', () => PLUGIN], ['mu-plugin', () => MU]]) {
  describe(name + ': settings from 2.x', { skip }, () => {
    test('each option is copied once on admin_init, mapped; the 2.x options stay', () => {
      const r = wp(file(), { options: OLD, run: ['admin_init'] });
      assert.deepEqual(pick(r.options, 'stadiaref_'), COPIED);
      assert.deepEqual(pick(r.options, 'sdt_'), OLD);
      assert.ok(r.options.stadiaref_migrated_2x);
    });

    test('labels 2 → full, 1 → off; a value 2.x never had is left at the default', () => {
      assert.equal(wp(file(), { options: { sdt_default_mode: '2' }, run: ['admin_init'] }).options.stadiaref_labels, 'full');
      assert.equal(wp(file(), { options: { sdt_default_mode: '1' }, run: ['admin_init'] }).options.stadiaref_labels, 'off');
      assert.equal(wp(file(), { options: { sdt_default_mode: '7', sdt_position: 'middle' }, run: ['admin_init'] }).options.stadiaref_labels, undefined);
    });

    test('runs once: the flag stops a second copy, and a 3.0 value is never overwritten', () => {
      const flagged = wp(file(), { options: { ...OLD, stadiaref_migrated_2x: '3.0.0' }, run: ['admin_init'] });
      assert.deepEqual(pick(flagged.options, 'stadiaref_'), {});
      const kept = wp(file(), { options: { ...OLD, stadiaref_labels: 'off' }, run: ['admin_init'] });
      assert.equal(kept.options.stadiaref_labels, 'off');
    });
  });
}

describe('plugin', { skip }, () => {
  test('activation copies the settings too', () => {
    assert.deepEqual(pick(wp(PLUGIN, { options: OLD, run: ['activate'] }).options, 'stadiaref_'), COPIED);
  });

  test('enqueues the script in the footer with the settings as real booleans, never wp_localize_script', () => {
    const r = wp(PLUGIN, { options: { stadiaref_enabled: '1', stadiaref_auto_address: '1', stadiaref_profile: 'titan' }, caps: ['manage_options'], run: ['wp_enqueue_scripts'] });
    assert.deepEqual(Object.keys(r.scripts), ['stadiaref']);
    assert.equal(r.scripts.stadiaref.footer, true);
    assert.match(r.scripts.stadiaref.src, /assets\/stadiaref\.min\.js$/);
    assert.equal(r.inline.length, 1);
    assert.equal(r.inline[0].position, 'before');
    assert.ok(!r.inline.some((i) => i.localize));
    assert.deepEqual(handOver(r.inline[0].js), {
      labels: 'full', startHidden: true, dock: 'bottom-right', classConverter: false, autoAddress: true, profile: 'titan',
    });
  });

  test('the page wins: window.stadiarefConfig, and the 2.x window.seguruDebugConfig', () => {
    const r = wp(PLUGIN, { options: { stadiaref_enabled: '1' }, caps: ['manage_options'], run: ['wp_enqueue_scripts'] });
    const js = r.inline[0].js;
    const page = handOver(js, { stadiarefConfig: { labels: 'off', keys: { toggle: 'V' } } });
    assert.equal(page.labels, 'off');
    assert.deepEqual(page.keys, { toggle: 'V' });
    assert.equal(page.dock, 'bottom-right');
    // 2.x page config outranked the WordPress settings: its keys are left to it.
    const legacy = handOver(js, { seguruDebugConfig: { defaultMode: 0, position: 'top-left', autoRef: true } });
    assert.equal('labels' in legacy, false);
    assert.equal('dock' in legacy, false);
    assert.equal('autoAddress' in legacy, false);
    assert.equal(legacy.profile, 'generic');
  });

  test('not for visitors or lower roles, not when switched off', () => {
    assert.deepEqual(wp(PLUGIN, { options: { stadiaref_enabled: '1' }, caps: [], run: ['wp_enqueue_scripts'] }).scripts, {});
    assert.deepEqual(wp(PLUGIN, { options: { stadiaref_enabled: '1', stadiaref_min_role: 'editor' }, caps: ['publish_posts'], run: ['wp_enqueue_scripts'] }).scripts, {});
    assert.deepEqual(Object.keys(wp(PLUGIN, { options: { stadiaref_enabled: '1', stadiaref_min_role: 'editor' }, caps: ['edit_others_posts'], run: ['wp_enqueue_scripts'] }).scripts), ['stadiaref']);
    assert.deepEqual(wp(PLUGIN, { options: {}, caps: ['manage_options'], run: ['wp_enqueue_scripts'] }).scripts, {});
  });

  test('with Seguru Debug Toolbar still active: a notice, and no second copy on the front end', () => {
    const on = { options: { stadiaref_enabled: '1' }, caps: ['manage_options', 'activate_plugins'] };
    const old = wp(PLUGIN, { ...on, defines: { SDT_VERSION: '2.5.0' }, run: ['wp_enqueue_scripts', 'admin_notices'] });
    assert.deepEqual(old.scripts, {});
    assert.match(old.notices, /Seguru Debug Toolbar is still active/);
    const mu = wp(PLUGIN, { ...on, enqueued: ['seguru-debug-toolbar'], run: ['wp_enqueue_scripts'] });
    assert.deepEqual(mu.scripts, {});
    assert.doesNotMatch(wp(PLUGIN, { ...on, run: ['admin_notices'] }).notices, /still active/);
  });
});

describe('mu-plugin', { skip }, () => {
  test('enqueues with the same handover, and stays out of the way of the plugin and of 2.x', () => {
    const on = { options: { stadiaref_enabled: '1' }, caps: ['manage_options'] };
    const r = wp(MU, { ...on, run: ['wp_enqueue_scripts'] });
    assert.deepEqual(Object.keys(r.scripts), ['stadiaref']);
    assert.equal(handOver(r.inline[0].js).startHidden, true);
    assert.deepEqual(wp(MU, { ...on, enqueued: ['stadiaref'], run: ['wp_enqueue_scripts'] }).scripts, {});
    assert.deepEqual(wp(MU, { ...on, defines: { SDT_VERSION: '2.5.0' }, run: ['wp_enqueue_scripts'] }).scripts, {});
  });
});

describe('bridge (2.5.1)', { skip }, () => {
  test('one notice that points to StadiaRef; gone once dismissed', () => {
    const r = wp(BRIDGE, { caps: ['activate_plugins'], run: ['admin_notices'] });
    assert.match(r.notices, /Seguru Debug Toolbar is now StadiaRef/);
    assert.match(r.notices, /github\.com\/segurudigital\/stadiaref\/releases\/latest/);
    assert.equal(wp(BRIDGE, { caps: ['activate_plugins'], options: { user_meta_sdt_dismissed_stadiaref: '1' }, run: ['admin_notices'] }).notices.includes('now StadiaRef'), false);
  });

  test('still loads the 2.5.0 script with its sdt_* settings, as 2.5.0 did', () => {
    const r = wp(BRIDGE, { options: { sdt_enabled: '1' }, caps: ['manage_options'], run: ['wp_enqueue_scripts'] });
    assert.match(r.scripts['seguru-debug-toolbar'].src, /assets\/seguru-debug-toolbar\.min\.js$/);
    assert.equal(r.inline[0].localize, 'sdtConfig');
  });
});

describe('files', () => {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

  test('the plugin: header, tagline, version and names', () => {
    const src = read('wordpress/stadiaref/stadiaref.php');
    assert.match(src, /Plugin Name:\s+StadiaRef\n/);
    assert.match(src, /Description:\s+An address for every part of the screen\./);
    assert.match(src, /Text Domain:\s+stadiaref/);
    assert.match(src, new RegExp('Version:\\s+' + pkg.version.replace(/\./g, '\\.') + '\\n'));
    assert.ok(src.includes("define( 'STADIAREF_VERSION', '" + pkg.version + "' );"));
    assert.match(read('wordpress/stadiaref.php'), new RegExp('Version:\\s+' + pkg.version.replace(/\./g, '\\.') + '\\n'));
    assert.ok(src.includes("'stadiaref_github_release'"));
    assert.ok(src.includes("'segurudigital/stadiaref'"));
    assert.ok(src.includes('/^stadiaref-wp-v[\\d.]+\\.zip$/'));
    for (const f of ['wordpress/stadiaref/stadiaref.php', 'wordpress/stadiaref.php']) {
      assert.doesNotMatch(read(f), /wp_localize_script\(\s*[\w'"$]/, f + ' calls wp_localize_script');
    }
  });

  test('the bridge: 2.5.1, no updater, the frozen 2.5.0 script', () => {
    const src = read('wordpress/bridge/seguru-debug-toolbar.php');
    assert.match(src, /Version:\s+2\.5\.1\n/);
    assert.ok(src.includes("define( 'SDT_VERSION', '2.5.1' );"));
    for (const gone of ['pre_set_site_transient_update_plugins', 'plugins_api', 'api.github.com', 'upgrader_process_complete']) assert.ok(!src.includes(gone), gone);
    const sha = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'wordpress/bridge/assets/seguru-debug-toolbar.min.js'))).digest('hex');
    assert.equal(sha.slice(0, 8), '181afb14', 'the 2.5.0 release script, byte for byte');
  });

  test('both zips build and unpack to the right folders; the bridge name matches the 2.x updater', () => {
    execFileSync('bash', [path.join(ROOT, 'scripts/build-wp-zip.sh')], { cwd: ROOT, stdio: 'ignore' });
    execFileSync('bash', [path.join(ROOT, 'scripts/build-wp-bridge.sh')], { cwd: ROOT, stdio: 'ignore' });
    const list = (zip) => execFileSync('unzip', ['-Z1', path.join(ROOT, 'dist', zip)], { encoding: 'utf8' }).trim().split('\n').sort();
    assert.deepEqual(list('stadiaref-wp-v' + pkg.version + '.zip'), [
      'stadiaref/', 'stadiaref/LICENSE', 'stadiaref/assets/', 'stadiaref/assets/icon.svg', 'stadiaref/assets/stadiaref.min.js', 'stadiaref/readme.txt', 'stadiaref/stadiaref.php',
    ]);
    const bridge = 'seguru-debug-toolbar-wp-v2.5.1.zip';
    assert.match(bridge, /^seguru-debug-toolbar-wp-v[\d.]+\.zip$/);
    assert.deepEqual(list(bridge), [
      'seguru-debug-toolbar/', 'seguru-debug-toolbar/LICENSE', 'seguru-debug-toolbar/assets/', 'seguru-debug-toolbar/assets/seguru-debug-toolbar.min.js', 'seguru-debug-toolbar/readme.txt', 'seguru-debug-toolbar/seguru-debug-toolbar.php',
    ]);
    const readme = execFileSync('unzip', ['-p', path.join(ROOT, 'dist', bridge), 'seguru-debug-toolbar/readme.txt'], { encoding: 'utf8' });
    assert.match(readme, /Stable tag: 2\.5\.1/);
  });
});
