import { S } from './state.js';
import { hasProfile, registerProfile as coreRegisterProfile } from '../core/index.js';

// Record the selected profile. A name that isn't registered logs one warning
// and generic is used until a profile with that name is registered.
export function selectProfile(name) {
  S.profile = name;
  if (!hasProfile(name) && !S.warnedProfiles[name]) {
    S.warnedProfiles[name] = true;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[stadiaref] no profile named "' + name + '" is registered yet. Using generic until it is.');
    }
  }
}

// Register through the core, so the core and the overlay share one
// registry. Returns true when the new profile is the one already selected,
// in which case the caller re-surveys.
export function registerSelected(profile) {
  coreRegisterProfile(profile);
  return profile.name === S.profile;
}
