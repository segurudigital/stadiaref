// Renders the PNG graphics in assets/ from their HTML sources in
// assets/src/, with Playwright's Chromium:
//   assets/github-social-preview.png           1280 x 640, for Settings → Social preview
//   assets/wordpress-org/icon-*.png            128 and 256, the plugin directory icon
//   assets/wordpress-org/banner-*.png          772 x 250 and 1544 x 500, its banner
// Run after changing a source: `node scripts/render-graphics.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..');
const GRAPHICS = [
  { src: 'assets/src/github-social-preview.html', out: 'assets/github-social-preview.png', width: 1280, height: 640 },
  { src: 'assets/src/wordpress-org-icon.html', out: 'assets/wordpress-org/icon-128x128.png', width: 128, height: 128 },
  { src: 'assets/src/wordpress-org-icon.html', out: 'assets/wordpress-org/icon-256x256.png', width: 128, height: 128, scale: 2 },
  { src: 'assets/src/wordpress-org-banner.html', out: 'assets/wordpress-org/banner-772x250.png', width: 772, height: 250 },
  { src: 'assets/src/wordpress-org-banner.html', out: 'assets/wordpress-org/banner-1544x500.png', width: 772, height: 250, scale: 2 },
];

const browser = await chromium.launch();
for (const g of GRAPHICS) {
  const page = await browser.newPage({ viewport: { width: g.width, height: g.height }, deviceScaleFactor: g.scale || 1 });
  await page.goto('file://' + path.join(ROOT, g.src));
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(path.join(ROOT, g.out)), { recursive: true });
  await page.screenshot({ path: path.join(ROOT, g.out), clip: { x: 0, y: 0, width: g.width, height: g.height } });
  await page.close();
  console.log('rendered ' + g.out);
}
await browser.close();
