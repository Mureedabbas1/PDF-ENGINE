const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const required = [
  ['page title', /<title>PDF Engine/],
  ['responsive viewport', /name="viewport"/],
  ['canonical URL', /rel="canonical"/],
  ['Open Graph metadata', /property="og:title"/],
  ['favicon', /rel="icon"/],
  ['PDF merge tool', /TOOLS\.merge\s*=/],
  ['PDF split tool', /TOOLS\.split\s*=/],
  ['PDF compression tool', /TOOLS\.compress\s*=/],
  ['PDF to image renderer', /pdfjsLib\.GlobalWorkerOptions/],
  ['ZIP export library', /JSZip/],
  ['word counter tool', /TOOLS\.wordcounter\s*=/],
  ['age calculator tool', /TOOLS\.age\s*=/],
  ['image compressor tool', /TOOLS\.imgcompress\s*=/],
  ['QR code library', /qrcode-generator/],
  ['20 tool metadata entries', (html.match(/"slug":/g) || []).length === 20 ? /./ : /NEVER_MATCH_THIS/],
  ['page extraction tool', /TOOLS\.extract\s*=/],
  ['page removal tool', /TOOLS\.remove\s*=/],
  ['page reorder tool', /TOOLS\.reorder\s*=/],
  ['PDF text extraction tool', /TOOLS\.text\s*=/],
  ['PDF crop tool', /TOOLS\.crop\s*=/],
  ['grayscale tool', /TOOLS\.grayscale\s*=/],
  ['form flatten tool', /TOOLS\.flatten\s*=/],
  ['metadata tool', /TOOLS\.metadata\s*=/]
];
for (const [name, pattern] of required) {
  if (name === '20 tool metadata entries') {
    assert.equal((html.match(/"slug":/g) || []).length, 20, 'Expected exactly 20 tools');
  } else {
    assert.match(html, pattern, 'Missing: ' + name);
  }
}
for (const path of ['robots.txt', 'sitemap.xml', 'privacy.html', 'terms.html', 'about.html', 'contact.html', 'guides/index.html', 'tools/index.html', 'guides/merge-pdf-files.html', 'guides/split-pdf-pages.html', 'guides/compress-pdf.html', 'guides/pdf-to-jpg.html', 'guides/jpg-to-pdf-guide.html', 'guides/rotate-pdf-guide.html', 'guides/add-page-numbers-guide.html', 'guides/add-watermark-guide.html', 'guides/word-counter-guide.html', 'guides/age-calculator-guide.html', 'guides/image-compressor-guide.html', 'guides/qr-code-guide.html', 'guides/extract-pdf-pages-guide.html', 'guides/remove-pdf-pages-guide.html', 'guides/reorder-pdf-pages-guide.html', 'guides/pdf-to-text-guide.html', 'guides/crop-pdf-guide.html', 'guides/grayscale-pdf-guide.html', 'guides/flatten-pdf-form-guide.html', 'guides/edit-pdf-metadata-guide.html']) {
  assert.ok(fs.existsSync(path), 'Missing file: ' + path);
}
assert.equal((html.match(/class="tool-card glass tilt reveal"/g) || []).length, 20, 'Expected all 20 tools to be present in homepage HTML');
assert.ok(html.includes('href="#/extract-pages"'), 'Extract Pages card must link to its tool route');
assert.ok(html.includes('href="#/edit-pdf-metadata"'), 'Edit Metadata card must link to its tool route');

assert.ok(!html.includes('contact@example.com'), 'Contact placeholder must be removed');
assert.ok(!html.includes('aria-label="Advertisement"'), 'Do not show fake ad placeholders before AdSense setup');
assert.ok(!html.includes('href="#"'), 'Remove empty social/navigation links');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const toolSlugsForPages = Array.from(html.matchAll(/"slug":"([^"]+)"/g), m => m[1]);
for (const slug of toolSlugsForPages) {
  assert.ok(fs.existsSync('tools/' + slug + '.html'), 'Missing indexable tool landing page: ' + slug);
  assert.ok(sitemap.includes('/tools/' + slug + '.html'), 'Tool landing page missing from sitemap: ' + slug);
}
assert.ok(sitemap.includes('/guides/merge-pdf-files.html'), 'Guides missing from sitemap');
for (const guide of ['merge-pdf-files.html', 'split-pdf-pages.html', 'compress-pdf.html', 'pdf-to-jpg.html', 'jpg-to-pdf-guide.html', 'rotate-pdf-guide.html', 'add-page-numbers-guide.html', 'add-watermark-guide.html', 'word-counter-guide.html', 'age-calculator-guide.html', 'image-compressor-guide.html', 'qr-code-guide.html', 'extract-pdf-pages-guide.html', 'remove-pdf-pages-guide.html', 'reorder-pdf-pages-guide.html', 'pdf-to-text-guide.html', 'crop-pdf-guide.html', 'grayscale-pdf-guide.html', 'flatten-pdf-form-guide.html', 'edit-pdf-metadata-guide.html']) {
  assert.ok(sitemap.includes('/guides/' + guide), 'Guide missing from sitemap: ' + guide);
}
assert.ok(sitemap.includes('/about.html') && sitemap.includes('/contact.html'), 'About/contact missing from sitemap');
assert.ok(sitemap.includes('/faq.html'), 'FAQ page missing from sitemap');

const dataKeys = Array.from(html.matchAll(/"key":"([^"]+)"/g), m => m[1]);
const implemented = new Set(Array.from(html.matchAll(/TOOLS\.([A-Za-z0-9_]+)\s*=/g), m => m[1]));
assert.equal(dataKeys.length, 20, 'Expected 20 tool metadata entries');
for (const key of dataKeys) assert.ok(implemented.has(key), 'Missing implementation for tool: ' + key);

assert.ok(html.includes('https://pdfengine.site/'), 'Homepage canonical must use the custom domain');
assert.ok(!html.includes('mureedabbas1.github.io/PDF-ENGINE'), 'Homepage must not retain the old canonical domain');
const sitemapDomainCheck = fs.readFileSync('sitemap.xml', 'utf8');
assert.ok(sitemapDomainCheck.includes('https://pdfengine.site/'), 'Sitemap must use the custom domain');
assert.ok(!sitemapDomainCheck.includes('mureedabbas1.github.io/PDF-ENGINE'), 'Sitemap must not retain the old domain');
assert.ok(fs.readFileSync('robots.txt', 'utf8').includes('https://pdfengine.site/sitemap.xml'), 'robots.txt must reference the custom-domain sitemap');

console.log('PDF Engine static smoke tests passed (' + required.length + ' checks + 20 tool implementation mappings + SEO/legal files).');
