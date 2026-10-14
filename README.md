# PDF Engine

**Every PDF tool. One powerful engine.**

Responsive, browser-first PDF utilities. Selected files are processed in the browser for supported operations; no sign-up or server-side file storage is provided by this static site.

## Live site

https://mureedabbas1.github.io/PDF-ENGINE/

## Tools

- Merge PDF
- Split PDF by page ranges
- Rotate PDF pages
- Add page numbers
- Add text watermark
- JPG/PNG to PDF
- PDF pages to JPG images (downloaded as ZIP)
- Basic PDF structural optimization (not full image recompression)
- Word counter
- Age calculator
- Image compressor
- QR code generator

## Deploy

A GitHub Actions workflow in `.github/workflows/pages.yml` deploys the repository root to GitHub Pages on pushes to `main`. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. Confirm the workflow succeeds in the Actions tab before sharing the site.

## SEO files

- `robots.txt`
- `sitemap.xml`
- Canonical and Open Graph metadata
- Standalone `privacy.html` and `terms.html`

## Known limitations / production checklist

- PDF tools use third-party CDN libraries; network access is required to load them.
- Browser support and large/encrypted/unusual PDFs still require real-device testing.
- PDF optimization uses PDF structural rewrite and object streams; it does not recompress embedded images and may not shrink every file.
- Image-to-PDF currently supports JPG/JPEG and PNG.
- No automated browser test suite is included yet.
- Analytics and AdSense are not configured; add them only after completing required privacy disclosures and consent handling.
- Before using a custom domain, update canonical URLs, sitemap URLs and robots.txt.
- Review legal text for your actual business and applicable local requirements.
