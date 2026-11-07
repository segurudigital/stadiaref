// Imports every entry point and uses its types under strict settings.
import stadiaref, { type Config, type StadiaRef } from 'stadiaref';
import { classify, validate, parse, registerProfile, profiles, type Profile } from 'stadiaref/core';
import stadiarefVite from 'stadiaref/vite';
import stadiarefAstro from 'stadiaref/astro';
import type { Plugin } from 'vite';
import type { AstroIntegration } from 'astro';

const config: Config = {
  profile: 'app', tiers: ['section', 'block'], dockOffset: { bottom: 72 }, keys: { pick: false }, watch: true,
  click: 'card', tree: 'push', dock: 'host', mount: '#bar', hint: false, drill: true,
};

async function useApi(api: StadiaRef): Promise<string[]> {
  await api.ready;
  api.init(config).setLabels('icons');
  const tiers: Array<'section' | 'block' | 'element'> = api.getTiers();
  const tier: 'section' | 'block' | 'element' | 'unclassified' = api.classify('home-hero');
  const ok: boolean = api.validate('home-hero').valid;
  void tiers; void tier; void ok;
  api.setLookup(async (address, el) => [{ label: 'Tag', value: el.tagName, tone: 'muted' }, { label: 'Spec', value: address, href: 'https://example.com' }]);
  api.setLookup(null);
  api.onAddress((address, ctx) => { const line: string = ctx.brief + address + ctx.chain.join('/'); void line; }, 'Send');
  const opened: boolean = api.card('home-hero') || api.card(false);
  const click: 'card' | 'copy' = api.getClick();
  const width: number = api.getTreeWidth();
  const drilled: string | null = api.drill('home-hero') ? api.getDrill() : null;
  api.setDock({ mount: '#bar' });
  // 3.1 callers pass id and email: accepted (deprecated, ignored), never given back.
  api.setUser({ name: 'Ada', role: 'reviewer', id: 'u1', email: 'ada@example.com' });
  api.init({ user: { name: 'Ada', role: 'reviewer', id: 'u1' } });
  const me = api.getUser();
  // @ts-expect-error getUser() has name and role only
  void me?.id;
  // @ts-expect-error getUser() has name and role only
  void me?.email;
  void opened; void click; void width; void drilled;
  return api.find('home');
}
void useApi(stadiaref);

window.addEventListener('stadiaref:address-click', (event) => {
  const { address, tier, element, source, copied } = event.detail;
  const s: 'label' | 'pick' | 'find' | 'tree' | 'card' | 'brief' = source;
  void address; void tier; void element; void s; void copied;
});
window.addEventListener('stadiaref:card', (event) => {
  const open: boolean = event.detail.open;
  void open;
});
window.addEventListener('stadiaref:user-change', (event) => {
  const name: string | undefined = event.detail.user?.name;
  // @ts-expect-error the event carries name and role only
  void event.detail.user?.id;
  void name;
});
window.addEventListener('stadiaref:tree', (event) => {
  const w: number = event.detail.width;
  void w;
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
