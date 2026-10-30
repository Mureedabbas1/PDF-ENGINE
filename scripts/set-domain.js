const fs = require('node:fs');
const path = require('node:path');

const oldBase = 'https://mureedabbas1.github.io/PDF-ENGINE';
const newBase = 'https://pdfengine.site';
const measurementId = 'G-K1RMFHCTEP';
const publisherId = 'ca-pub-6162822251101594';
const adsScript = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + publisherId + '" crossorigin="anonymous"></script>';
const adsMeta = '<meta name="google-adsense-account" content="' + publisherId + '">';
const googleTag = [
  '<!-- Google Analytics 4 -->',
  '<script async src="https://www.googletagmanager.com/gtag/js?id=' + measurementId + '"></script>',
  '<script>',
  '  window.dataLayer = window.dataLayer || [];',
  '  function gtag(){dataLayer.push(arguments);}',
  "  gtag('js', new Date());",
  "  gtag('config', '" + measurementId + "');",
  '</script>'
].join('\n');

const exts = new Set(['.html', '.xml', '.txt', '.md']);
const today = new Date().toISOString().slice(0, 10);

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!['.git', 'node_modules'].includes(ent.name)) walk(path.join(dir, ent.name));
      continue;
    }
    if (!exts.has(path.extname(ent.name).toLowerCase())) continue;
    const file = path.join(dir, ent.name);
    const original = fs.readFileSync(file, 'utf8');
    let updated = original.split(oldBase).join(newBase);

    if (path.extname(ent.name).toLowerCase() === '.html') {
      const normalizedPath = file.split(path.sep).join('/');
      const isRootQrPage = !normalizedPath.includes('/') && /^[a-z0-9-]+-qr-generator\.html$/i.test(ent.name);
      const isQrHub = !normalizedPath.includes('/') && ent.name === 'qr-code-tools.html';
      const isQrGenerator = isRootQrPage || normalizedPath === 'tools/qr-code-generator.html';

      if (isRootQrPage || isQrHub) {
        updated = updated.replace(/PDFLEO QR CODE STUDIO/gi, 'PDF ENGINE QR CODE STUDIO');
        updated = updated.replace(/pdfleo/gi, 'pdfengine');
      }

      updated = updated.replace(/href=["']\/security\.html["']>Security/gi, 'href="/privacy.html">Privacy & Security');

      // Check for the real GA4 loader URL; a measurement ID in policy copy is not a tag.
      if (!updated.includes('googletagmanager.com/gtag/js?id=' + measurementId)) {
        updated = updated.replace(/<head(?:\s[^>]*)?>/i, match => match + '\n' + googleTag);
      }

      if (!updated.includes('name="google-adsense-account"')) {
        updated = updated.replace(/<head(?:\s[^>]*)?>/i, match => match + '\n' + adsMeta);
      }
      if (!updated.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
        updated = updated.replace(/<head(?:\s[^>]*)?>/i, match => match + '\n' + adsScript);
      }

      if (isQrGenerator && !updated.includes('application/ld+json')) {
        const title = (updated.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || 'QR Code Generator';
        const description = (updated.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1] || 'Create a QR code online with PDF Engine.';
        const canonical = (updated.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || newBase + '/' + ent.name;
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: title.replace(/&amp;/g, '&').replace(/<[^>]*>/g, '').trim(),
          url: canonical,
          description,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any (web browser)',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          publisher: { '@type': 'Organization', name: 'PDF Engine', url: newBase + '/' }
        };
        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: newBase + '/' },
            { '@type': 'ListItem', position: 2, name: 'QR Code Tools', item: newBase + '/qr-code-tools.html' },
            { '@type': 'ListItem', position: 3, name: schema.name, item: canonical }
          ]
        };
        const jsonLd = '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>\n<script type="application/ld+json">' + JSON.stringify(breadcrumb) + '</script>';
        updated = updated.replace(/<\/head>/i, jsonLd + '\n</head>');
      }

      if (isQrHub && !updated.includes('"@type":"CollectionPage"')) {
        const links = Array.from(updated.matchAll(/<a[^>]+class=["']qr-card["'][^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<h3>([\s\S]*?)<\/h3>/gi));
        const items = links.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: m[2].replace(/<[^>]*>/g, '').trim(),
          url: new URL(m[1], newBase + '/').href
        }));
        const collection = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: '30 Free QR Code Generators Online',
          url: newBase + '/qr-code-tools.html',
          description: 'Browse 30 free QR code generators for websites, WiFi, text, email, contacts, social media, payments and more.',
          mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items }
        };
        const jsonLd = '<script type="application/ld+json">' + JSON.stringify(collection) + '</script>';
        updated = updated.replace(/<\/head>/i, jsonLd + '\n</head>');
      }
    }

    if (path.basename(file).toLowerCase() === 'sitemap.xml') {
      updated = updated.replace(/<url>([\s\S]*?)<\/url>/gi, (whole, body) => {
        if (/<lastmod>/i.test(body)) return whole;
        return '<url>' + body.replace(/<\/loc>/i, '</loc><lastmod>' + today + '</lastmod>') + '</url>';
      });
    }

    if (original !== updated) fs.writeFileSync(file, updated, 'utf8');
  }
}

walk('.');
console.log('Applied canonical domain, GA4, AdSense, QR branding/schema, and sitemap lastmod fixes.');
