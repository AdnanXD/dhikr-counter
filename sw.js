/* Dhikr Counter service worker. Bump CACHE whenever any file below changes (see README). */
var CACHE = 'dhikr-v6-1';
var PRECACHE = [
  '/', '/index.html', '/manifest.webmanifest', '/privacy.html',
  '/icon-192.png', '/icon-512.png', '/maskable-192.png', '/maskable-512.png',
  '/apple-touch-icon.png', '/favicon-32.png', '/favicon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    /* Network first so updates arrive when online; fall back to the cache when offline. */
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok && !url.search) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('/index.html'); });
      })
    );
    return;
  }

  /* Everything else: cache first, then network (and remember it). */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
