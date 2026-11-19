const fs = require('node:fs');
const assert = require('node:assert/strict');

const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.start_url.startsWith('/'), 'start_url must be absolute');
const sizes = manifest.icons.map(i => i.sizes + ':' + i.purpose + ':' + i.type);
for (const need of ['192x192:any:image/png', '512x512:any:image/png', '192x192:maskable:image/png', '512x512:maskable:image/png'])
  assert.ok(sizes.includes(need), 'Manifest icon missing: ' + need);
for (const icon of manifest.icons) assert.ok(fs.existsSync(icon.src.slice(1)), 'Icon file missing: ' + icon.src);
assert.ok(manifest.shortcuts.length >= 3, 'Manifest shortcuts missing');
assert.ok(fs.existsSync('icons/apple-touch-icon-180.png'), 'apple-touch-icon missing');

const sw = fs.readFileSync('sw.js', 'utf8');
assert.ok(sw.includes('offline.html') && fs.existsSync('offline.html'), 'Offline page missing');
assert.ok(sw.includes('response.ok'), 'Service worker must check response.ok before caching pages');
assert.ok(sw.includes('allSettled'), 'Service worker install must tolerate a missing file');
assert.ok(sw.includes('cdnjs.cloudflare.com'), 'Service worker must cache the PDF libraries');

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = dir === '.' ? e.name : dir + '/' + e.name;
    if (e.isDirectory()) walk(p); else if (p.endsWith('.html')) pages.push(p);
  }
})('.');
for (const page of pages) {
  if (page === 'offline.html') continue;
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes('rel="manifest"'), page + ': manifest link missing');
  assert.ok(html.includes('navigator.serviceWorker') || html.includes('serviceWorker'), page + ': service worker registration missing');
  assert.equal((html.match(/name="theme-color"/g) || []).length, 1, page + ': expected exactly one theme-color');
}
const index = fs.readFileSync('index.html', 'utf8');
assert.ok(!index.includes('backgrond.png'), 'Heavy 2 MB background must not be used');
assert.ok(index.includes('pe-welcome-seen'), 'Welcome screen must show once per session');
console.log('PWA tests passed for ' + pages.length + ' pages.');
