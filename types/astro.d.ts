// stadiaref/astro: loads StadiaRef while `astro dev` runs, as an app in
// Astro's Dev Toolbar.

import type { AstroIntegration } from 'astro';
import type { Config } from './index.js';

export interface StadiaRefIntegrationOptions extends Config {
  /** A module in your project whose default export receives the API before the first survey. Dev server only. */
  setup?: string;
}

export default function stadiaref(options?: StadiaRefIntegrationOptions): AstroIntegration;
