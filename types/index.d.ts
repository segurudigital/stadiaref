// stadiaref: the overlay as an ES module. Importing it starts StadiaRef in a
// browser; on a server it does nothing and the default export is undefined.

import type { Profile, TierOrUnclassified, Tier, ValidateResult } from './core.js';

export type { Profile, Tier, TierOrUnclassified, ValidateResult, ClassifyContext } from './core.js';

export type LabelMode = 'full' | 'icons' | 'off';
export type OutlineMode = 'off' | 'section' | 'block';
export type Theme = 'auto' | 'light' | 'dark';
export type Dock = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type KeyAction = 'toggle' | 'labels' | 'section' | 'block' | 'element' | 'pick' | 'find' | 'outline' | 'hide';
/** A key (matched on the character typed), or false to turn the action off. */
export type Keys = Partial<Record<KeyAction, string | false>>;

export interface User {
  name?: string;
  role?: string;
}

export interface DockOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/** What a label click does: open the address card (default), or copy as in 3.2. */
export type ClickMode = 'card' | 'copy';
/** How the Tree opens: over the page, or as a column the page makes room for. */
export type TreeMode = 'overlay' | 'push';

/** A row the host adds to the address card. Values are shown as text, never HTML. */
export interface LookupRow {
  label: string;
  value: string;
  tone?: 'ok' | 'warn' | 'error' | 'muted';
  /** An http, https or mailto link; anything else is dropped. */
  href?: string;
}

export type Lookup = (address: string, element: Element) => LookupRow[] | null | undefined | Promise<LookupRow[] | null | undefined>;

export interface Config {
  profile?: string;
  labels?: LabelMode;
  tiers?: Tier[];
  autoAddress?: boolean;
  outline?: OutlineMode;
  startHidden?: boolean;
  watch?: boolean;
  theme?: Theme;
  /** 'host' draws the toolbar inside the `mount` element. */
  dock?: Dock | 'auto' | 'host';
  /** With dock: 'host', a selector for the element the toolbar is drawn in. */
  mount?: string;
  dockOffset?: DockOffset;
  keys?: Keys;
  user?: User | null;
  classConverter?: boolean;
  pageSlug?: string;
  click?: ClickMode;
  tree?: TreeMode;
  /** With labels off, the address and tier beside the pointer. Default true. */
  hint?: boolean;
  /** Drill-down on the card. Default true. */
  drill?: boolean;
}

/** What an onAddress() action receives with the address. */
export interface AddressContext {
  tier: TierOrUnclassified;
  element: Element;
  text: string;
  chain: string[];
  tag: string;
  url: string;
  title: string;
  viewport: { width: number; height: number };
  brief: string;
}

export interface StadiaRef {
  readonly version: string;
  /** Resolves with the API once StadiaRef has started. */
  readonly ready: Promise<StadiaRef>;
  init(config?: Config): StadiaRef;
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
  refresh(): void;

  setLabels(mode: LabelMode): void;
  getLabels(): LabelMode;
  setTiers(tiers: Tier[]): void;
  getTiers(): Tier[];
  setAutoAddress(on: boolean): void;
  getAutoAddress(): boolean;
  setOutline(mode: OutlineMode): void;
  getOutline(): OutlineMode;
  setProfile(name: string): void;
  getProfile(): string;

  /** Start Pick; pick(false) stops it. */
  pick(on?: boolean): void;
  /** Open Find with `query` and return the matching addresses; find(false) closes it. */
  find(query?: string | false): string[];
  toggleTree(): void;
  /** Open the address card for an address or element; card(false) closes it. True when a card opened. */
  card(target: string | Element | false): boolean;
  /** What a label click does now. */
  getClick(): ClickMode;
  /** The width the Tree takes from the page: its width while open with tree: 'push', else 0. */
  getTreeWidth(): number;
  /** Rows for the card from the host, sync or async; setLookup(null) removes them. */
  setLookup(fn: Lookup | null): void;
  /** One host button on every card; onAddress(null) removes it. */
  onAddress(fn: ((address: string, context: AddressContext) => unknown) | null, label?: string): void;
  /** Narrow the view to an address or element (unless drill: false); drill(false) leaves. */
  drill(target: string | Element | false): boolean;
  /** The address drilled into, or null. */
  getDrill(): string | null;

  setTheme(mode: Theme): void;
  /** The theme in use. */
  getTheme(): 'light' | 'dark';
  setDock(corner: Dock | 'auto' | 'host' | { mount: string }): void;
  getDock(): Dock | 'host';
  setKeys(keys: Keys): void;
  getKeys(): Record<KeyAction, string | false>;
  setUser(user: User | null): void;
  getUser(): User | null;

  classify(address: string): TierOrUnclassified;
  validate(address: string): ValidateResult;
  registerProfile(profile: Profile): string;
}

export type AddressSource = 'label' | 'pick' | 'find' | 'tree' | 'card' | 'brief';

export interface AddressDetail {
  address: string;
  tier: TierOrUnclassified;
  element: Element;
}

export interface AddressClickDetail extends AddressDetail {
  source: AddressSource;
  copied: boolean;
}

export interface CardDetail extends AddressDetail {
  open: boolean;
}

export interface StadiaRefEventMap {
  'stadiaref:ready': CustomEvent<{ version: string }>;
  'stadiaref:show': CustomEvent<Record<string, never>>;
  'stadiaref:hide': CustomEvent<Record<string, never>>;
  'stadiaref:address-click': CustomEvent<AddressClickDetail>;
  'stadiaref:address-hover': CustomEvent<AddressDetail>;
  'stadiaref:address-leave': CustomEvent<AddressDetail>;
  'stadiaref:card': CustomEvent<CardDetail>;
  'stadiaref:tree': CustomEvent<{ open: boolean; width: number }>;
  'stadiaref:drill': CustomEvent<{ address: string | null; tier: TierOrUnclassified | null; element: Element | null }>;
  'stadiaref:labels-change': CustomEvent<{ labels: LabelMode }>;
  'stadiaref:tiers-change': CustomEvent<{ tiers: Tier[] }>;
  'stadiaref:auto-address-change': CustomEvent<{ autoAddress: boolean }>;
  'stadiaref:outline-change': CustomEvent<{ outline: OutlineMode }>;
  'stadiaref:theme-change': CustomEvent<{ theme: 'light' | 'dark'; mode: Theme }>;
  'stadiaref:user-change': CustomEvent<{ user: User | null }>;
}

declare global {
  interface Window {
    stadiaref?: StadiaRef;
    stadiarefConfig?: Config;
  }
  interface WindowEventMap extends StadiaRefEventMap {}
}

declare const stadiaref: StadiaRef;
export default stadiaref;
