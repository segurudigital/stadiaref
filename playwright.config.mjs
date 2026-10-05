// Browser suite. Two projects run the same tests: `src` bundles the current
// source on the fly, `dist` serves the built file. See test/support/server.mjs.
import { defineConfig, devices } from '@playwright/test';

const projects = [
  { name: 'src', port: 4173 },
  { name: 'dist', port: 4174 },
];

export default defineConfig({
  testDir: 'test/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
  },
  projects: projects.map((p) => ({
    name: p.name,
    use: { baseURL: 'http://127.0.0.1:' + p.port },
  })),
  webServer: projects.map((p) => ({
    command: 'node test/support/server.mjs',
    env: { PORT: String(p.port), OVERLAY: p.name },
    url: 'http://127.0.0.1:' + p.port + '/package.json',
    reuseExistingServer: !process.env.CI,
  })),
});
