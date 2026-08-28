// Daily Reflection — Service Worker
// Purpose: cache the app shell + local data files so the app opens
// instantly and works offline after the first visit. Hadith and wisdom
// content are plain same-origin JSON files, so caching them here is
// enough. The Qur'an verse itself is fetched live from ummahapi.com on
// every reveal (not cached here on purpose — it needs to stay fresh/
// random), with a small embedded fallback in index.html if that request
// fails, e.g. offline.

const CACHE_NAME = 'daily-reflection-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './data/hadith.json',
  './data/wisdom.json',
  './data/motivation.json'
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

  // The live Qur'an/tafsir/audio requests must always hit the network —
  // caching them would freeze the "random" verse as whatever came back
  // the very first time, which defeats the entire point.
  if (request.url.indexOf('ummahapi.com') !== -1 ||
      request.url.indexOf('everyayah.com') !== -1 ||
      request.url.indexOf('quranicaudio.com') !== -1) {
    event.respondWith(fetch(request));
    return;
  }

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
