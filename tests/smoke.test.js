const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const required = [
  ['page title', /<title>PDF Engine/],
  ['responsive viewport', /name="viewport"/],
  ['canonical URL', /rel="canonical"/],
  ['Open Graph metadata', /property="og:title"/],
  ['favicon', /rel="icon"/],
  ['PDF merge/split/rotate processing', /async function processFiles\(\)/],
  ['PDF to JPG renderer', /pdfjsLib\.getDocument/],
  ['ZIP export for rendered pages', /new JSZip\(\)/],
  ['QR generator function', /function makeQR\(\)/],
  ['image compression function', /function compressImage\(\)/],
  ['word counter', /id==='word'/],
  ['age calculator', /function calcAge\(\)/],
  ['honest compression limitation', /does not recompress embedded images/],
  ['privacy page link', /href="privacy\.html"/],
  ['terms page link', /href="terms\.html"/]
];
for (const [name, pattern] of required) {
  assert.match(html, pattern, 'Missing: ' + name);
}
for (const path of ['robots.txt', 'sitemap.xml', 'privacy.html', 'terms.html']) {
  assert.ok(fs.existsSync(path), 'Missing file: ' + path);
}
console.log('PDF Engine static smoke tests passed (' + required.length + ' HTML checks + SEO/legal files).');
