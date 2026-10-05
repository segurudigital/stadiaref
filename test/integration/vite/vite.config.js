import { defineConfig } from 'vite';
import stadiaref from 'stadiaref/vite';

export default defineConfig({
  plugins: [stadiaref({ profile: 'zeta', startHidden: false, setup: './stadiaref.setup.js' })],
});
