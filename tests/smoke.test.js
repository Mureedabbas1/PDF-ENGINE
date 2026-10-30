const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const robots = fs.readFileSync('robots.txt', 'utf8');

assert.match(html, /<title>PDF Engine/);
assert.match(html, /name="viewport"/);
assert.match(html, /rel="canonical"/);
assert.match(html, /G-K1RMFHCTEP/);
assert.match(html, /property="og:title"/);
assert.match(html, /rel="icon"/);

const expectedImplementations = [
  'merge', 'split', 'compress', 'jpg2pdf', 'pdf2jpg', 'rotate',
  'pagenumbers', 'watermark', 'wordcounter', 'age', 'imgcompress',
  'extract', 'remove', 'reorder', 'text', 'crop', 'grayscale',
  'flatten', 'metadata'
];
const implemented = new Set(Array.from(html.matchAll(/TOOLS\.([A-Za-z0-9_]+)\s*=/g), m => m[1]));
for (const key of expectedImplementations) assert.ok(implemented.has(key), 'Missing tool implementation: ' + key);

const slugs = Array.from(html.matchAll(/"slug":"([^"]+)"/g), m => m[1]);
assert.equal(slugs.length, 19, 'Expected 19 indexable tool entries');
assert.equal((html.match(/class="tool-card glass tilt"/g) || []).length, 19, 'Expected 19 homepage tool cards');
for (const slug of slugs) {
  assert.ok(fs.existsSync('tools/' + slug + '.html'), 'Missing tool landing page: ' + slug);
  assert.ok(sitemap.includes('/tools/' + slug + '.html'), 'Tool page missing from sitemap: ' + slug);
}

assert.ok(html.includes('href="tools/extract-pages.html"'));
assert.ok(html.includes('href="tools/edit-pdf-metadata.html"'));
assert.ok(!html.includes('contact@example.com'));
assert.ok(!html.includes('aria-label="Advertisement"'));
assert.ok(!html.includes('href="#"'));

for (const file of [
  'robots.txt', 'sitemap.xml', 'ads.txt', 'privacy.html', 'terms.html',
  'about.html', 'contact.html', 'faq.html', 'tools/index.html', 'guides/index.html'
]) assert.ok(fs.existsSync(file), 'Missing required site file: ' + file);

assert.ok(sitemap.includes('https://pdfengine.site/'));
assert.ok(sitemap.includes('/guides/merge-pdf-files.html'));
assert.ok(sitemap.includes('/faq.html'));
assert.ok(sitemap.includes('/about.html') && sitemap.includes('/contact.html'));
assert.ok(!sitemap.includes('mureedabbas1.github.io/PDF-ENGINE'));
assert.ok(robots.includes('Sitemap: https://pdfengine.site/sitemap.xml'));
assert.ok(fs.readFileSync('ads.txt', 'utf8').includes('google.com, pub-6162822251101594, DIRECT, f08c47fec0942fa0'));

console.log('PDF Engine functional and site-structure smoke tests passed (19 tools).');
