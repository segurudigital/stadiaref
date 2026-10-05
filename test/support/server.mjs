// Static test server for the browser suite.
//
// Serves the repo root, with two additions:
//
// 1. Any request for the overlay script (whatever directory the page asks for
//    it from) is answered with the overlay under test. OVERLAY=src bundles the
//    current source on the fly with esbuild (unminified); OVERLAY=dist serves
//    the built file from dist/. That lets every page — demo, fixtures, harness
//    — run against both without editing the pages.
//
// 2. GET /__harness builds a page from query parameters, so a test can choose
//    config objects, script attributes and body markup:
//      body=<name>        test/browser/bodies/<name>.html (default "basic")
//      page=<json>        assigned to the per-page config global
//      wp=<json>          assigned to the WordPress-injected config global
//      attrs=<json>       extra attributes on the overlay <script> tag
//      pre=<js>           inline script run before the overlay loads
//      noscript=1         omit the overlay entirely (for DOM-diff tests)
//      defer=1            load the overlay with `defer`

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = Number(process.env.PORT || 4173);
const OVERLAY = process.env.OVERLAY || 'src';

const SRC_ENTRY = path.join(ROOT, 'src/overlay/index.js');
const DIST_FILE = path.join(ROOT, 'dist/seguru-debug-toolbar.min.js');
const OVERLAY_NAMES = /\/(seguru-debug-toolbar(\.min)?\.js|overlay\.js)$/;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

async function overlaySource() {
  if (OVERLAY === 'dist') return fs.readFileSync(DIST_FILE, 'utf8');
  const out = await esbuild.build({
    entryPoints: [SRC_ENTRY],
    bundle: true,
    format: 'iife',
    write: false,
    logLevel: 'silent',
  });
  return out.outputFiles[0].text;
}

function escapeAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function harness(query) {
  const bodyName = (query.get('body') || 'basic').replace(/[^a-z0-9-]/gi, '');
  const body = fs.readFileSync(path.join(ROOT, 'test/browser/bodies', bodyName + '.html'), 'utf8');
  const parts = [];
  if (query.has('wp')) parts.push('window.sdtConfig = ' + query.get('wp') + ';');
  if (query.has('page')) parts.push('window.seguruDebugConfig = ' + query.get('page') + ';');
  if (query.has('pre')) parts.push(query.get('pre'));
  let attrs = '';
  if (query.has('attrs')) {
    const obj = JSON.parse(query.get('attrs'));
    for (const k of Object.keys(obj)) attrs += ' ' + k + '="' + escapeAttr(obj[k]) + '"';
  }
  if (query.get('defer') === '1') attrs += ' defer';
  const script = query.get('noscript') === '1' ? '' : '<script src="/overlay.js"' + attrs + '></script>';
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>harness</title>\n' +
    '<script>' + parts.join('\n') + '</script>\n</head>\n<body>\n' + body + '\n' + script + '\n</body>\n</html>\n';
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/__harness') {
      res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
      res.end(harness(url.searchParams));
      return;
    }
    if (OVERLAY_NAMES.test(url.pathname) && !url.pathname.includes('/node_modules/')) {
      res.writeHead(200, { 'content-type': TYPES['.js'], 'cache-control': 'no-store' });
      res.end(await overlaySource());
      return;
    }
    const file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err && err.stack || err));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('test server (' + OVERLAY + ') on http://127.0.0.1:' + PORT);
});
