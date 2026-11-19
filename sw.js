const CACHE_NAME = "pdf-engine-pwa-v2";
const OFFLINE_URL = "/offline.html";
const NAVIGATION_TIMEOUT_MS = 3500;

// Same-origin files that make the app open offline.
const APP_SHELL = [
  "/", "/index.html", OFFLINE_URL, "/manifest.webmanifest", "/mobile.css", "/logo.svg",
  "/backgrond.webp", "/welcome-bg-mobile.jpg",
  "/icons/icon-192.png", "/icons/icon-512.png", "/icons/pdf-engine-512.svg"
];

// Third-party libraries the tools need. They are cached after the first online visit
// so the tools keep working offline.
const CDN_LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
];

function cacheable(response) {
  // ok responses, or opaque ones (cross-origin scripts loaded without CORS)
  return response && (response.ok || response.type === "opaque");
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // allSettled: one missing file must not break the whole install.
    await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    await Promise.allSettled(CDN_LIBS.map(async (url) => {
      const response = await fetch(new Request(url, { mode: "no-cors" }));
      if (cacheable(response)) await cache.put(url, response);
    }));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("pdf-engine-") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  const network = fetch(request).then((response) => {
    // Only store good pages. Never cache a 404 or an error page.
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  });
  const cached = await cache.match(request);
  if (!cached) {
    try { return await network; }
    catch (err) { return (await cache.match(OFFLINE_URL)) || Response.error(); }
  }
  // Slow or no network: show the saved page after a short wait.
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS));
  try { return await Promise.race([network, timeout]); }
  catch (err) { return cached; }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // Only the library CDN is cached. Ads and analytics always go straight to the network.
    if (url.hostname !== "cdnjs.cloudflare.com") return;
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (cacheable(response)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }))
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
