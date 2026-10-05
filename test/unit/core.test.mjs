// stadiaref/core: the core rules, the three built-in profiles, the registry,
// and a third-party profile registered through the public API.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validate, classify, parse, registerProfile, profiles } from '../../src/core/index.js';
import { classifyTitan } from '../../src/core/profiles/titan.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const fixtures = JSON.parse(fs.readFileSync(path.join(ROOT, 'test/fixtures/v5-data-ref/expected-2.5.0.json'), 'utf8'));
const fixtureNames = Object.keys(fixtures).filter((k) => !k.startsWith('_'));

describe('core rules', () => {
  test('valid addresses', () => {
    for (const a of ['home', 'home-hero', 'a1-b2-c3', 'x'.repeat(160), '0-1']) {
      assert.deepEqual(validate(a), { valid: true, problems: [] }, a);
    }
  });

  test('each rule reports a problem', () => {
    const cases = {
      'Home': ['uppercase letters'],
      'home_hero': ['underscore'],
      'home hero': ['spaces'],
      'home.hero': ['characters other than a-z, 0-9 and hyphens'],
      '-home': ['starts with a hyphen'],
      'home-': ['ends with a hyphen'],
      'home--hero': ['two hyphens in a row'],
      ['x'.repeat(161)]: ['longer than 160 characters'],
      '': ['empty'],
    };
    for (const [a, problems] of Object.entries(cases)) {
      assert.deepEqual(validate(a), { valid: false, problems }, JSON.stringify(a));
    }
    assert.deepEqual(validate(null), { valid: false, problems: ['not a string'] });
    assert.deepEqual(validate(42), { valid: false, problems: ['not a string'] });
  });

  test('several problems at once', () => {
    assert.deepEqual(validate('-Home_x--y-'), { valid: false, problems: ['uppercase letters', 'underscore', 'starts with a hyphen', 'ends with a hyphen', 'two hyphens in a row'] });
  });

  test('the docs example', () => {
    assert.deepEqual(validate('Home_Hero'), { valid: false, problems: ['uppercase letters', 'underscore'] });
  });

  test('every profile inherits them', () => {
    for (const profile of ['generic', 'app', 'titan']) {
      assert.equal(validate('ops-app-Jobs', { profile }).valid, false, profile);
      assert.equal(classify('ops-app-Jobs', { profile, context: { depth: 0, hasAddressedChildren: false } }), 'unclassified', profile);
    }
  });
});

describe('generic profile', () => {
  test('is the default', () => {
    assert.equal(classify('home-hero', { context: { depth: 0, hasAddressedChildren: false } }), 'section');
    assert.equal(parse('home-hero').profile, 'generic');
  });

  test('tier from nesting', () => {
    const c = (depth, hasAddressedChildren) => classify('home-anything', { context: { depth, hasAddressedChildren } });
    assert.equal(c(0, false), 'section');
    assert.equal(c(0, true), 'section');
    assert.equal(c(1, true), 'block');
    assert.equal(c(3, true), 'block');
    assert.equal(c(1, false), 'element');
    assert.equal(c(2, false), 'element');
  });

  test('no context: unclassified', () => {
    assert.equal(classify('home-hero'), 'unclassified');
    assert.equal(classify('home-hero', { profile: 'generic' }), 'unclassified');
    assert.equal(classify('home-hero', { context: {} }), 'unclassified');
  });

  test('any address that passes the core rules is valid', () => {
    assert.deepEqual(validate('anything-goes-123', { profile: 'generic' }), { valid: true, problems: [] });
  });

  test('parse', () => {
    assert.deepEqual(parse('home-plans-card-02'), { address: 'home-plans-card-02', profile: 'generic', parts: { segments: ['home', 'plans', 'card', '02'] } });
    assert.deepEqual(parse('Bad'), { address: 'Bad', profile: 'generic', parts: null });
  });
});

describe('app profile', () => {
  const ctx = { depth: 0, hasAddressedChildren: true };

  test('needs a product and a known surface', () => {
    for (const a of ['ops-app-jobs', 'ops-pwa', 'shop-mobile-cart', 'site-wp-admin-users', 'site-wp-frontend-home', 'shop-shopify-admin-orders', 'shop-shopify-storefront-pdp']) {
      assert.deepEqual(validate(a, { profile: 'app' }), { valid: true, problems: [] }, a);
    }
    for (const a of ['home-hero', 'app-jobs', 'ops-wp-jobs', 'ops-shopify-jobs', 'ops']) {
      const r = validate(a, { profile: 'app' });
      assert.equal(r.valid, false, a);
      assert.equal(r.problems.length, 1, a);
    }
  });

  test('tier from nesting for a valid address; unclassified otherwise', () => {
    assert.equal(classify('ops-app-jobs', { profile: 'app', context: ctx }), 'section');
    assert.equal(classify('ops-app-jobs-card-02', { profile: 'app', context: { depth: 1, hasAddressedChildren: true } }), 'block');
    assert.equal(classify('ops-app-jobs-card-02-status', { profile: 'app', context: { depth: 2, hasAddressedChildren: false } }), 'element');
    assert.equal(classify('home-hero', { profile: 'app', context: ctx }), 'unclassified');
    assert.equal(classify('ops-app-jobs', { profile: 'app' }), 'unclassified');
  });

  test('parse splits product, surface and the rest', () => {
    assert.deepEqual(parse('ops-app-jobs-card-02', { profile: 'app' }), {
      address: 'ops-app-jobs-card-02', profile: 'app', parts: { product: 'ops', surface: 'app', path: 'jobs-card-02' },
    });
    assert.deepEqual(parse('site-wp-admin-settings-users', { profile: 'app' }).parts, { product: 'site', surface: 'wp-admin', path: 'settings-users' });
    assert.deepEqual(parse('ops-pwa', { profile: 'app' }).parts, { product: 'ops', surface: 'pwa', path: '' });
    assert.equal(parse('home-hero', { profile: 'app' }).parts, null);
  });
});

describe('titan profile', () => {
  test('the v5 fixtures classify as in 2.5.0', () => {
    for (const name of fixtureNames) {
      for (const [address, tier] of fixtures[name]) {
        // bad--ref breaks the core rule against doubled hyphens, so it is
        // unclassified in every 3.0 profile. 2.5.0 called it a section.
        const want = address === 'bad--ref' ? 'unclassified' : tier;
        assert.equal(classify(address, { profile: 'titan' }), want, name + ': ' + address);
      }
    }
  });

  test('the raw Titan grammar is exactly the 2.x classifier, bad--ref included', () => {
    for (const name of fixtureNames) {
      for (const [address, tier] of fixtures[name]) assert.equal(classifyTitan(address), tier, address);
    }
  });

  test('the docs examples', () => {
    assert.equal(classify('home-hero', { profile: 'titan' }), 'section');
    assert.equal(classify('home-hero-card-01', { profile: 'titan' }), 'block');
    assert.equal(classify('home-hero-heading-01-01-primary', { profile: 'titan' }), 'element');
    assert.equal(classify('about-team-hero', { profile: 'titan' }), 'section');
  });

  test('needs no context; context is ignored', () => {
    assert.equal(classify('home-hero-card-01', { profile: 'titan', context: { depth: 0, hasAddressedChildren: false } }), 'block');
  });

  test('an address outside the grammar is unclassified, with a problem', () => {
    for (const a of ['home', 'home-01', 'hero-card-01', 'x-y-card-1', 'home-hero-heading-01-01-02']) {
      assert.equal(classify(a, { profile: 'titan' }), 'unclassified', a);
      assert.deepEqual(validate(a, { profile: 'titan' }), { valid: false, problems: ["doesn't match the Titan grammar"] }, a);
    }
  });

  test('parse', () => {
    assert.deepEqual(parse('home-hero-card-01', { profile: 'titan' }).parts, { tier: 'block', prefix: 'home-hero', blockType: 'card', number: '01' });
    assert.deepEqual(parse('mpt-v2-hero-heading-01-01-primary', { profile: 'titan' }).parts, { tier: 'element', prefix: 'mpt-v2-hero', element: 'heading', number: '01', instance: '01', role: 'primary' });
    assert.deepEqual(parse('home-hero', { profile: 'titan' }).parts, { tier: 'section', segments: ['home', 'hero'] });
    assert.equal(parse('home-01', { profile: 'titan' }).parts, null);
  });
});

describe('registry', () => {
  test('the built-in profiles are listed', () => {
    for (const n of ['generic', 'app', 'titan']) assert.ok(profiles.includes(n), n);
  });

  test('a taken name throws, so built-ins cannot be replaced', () => {
    for (const name of ['generic', 'app', 'titan']) {
      assert.throws(() => registerProfile({ name, classify: () => 'section' }), /already registered/);
    }
    registerProfile({ name: 'registry-once', classify: () => null });
    assert.throws(() => registerProfile({ name: 'registry-once', classify: () => null }), /already registered/);
  });

  test('a malformed profile throws', () => {
    assert.throws(() => registerProfile(null), TypeError);
    assert.throws(() => registerProfile({ classify: () => null }), TypeError);
    assert.throws(() => registerProfile({ name: '', classify: () => null }), TypeError);
    assert.throws(() => registerProfile({ name: 'no-classify' }), TypeError);
    assert.throws(() => registerProfile({ name: 'bad-validate', classify: () => null, validate: 'x' }), TypeError);
  });

  test('an unknown profile throws', () => {
    assert.throws(() => classify('home', { profile: 'nope' }), /unknown profile "nope"/);
    assert.throws(() => validate('home', { profile: 'nope' }), /unknown profile/);
  });

  test('a profile without validate or parse gets the core rules and segments', () => {
    registerProfile({ name: 'registry-minimal', classify: () => 'element' });
    assert.deepEqual(validate('a-b', { profile: 'registry-minimal' }), { valid: true, problems: [] });
    assert.equal(classify('a-b', { profile: 'registry-minimal' }), 'element');
    assert.deepEqual(parse('a-b', { profile: 'registry-minimal' }).parts, { segments: ['a', 'b'] });
  });

  test('a tier outside the three is unclassified; a profile cannot relax the core rules', () => {
    registerProfile({ name: 'registry-loose', classify: () => 'banner', validate: () => [] });
    assert.equal(classify('a-b', { profile: 'registry-loose' }), 'unclassified');
    registerProfile({ name: 'registry-anything', classify: () => 'section', validate: () => [] });
    assert.equal(classify('Not_Valid', { profile: 'registry-anything' }), 'unclassified');
    assert.equal(validate('Not_Valid', { profile: 'registry-anything' }).valid, false);
  });
});

// A made-up grammar, not modelled on any real product: a word followed by one
// number per tier. "kite-3" is a section, "kite-3-7" a block, "kite-3-7-2" an
// element. None of these fit Titan, whose tails end in a block noun or a word.
test('a third-party profile registered through the public API classifies its own grammar', () => {
  const kite = {
    name: 'kite-test',
    classify(address) {
      const m = /^[a-z]+((?:-\d+){1,3})$/.exec(address);
      if (!m) return null;
      return ['section', 'block', 'element'][m[1].split('-').length - 2];
    },
    validate(address) {
      return /^[a-z]+(-\d+){1,3}$/.test(address) ? [] : ['not word-number form'];
    },
  };
  registerProfile(kite);
  assert.ok(profiles.includes('kite-test'));
  for (const [address, tier] of [['kite-3', 'section'], ['kite-3-7', 'block'], ['kite-3-7-2', 'element']]) {
    assert.equal(classify(address, { profile: 'titan' }), 'unclassified', 'titan: ' + address);
    assert.equal(classify(address, { profile: 'kite-test' }), tier, 'kite-test: ' + address);
  }
  assert.deepEqual(validate('home-hero', { profile: 'kite-test' }), { valid: false, problems: ['not word-number form'] });
});

test('dist/core.mjs imports in plain Node with no DOM globals', () => {
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', `
    if (typeof window !== 'undefined' || typeof document !== 'undefined') throw new Error('DOM globals present');
    const core = await import(${JSON.stringify(path.join(ROOT, 'dist/core.mjs'))});
    console.log(JSON.stringify([core.profiles, core.classify('home-hero-card-01', { profile: 'titan' })]));
  `], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out), [['generic', 'app', 'titan'], 'block']);
  const src = fs.readFileSync(path.join(ROOT, 'dist/core.mjs'), 'utf8');
  assert.ok(!/\b(document|window)\b/.test(src), 'no DOM access in core.mjs');
});
