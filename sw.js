// Daily Reflection — Service Worker
// Purpose: make the app (including the full Qur'an, once loaded) work
// with NO internet connection after the first successful online visit.
//
// Strategy:
//  - App shell (index.html, manifest.json): cache-first, so the app
//    itself always opens instantly offline.
//  - Qur'an CDN requests (cdn.jsdelivr.net): cache-first too, but each
//    one is only ~5-10KB per chapter and there are 114 of them — once
//    they've all been fetched once (first online visit), they stay in
//    Cache Storage indefinitely (no expiry) and are served instantly
//    with zero network calls on every future visit, online or not.

const CACHE_NAME = 'daily-reflection-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const request = event.request;

  // Only handle GET requests; let everything else pass through normally.
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;

      return fetch(request).then(function (response) {
        // Only cache successful, basic/CORS-OK responses.
        if (!response || response.status !== 200) return response;

        const isAppShell = request.url.indexOf(self.location.origin) === 0;
        const isQuranCDN = request.url.indexOf('cdn.jsdelivr.net/npm/quran-json') !== -1;

        if (isAppShell || isQuranCDN) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(function () {
        // Nothing cached and no network — nothing more we can do for
        // this particular request; the app's own fallback data (for
        // the Qur'an pool) handles this gracefully.
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
