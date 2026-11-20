/* Dawami PWA app shell. Bump CACHE_NAME for each published release. */
var CACHE_NAME = 'duwami-pwa-v19-1';
var APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
var OWN_CACHE_PREFIXES = ['duwami-pwa-', 'monzer-pwa-'];

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
        var isOurCache = OWN_CACHE_PREFIXES.some(function(prefix) { return key.indexOf(prefix) === 0; });
        if (isOurCache && key !== CACHE_NAME) {
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
