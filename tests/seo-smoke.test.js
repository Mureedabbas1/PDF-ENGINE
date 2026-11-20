const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const BASE = 'https://pdfengine.site';
const PUBLISHER = 'ca-pub-6162822251101594';
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const robots = fs.readFileSync('robots.txt', 'utf8');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : (entry.isFile() && entry.name.endsWith('.html') ? [full] : []);
  });
}

const files = [...walk('tools'), ...walk('guides')];
assert.ok(files.length >= 35, 'Expected tool and guide landing pages to be present');
const seenTitles = new Map();
const seenCanonicals = new Map();

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = file.split(path.sep).join('/');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const description = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i);
  const canonical = (html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) || [])[1];
  const robotsTag = (html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [])[1];
  const h1 = html.match(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i);
  assert.ok(title && title.trim(), rel + ': missing page title');
  assert.ok(description, rel + ': missing meta description');
  assert.ok(canonical && canonical.startsWith(BASE + '/'), rel + ': missing or incorrect canonical URL');
  assert.ok(robotsTag && /index,follow/.test(robotsTag), rel + ': robots must allow indexing and following');
  assert.ok(h1, rel + ': missing H1');
  assert.ok(html.includes('adsbygoogle.js?client=' + PUBLISHER), rel + ': missing AdSense loader');
  assert.ok(html.includes('googletagmanager.com/gtag/js?id=G-K1RMFHCTEP'), rel + ': missing GA4 loader');
  assert.ok(html.includes('name="google-adsense-account" content="' + PUBLISHER + '"'), rel + ': missing AdSense account meta');
  assert.ok(sitemap.includes('<loc>' + canonical + '</loc>'), rel + ': canonical URL missing from sitemap');
  assert.ok(!html.includes('mureedabbas1.github.io/PDF-ENGINE'), rel + ': old GitHub Pages URL remains');

  const normalizedTitle = title.replace(/\s+/g, ' ').trim().toLowerCase();
  assert.ok(!seenTitles.has(normalizedTitle), rel + ': duplicate title with ' + seenTitles.get(normalizedTitle));
  seenTitles.set(normalizedTitle, rel);
  assert.ok(!seenCanonicals.has(canonical), rel + ': duplicate canonical with ' + seenCanonicals.get(canonical));
  seenCanonicals.set(canonical, rel);
}

assert.ok(robots.includes('Sitemap: ' + BASE + '/sitemap.xml'), 'robots.txt must reference the custom-domain sitemap');
assert.ok(sitemap.includes('<loc>' + BASE + '/</loc>'), 'Sitemap must include homepage');
assert.ok(fs.readFileSync('ads.txt', 'utf8').includes('google.com, pub-6162822251101594, DIRECT, f08c47fec0942fa0'), 'ads.txt publisher record is missing or incorrect');


const qrFiles = fs.readdirSync('.').filter(name => /^[a-z0-9-]+-qr-generator\.html$/i.test(name));
assert.equal(qrFiles.length, 30, 'Expected exactly 30 standalone QR generator pages');
for (const file of qrFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const canonical = (html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) || [])[1];
  assert.ok(canonical && sitemap.includes('<loc>' + canonical + '</loc>'), file + ': QR canonical missing from sitemap');
  assert.ok(html.includes('id="qr-learning-guide"'), file + ': missing original QR use and safety guide');
  assert.ok(html.includes('adsbygoogle.js?client=' + PUBLISHER), file + ': missing AdSense ownership loader');
  assert.ok(html.includes('name="google-adsense-account" content="' + PUBLISHER + '"'), file + ': missing AdSense account meta');
  assert.ok(!/pdfleo/i.test(html), file + ': old PDFLeo branding remains');
}
const qrHub = fs.readFileSync('qr-code-tools.html', 'utf8');
const qrLinks = Array.from(qrHub.matchAll(/href=["']\/([a-z0-9-]+-qr-generator\.html)["']/gi));
assert.equal(qrLinks.length, 30, 'QR directory must link to all 30 generators');
assert.ok(qrHub.includes('id="qr-usage-guide"'), 'QR directory is missing its selection and safety guide');
assert.ok(fs.readFileSync('index.html', 'utf8').includes('id="pdf-workflow-guide"'), 'Homepage is missing the PDF workflow guide');
console.log('QR generator pages checked: ' + qrFiles.length + ' unique landing pages, AdSense ownership code, sitemap links and original guidance.');
