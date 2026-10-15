const fs = require('node:fs');
const path = require('node:path');
const oldBase = 'https://mureedabbas1.github.io/PDF-ENGINE';
const newBase = 'https://pdfengine.site';
const exts = new Set(['.html', '.xml', '.txt', '.md']);
function walk(dir) {
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    if (ent.isDirectory()) { if (!['.git','node_modules'].includes(ent.name)) walk(path.join(dir,ent.name)); continue; }
    if (!exts.has(path.extname(ent.name).toLowerCase())) continue;
    const p=path.join(dir,ent.name), s=fs.readFileSync(p,'utf8'), t=s.split(oldBase).join(newBase);
    if (s!==t) fs.writeFileSync(p,t,'utf8');
  }
}
walk('.');
console.log('Updated canonical, Open Graph, internal links, sitemap and robots URLs to https://pdfengine.site');
