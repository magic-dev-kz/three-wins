/* Three Wins — Service Worker
   Cache-first strategy for all app shell assets.
   localStorage (wins data) lives in the browser and is never touched by SW.
*/

var CACHE_NAME = 'three-wins-v23';
var APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './favicon.svg'
];

// Install: pre-cache app shell
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  // Claim all clients immediately so new SW controls open tabs
  self.clients.claim();
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', function (e) {
  // Only handle GET requests for same-origin resources
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;

      return fetch(e.request).then(function (response) {
        // Cache successful same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          var cloned = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, cloned);
          });
        }
        return response;
      });
    })
  );
});
