// stadiaref/core: the address grammar on its own. No DOM; runs in Node.
//
//   validate(address, { profile })           → { valid, problems }
//   classify(address, { profile, context })  → 'section' | 'block' | 'element' | 'unclassified'
//   parse(address, { profile })              → { address, profile, parts }
//   registerProfile({ name, classify, validate?, parse? })
//   profiles                                 → the registered names
//
// `profile` defaults to 'generic'. One registry serves the core and the
// overlay, so a profile registered through either is visible to both.
import { coreProblems } from './rules.js';
import { generic } from './profiles/generic.js';
import { app } from './profiles/app.js';
import { titan } from './profiles/titan.js';

export { MAX_LENGTH } from './rules.js';
export { SURFACES } from './profiles/app.js';

export const DEFAULT_PROFILE = 'generic';
export const TIERS = ['section', 'block', 'element'];

var registry = {};

// The names of the registered profiles. Updated in place by registerProfile().
export const profiles = [];

function add(profile) {
  registry[profile.name] = profile;
  profiles.push(profile.name);
}
add(generic);
add(app);
add(titan);

export function hasProfile(name) {
  return Object.prototype.hasOwnProperty.call(registry, name);
}

function profileFor(options) {
  var name = options && options.profile !== undefined ? options.profile : DEFAULT_PROFILE;
  if (!hasProfile(name)) throw new Error('[stadiaref] unknown profile "' + name + '". Registered: ' + profiles.join(', '));
  return registry[name];
}

// Register a profile. Its classify(address, context) returns a tier or null;
// its validate(address) returns a list of problems. A name that is already
// taken throws, so built-in profiles can't be replaced.
export function registerProfile(profile) {
  if (!profile || typeof profile !== 'object') throw new TypeError('[stadiaref] registerProfile expects an object');
  if (typeof profile.name !== 'string' || !profile.name) throw new TypeError('[stadiaref] a profile needs a name');
  if (typeof profile.classify !== 'function') throw new TypeError('[stadiaref] profile "' + profile.name + '" needs a classify(address, context) function');
  if (profile.validate !== undefined && typeof profile.validate !== 'function') throw new TypeError('[stadiaref] profile "' + profile.name + '": validate must be a function');
  if (profile.parse !== undefined && typeof profile.parse !== 'function') throw new TypeError('[stadiaref] profile "' + profile.name + '": parse must be a function');
  if (hasProfile(profile.name)) throw new Error('[stadiaref] a profile named "' + profile.name + '" is already registered');
  add({ name: profile.name, classify: profile.classify, validate: profile.validate, parse: profile.parse });
  return profile.name;
}

// The core rules, then the profile's own.
export function validate(address, options) {
  var p = profileFor(options);
  var problems = coreProblems(address);
  if (!problems.length && p.validate) {
    var own = p.validate(address);
    if (own && own.length) problems = problems.concat(own);
  }
  return { valid: problems.length === 0, problems: problems };
}

// An address that fails validate() is 'unclassified', as is one the profile
// can't place.
export function classify(address, options) {
  var p = profileFor(options);
  if (!validate(address, options).valid) return 'unclassified';
  var tier = p.classify(address, options && options.context);
  return TIERS.indexOf(tier) !== -1 ? tier : 'unclassified';
}

export function parse(address, options) {
  var p = profileFor(options);
  var parts = null;
  if (validate(address, options).valid) {
    parts = p.parse ? p.parse(address) : { segments: address.split('-') };
  }
  return { address: address, profile: p.name, parts: parts || null };
}
