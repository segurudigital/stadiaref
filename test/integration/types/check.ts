// Imports every entry point and uses its types under strict settings.
import stadiaref, { type Config, type StadiaRef } from 'stadiaref';
import { classify, validate, parse, registerProfile, profiles, type Profile } from 'stadiaref/core';
import stadiarefVite from 'stadiaref/vite';
import stadiarefAstro from 'stadiaref/astro';
import type { Plugin } from 'vite';
import type { AstroIntegration } from 'astro';

const config: Config = { profile: 'app', tiers: ['section', 'block'], dockOffset: { bottom: 72 }, keys: { pick: false }, watch: true };

async function useApi(api: StadiaRef): Promise<string[]> {
  await api.ready;
  api.init(config).setLabels('icons');
  const tiers: Array<'section' | 'block' | 'element'> = api.getTiers();
  const tier: 'section' | 'block' | 'element' | 'unclassified' = api.classify('home-hero');
  const ok: boolean = api.validate('home-hero').valid;
  void tiers; void tier; void ok;
  return api.find('home');
}
void useApi(stadiaref);

window.addEventListener('stadiaref:address-click', (event) => {
  const { address, tier, element, source, copied } = event.detail;
  const s: 'label' | 'pick' | 'find' | 'tree' = source;
  void address; void tier; void element; void s; void copied;
});
window.stadiaref?.hide();

const zeta: Profile = {
  name: 'zeta',
  classify: (address) => (address.startsWith('zeta-') ? 'section' : null),
  validate: () => [],
};
const name: string = registerProfile(zeta);
const t: string = classify('zeta-s01', { profile: name, context: { depth: 0, hasAddressedChildren: true } });
const v: boolean = validate('Home_Hero').valid;
const parts = parse('ops-app-jobs', { profile: 'app' }).parts;
const names: readonly string[] = profiles;
void t; void v; void parts; void names;

const plugin: Plugin = stadiarefVite({ profile: 'app', setup: './stadiaref.setup.js' });
const integration: AstroIntegration = stadiarefAstro({ profile: 'titan', startHidden: true });
void plugin; void integration;
