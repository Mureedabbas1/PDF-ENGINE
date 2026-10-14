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
  ['QR code tool', /TOOLS\.qrcode\s*=/],
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
for (const path of ['robots.txt', 'sitemap.xml', 'privacy.html', 'terms.html']) {
  assert.ok(fs.existsSync(path), 'Missing file: ' + path);
}
console.log('PDF Engine static smoke tests passed (' + required.length + ' checks + SEO/legal files).');
