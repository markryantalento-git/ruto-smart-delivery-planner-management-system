const CACHE_NAME = 'ruto-shell-v138';
const SHELL_FILES = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './password-reset.html',
  './manifest.webmanifest',
  './css/style.css?v=103',
  './assets/app-icon-180.png',
  './assets/app-icon-192.png',
  './assets/app-icon-512.png',
  './assets/support-qr.png',
  './js/config.js?v=5',
  './js/i18n.js?v=78',
  './js/auth-consent.js?v=6',
  './js/app.js?v=83',
  './js/vehicle-models.js?v=2',
  './js/vendor/three.core.js',
  './js/vendor/three.module.js',
  './js/routing.js',
  './js/store.js?v=6',
  './js/notifications.js?v=4',
  './js/updates.js?v=1',
  './js/fuel.js?v=4',
  './js/map3d.js?v=2',
  './js/nav.js?v=7',
  './js/places.js?v=3',
  './js/main.js?v=61',
  './js/pwa.js?v=3',
  './release.json',
  './js/waves.js?v=45',
  './js/reset.js?v=2',
  './js/ui-guard.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('ruto-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      }))
  );
});
