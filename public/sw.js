// Sleepy offline support: caches the app shell and assets so the diary works without internet.
const CACHE = "lull-v1";
const SHELL = ["/", "/history", "/trends"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;
  if (sameOrigin && (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn"))) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Assets and fonts: serve cached copy, refresh in the background.
  event.respondWith(
    caches.open(CACHE).then(async (c) => {
      const cached = await c.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok || res.type === "opaque") c.put(req, res.clone());
          return res;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    }),
  );
});
