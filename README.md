# PDF Engine

**Every PDF tool. One powerful engine.**

Responsive, browser-first PDF and utility tools. Supported file operations run in the browser on your device; this static site does not provide server-side document storage or require an account.

## Live website

https://pdfengine.site/

## Tool collection

The homepage presents 20 tools: Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Rotate PDF, Add Page Numbers, Add Watermark, Word Counter, Age Calculator, Image Compressor, QR Code Generator, Extract PDF Pages, Remove PDF Pages, Reorder PDF Pages, PDF to Text, Crop PDF, Grayscale PDF, Flatten PDF Forms, and Edit PDF Metadata.

## Privacy and limitations

- Supported file operations are designed to process selected files locally in the browser. Third-party CDN requests still occur to load libraries and other site resources.
- PDF to Text extracts selectable text; scanned image-only pages require OCR, which is not included in this tool.
- Crop PDF changes the visible crop box and does not securely erase hidden page content.
- Grayscale output is image-based and may not preserve selectable text.
- Flatten PDF Forms supports existing supported fillable fields only.
- Compression uses structural rewriting and object streams; it does not recompress embedded images and may not reduce every file.
- Large, encrypted, damaged or unusual files may fail or use substantial device memory. Keep an original copy and inspect every result.
- QR payment and bank payloads are data encodings, not proof that a payment is valid or complete. Verify with the receiving provider before use.

## Analytics and advertising

The current homepage and selected site pages contain Google Analytics 4 (G-K1RMFHCTEP) and Google AdSense publisher code (ca-pub-6162822251101594). Code presence does not mean ads are approved or currently being served. Review the live Privacy Policy and confirm any consent-management requirements in the relevant Google account settings before enabling advertising for regions where consent is required.

## Deployment and quality checks

GitHub Pages deploys the repository from the `main` branch through `.github/workflows/pages.yml`. The workflow runs static smoke and SEO checks before deployment. Review the Actions tab after each change and test important tools on current desktop and mobile browsers.

## SEO and support files

- `robots.txt` and `sitemap.xml`
- Canonical and Open Graph metadata
- `privacy.html`, `terms.html`, `about.html`, `contact.html` and `faq.html`
- Tool and guide landing pages

## Local development

Open `index.html` through a local static server for a closer match to GitHub Pages. Some browser security rules can limit features when opened directly from the filesystem.

## License

No open-source license is currently specified. All rights reserved unless a license is added to this repository.
