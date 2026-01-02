const CACHE_NAME = "barfmalai-v1";

const STATIC_ASSETS = [
  "./",
  "index.html",
  "menu.html",
  "style.css",
  "app.js",
  "manifest.json",
  "assets/logo1.png",
  "assets/placeholder.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  const req = event.request;

  /* Google Apps Script API – NETWORK FIRST */
  if (req.url.includes("script.google.com")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  /* STATIC FILES – CACHE FIRST */
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
