const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const robots = fs.readFileSync('robots.txt', 'utf8');

assert.match(html, /<title>PDF Engine/);
assert.match(html, /name="viewport"/);
assert.match(html, /rel="canonical"/);
assert.match(html, /G-K1RMFHCTEP/);
assert.ok(html.includes('adsbygoogle.js?client=ca-pub-6162822251101594'), 'Homepage AdSense loader is missing');
assert.ok(html.includes('name="google-adsense-account" content="ca-pub-6162822251101594"'), 'Homepage AdSense account meta is missing');
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
assert.equal((html.match(/class="tool-card glass tilt"/g) || []).length, 20, 'Expected 20 homepage tool cards');
assert.ok(html.includes('href="qr-code-tools.html"'));

const qrHub = fs.readFileSync('qr-code-tools.html', 'utf8');
assert.equal((qrHub.match(/class="qr-card"/g) || []).length, 30, 'Expected 30 QR tool cards');
assert.ok(!/PDFLEO/i.test(qrHub), 'Old PDFLEO branding remains in QR hub');
assert.ok(qrHub.includes('"@type":"CollectionPage"'), 'QR hub CollectionPage schema is missing');
assert.ok(qrHub.includes('googletagmanager.com/gtag/js?id=G-K1RMFHCTEP'), 'QR hub GA4 loader is missing');
assert.ok(qrHub.includes('adsbygoogle.js?client=ca-pub-6162822251101594'), 'QR hub AdSense loader is missing');
assert.ok(qrHub.includes('name="google-adsense-account" content="ca-pub-6162822251101594"'), 'QR hub AdSense meta is missing');
assert.ok(!/PDFLEO/i.test(qrHub), 'Old PDFLEO branding remains in QR hub');

const qrPages = fs.readdirSync('.').filter(name => /^[a-z0-9-]+-qr-generator\.html$/i.test(name));
assert.equal(qrPages.length, 30, 'Expected 30 standalone QR generator pages in repository');
for (const page of qrPages) {
  const content = fs.readFileSync(page, 'utf8');
  assert.match(content, /<title[^>]*>\s*.+<\/title>/i, page + ': missing title');
  assert.match(content, /name=["']description["']/i, page + ': missing description');
  assert.match(content, /rel=["']canonical["']/i, page + ': missing canonical');
  assert.match(content, /<h1\b/i, page + ': missing H1');
  assert.ok(content.includes('googletagmanager.com/gtag/js?id=G-K1RMFHCTEP'), page + ': missing GA4');
  assert.ok(content.includes('adsbygoogle.js?client=ca-pub-6162822251101594'), page + ': missing AdSense loader');
  assert.ok(content.includes('name="google-adsense-account" content="ca-pub-6162822251101594"'), page + ': missing AdSense meta');
  assert.ok(content.includes('"@type":"WebApplication"'), page + ': missing WebApplication schema');
  assert.ok(!/pdfleo/i.test(content), page + ': old PDFLEO asset name remains');
}
assert.ok(fs.existsSync('tools/qr-code-generator.html'));
const baseQr = fs.readFileSync('tools/qr-code-generator.html', 'utf8');
assert.ok(baseQr.includes('"@type":"WebApplication"'), 'Main QR tool schema missing');

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
const sitemapEntries = Array.from(sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g), m => m[1]);
assert.ok(sitemapEntries.length >= 78, 'Expected at least 78 sitemap URLs');
for (const entry of sitemapEntries) assert.match(entry, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/, 'Sitemap URL missing lastmod');

console.log('PDF Engine tests passed: 20 homepage tool cards, 19 tool landing pages, 30 QR hub cards, 31 standalone QR generators, GA4, AdSense and sitemap.');
