// stadiaref/core: the address grammar on its own. No DOM; runs in Node.

export type Tier = 'section' | 'block' | 'element';
export type TierOrUnclassified = Tier | 'unclassified';

/** What the caller knows about the element that carries the address. */
export interface ClassifyContext {
  /** How many addressed ancestors the element has (authored addresses only). */
  depth: number;
  /** Whether the element has addressed descendants (authored addresses only). */
  hasAddressedChildren: boolean;
}

/** A profile: how addresses are sorted into tiers and checked. */
export interface Profile {
  name: string;
  /** A tier, or null if the address doesn't fit. */
  classify(address: string, context?: ClassifyContext): Tier | null;
  /** A list of problems; an empty list means the address is fine. */
  validate?(address: string): string[];
  /** The address split into the parts the profile defines. */
  parse?(address: string): Record<string, unknown> | null;
}

export interface ValidateResult {
  valid: boolean;
  /** Sentences for people. Don't match on their wording. */
  problems: string[];
}

export interface ParseResult {
  address: string;
  profile: string;
  parts: Record<string, unknown> | null;
}

export interface ProfileOptions {
  /** A registered profile name. Defaults to 'generic'. */
  profile?: string;
}

export interface ClassifyOptions extends ProfileOptions {
  context?: ClassifyContext;
}

export function validate(address: string, options?: ProfileOptions): ValidateResult;
export function classify(address: string, options?: ClassifyOptions): TierOrUnclassified;
export function parse(address: string, options?: ProfileOptions): ParseResult;
/** Adds a profile and returns its name. Throws if the name is taken. */
export function registerProfile(profile: Profile): string;
export function hasProfile(name: string): boolean;
/** The names of the registered profiles. */
export const profiles: readonly string[];
export const DEFAULT_PROFILE: 'generic';
export const TIERS: readonly Tier[];
export const MAX_LENGTH: number;
/** The surfaces the app profile knows. */
export const SURFACES: readonly string[];
