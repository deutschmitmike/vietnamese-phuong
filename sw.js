// Offline cache for the app (Mike, 11 Oct 2026): practise without a connection, progress syncs later.
// Phương's recordings: cache first (they never change under the same name; a corrected line gets a new build anyway,
// and the cache is renewed with every new version). The page: network first, the cached copy only when offline.
// version.json and Firebase always go to the network.
const CACHE = "phuong-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.endsWith("version.json")) return;
  if (url.pathname.includes("/clips/")) {
    e.respondWith(caches.open(CACHE).then(c => c.match(url.pathname).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok && r.status === 200) c.put(url.pathname, r.clone());
      return r;
    }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./"))));
});
