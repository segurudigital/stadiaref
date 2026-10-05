// A setup module with a made-up grammar: zeta-sNN, zeta-sNN-bNN,
// zeta-sNN-bNN-<element>. The integrations load it on the dev server only.
import { profiles } from 'stadiaref/core';
const zeta = {
  name: 'zeta',
  classify(address) {
    if (/^zeta-s\d{2}$/.test(address)) return 'section';
    if (/^zeta-s\d{2}-b\d{2}$/.test(address)) return 'block';
    if (/^zeta-s\d{2}-b\d{2}-[a-z0-9-]+$/.test(address)) return 'element';
    return null;
  },
};

export default async function setup(stadiaref) {
  stadiaref.registerProfile(zeta);
  // stadiaref/core and the overlay share one registry.
  window.__setupRan = { profileBefore: stadiaref.getProfile(), coreSees: profiles.includes('zeta') };
}
