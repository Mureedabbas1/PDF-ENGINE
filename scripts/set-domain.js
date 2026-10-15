const fs = require('node:fs');
const path = require('node:path');
const oldBase = 'https://mureedabbas1.github.io/PDF-ENGINE';
const newBase = 'https://pdfengine.site';
const measurementId = 'G-K1RMFHCTEP';
const googleTag = `
<!-- Google Analytics (Google tag) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;
const exts = new Set(['.html', '.xml', '.txt', '.md']);
function walk(dir) {
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    if (ent.isDirectory()) { if (!['.git','node_modules'].includes(ent.name)) walk(path.join(dir,ent.name)); continue; }
    if (!exts.has(path.extname(ent.name).toLowerCase())) continue;
    const p=path.join(dir,ent.name);
    const original=fs.readFileSync(p,'utf8');
    let updated=original.split(oldBase).join(newBase);
    if (path.extname(ent.name).toLowerCase() === '.html' && !updated.includes(measurementId)) {
      updated=updated.replace(/<head(?:\s[^>]*)?>/i, match => match + googleTag);
    }
    if (original!==updated) fs.writeFileSync(p,updated,'utf8');
  }
}
walk('.');
console.log('Applied custom-domain SEO URLs and Google Analytics tag ' + measurementId + ' to HTML pages.');