# PDF Engine

**Every PDF tool. One powerful engine.**

A responsive, browser-first PDF tools website. Files selected for supported operations are processed locally in the browser; no account is required.

## Deploy with GitHub Pages

This repository includes a GitHub Actions workflow that publishes the root of the `main` branch to GitHub Pages. In GitHub, open **Settings → Pages** and ensure **Build and deployment → Source** is set to **GitHub Actions**.

After the first successful workflow, the site should be available at:

https://mureedabbas1.github.io/PDF-ENGINE/

## Current tools

- Merge PDF
- Split PDF by page ranges
- Rotate PDF pages
- Add page numbers
- Add text watermark
- JPG/PNG to PDF
- PDF structure rewrite (not full image compression)
- Word counter
- Age calculator
- Image compression

PDF operations use pdf-lib from a CDN. Large, encrypted, malformed, or unusual PDFs may fail. Test outputs before relying on them.

## Before production

- Self-host and pin JavaScript dependencies.
- Replace the placeholder contact email.
- Add a final privacy policy and terms reviewed for the services you actually use.
- Add a custom domain, canonical URL, sitemap and robots.txt when ready.
- Configure and disclose analytics/advertising only after those services are actually installed.
- Test the complete tool flow on mobile and desktop.
