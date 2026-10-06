/* BookMyShoot service worker.
   Keeps the shell available when the network drops, and never caches pages
   that show someone's own data. */
const VERSION = "bms-v1";
const OFFLINE_URL = "/offline";
const SHELL = [OFFLINE_URL, "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];
const PRIVATE = ["/dashboard", "/admin", "/account", "/messages", "/notifications", "/api/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE.some((path) => url.pathname.startsWith(path))) return;

  // Photos and icons: use the cache first, they never change under the same name.
  if (url.pathname.startsWith("/media/") || url.pathname.startsWith("/icon-")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // Pages: always try the network, fall back to the offline page.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
