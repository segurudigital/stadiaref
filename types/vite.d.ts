// stadiaref/vite: loads StadiaRef on the Vite dev server only.

import type { Plugin } from 'vite';
import type { Config } from './index.js';

export interface StadiaRefPluginOptions extends Config {
  /** A module in your project whose default export receives the API before the first survey. Dev server only. */
  setup?: string;
}

export default function stadiaref(options?: StadiaRefPluginOptions): Plugin;
