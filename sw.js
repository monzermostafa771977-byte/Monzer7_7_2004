/* Monzer offline app shell cache. Bump CACHE_NAME when publishing a new app version. */
var CACHE_NAME = 'monzer-pwa-v5';
var APP_SHELL = ['./', './index.html'];
var OWN_CACHE_PREFIX = 'monzer-pwa-';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(APP_SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key.indexOf(OWN_CACHE_PREFIX) === 0 && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var requestURL = new URL(request.url);

  // Keep APIs, model hosts, and all other cross-origin requests outside this shell cache.
  if (request.method !== 'GET' || requestURL.origin !== self.location.origin) return;

  event.respondWith((async function() {
    var cache = await caches.open(CACHE_NAME);
    var cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      var response = await fetch(request);
      if (response && response.ok && response.type === 'basic') {
        await cache.put(request, response.clone()).catch(function() {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        var fallbackURL = new URL('./index.html', self.registration.scope).href;
        var fallback = await cache.match(fallbackURL);
        if (fallback) return fallback;
      }
      return new Response('هذا المورد غير متاح دون اتصال بالإنترنت.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
