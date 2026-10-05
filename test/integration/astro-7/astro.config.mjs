import { defineConfig } from 'astro/config';
import stadiaref from 'stadiaref/astro';

export default defineConfig({
  // STADIAREF_NO_DEV_TOOLBAR=1 turns Astro's Dev Toolbar off, to check the
  // floating toolbar comes back.
  devToolbar: { enabled: !process.env.STADIAREF_NO_DEV_TOOLBAR },
  integrations: [stadiaref({ profile: 'zeta', startHidden: false, setup: './stadiaref.setup.js' })],
});
