// Daily Reflection — Service Worker
// Purpose: cache the app shell + local data files so the app opens
// instantly and works offline after the first visit. The Qur'an, hadith,
// and wisdom content are plain same-origin JSON files, so caching them
// here is enough — no external CDN calls to worry about.

const CACHE_NAME = 'daily-reflection-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './data/quran.json',
  './data/hadith.json',
  './data/wisdom.json'
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
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(function () {
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
