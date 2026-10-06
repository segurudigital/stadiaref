// Renders the PNG graphics in assets/ from their HTML sources in
// assets/src/, with Playwright's Chromium:
//   assets/github-social-preview.png   1280 x 640, for Settings → Social preview
// Run after changing a source: `node scripts/render-graphics.mjs`.
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..');
const GRAPHICS = [
  { src: 'assets/src/github-social-preview.html', out: 'assets/github-social-preview.png', width: 1280, height: 640 },
];

const browser = await chromium.launch();
for (const g of GRAPHICS) {
  const page = await browser.newPage({ viewport: { width: g.width, height: g.height }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, g.src));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ROOT, g.out), clip: { x: 0, y: 0, width: g.width, height: g.height } });
  await page.close();
  console.log('rendered ' + g.out);
}
await browser.close();
