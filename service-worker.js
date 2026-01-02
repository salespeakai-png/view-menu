const CACHE_NAME = "barfmalai-v2";

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

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* 🔥 SAFE FETCH STRATEGY */
self.addEventListener("fetch", event => {
  const req = event.request;

  /* API – NETWORK FIRST, FALLBACK TO CACHE */
  if (req.url.includes("script.google.com")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => {
          return caches.match(req).then(cached => {
            return cached || new Response(
              JSON.stringify({ error: "OFFLINE_NO_CACHE" }),
              { headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  /* STATIC FILES */
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
