// Sleepy Service Worker - Offline PWA & Local Android App Support
const CACHE_NAME = "sleepy-v1";

// Precache list. Coordinator or postbuild script can inject asset list into self.__PRECACHE_MANIFEST__ or replace this array.
// __POSTBUILD_INJECT_ASSETS__
const PRECACHE_ASSETS = self.__PRECACHE_MANIFEST__ || [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Helper to resolve paths relative to Service Worker location
function resolveUrl(path) {
  return new URL(path, self.location.href).href;
}

// Installation: Precache local shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        const urlsToCache = PRECACHE_ASSETS.map((asset) => resolveUrl(asset));
        return Promise.allSettled(urlsToCache.map((url) => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

// Activation: Clean up older cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event handling
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Ignore non-http/https schemes (e.g. chrome-extension, data)
  if (!url.protocol.startsWith("http")) return;

  // Only handle same-origin requests or local assets
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  // Bypass API / server function calls
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn")) return;

  // Handle navigation requests (HTML pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedUrl = await cache.match(req);
          if (cachedUrl) return cachedUrl;

          // Fallback to cached shell (index.html or root)
          return (
            (await cache.match(resolveUrl("./index.html"))) ||
            (await cache.match(resolveUrl("./"))) ||
            (await cache.match("/")) ||
            Response.error()
          );
        })
    );
    return;
  }

  // Assets (JS, CSS, Images, Fonts, Manifest): Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse.ok || networkResponse.type === "opaque") {
            cache.put(req, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        // Trigger background revalidation for cached assets
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      // If not cached, await network response
      const networkResponse = await fetchPromise;
      return networkResponse || Response.error();
    })
  );
});
