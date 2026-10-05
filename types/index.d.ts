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
  id?: string;
  email?: string;
}

export interface DockOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Config {
  profile?: string;
  labels?: LabelMode;
  tiers?: Tier[];
  autoAddress?: boolean;
  outline?: OutlineMode;
  startHidden?: boolean;
  watch?: boolean;
  theme?: Theme;
  dock?: Dock | 'auto';
  dockOffset?: DockOffset;
  keys?: Keys;
  user?: User | null;
  classConverter?: boolean;
  pageSlug?: string;
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

  setTheme(mode: Theme): void;
  /** The theme in use. */
  getTheme(): 'light' | 'dark';
  setDock(corner: Dock | 'auto'): void;
  getDock(): Dock;
  setKeys(keys: Keys): void;
  getKeys(): Record<KeyAction, string | false>;
  setUser(user: User | null): void;
  getUser(): User | null;

  classify(address: string): TierOrUnclassified;
  validate(address: string): ValidateResult;
  registerProfile(profile: Profile): string;
}

export type AddressSource = 'label' | 'pick' | 'find' | 'tree';

export interface AddressDetail {
  address: string;
  tier: TierOrUnclassified;
  element: Element;
}

export interface AddressClickDetail extends AddressDetail {
  source: AddressSource;
  copied: boolean;
}

export interface StadiaRefEventMap {
  'stadiaref:ready': CustomEvent<{ version: string }>;
  'stadiaref:show': CustomEvent<Record<string, never>>;
  'stadiaref:hide': CustomEvent<Record<string, never>>;
  'stadiaref:address-click': CustomEvent<AddressClickDetail>;
  'stadiaref:address-hover': CustomEvent<AddressDetail>;
  'stadiaref:address-leave': CustomEvent<AddressDetail>;
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
