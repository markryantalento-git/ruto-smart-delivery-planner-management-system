const CACHE_NAME = 'ruto-shell-v94';
const SHELL_FILES = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './password-reset.html',
  './manifest.webmanifest',
  './css/style.css?v=76',
  './assets/app-icon-180.png',
  './assets/app-icon-192.png',
  './assets/app-icon-512.png',
  './assets/support-qr.png',
  './js/config.js?v=1',
  './js/i18n.js?v=64',
  './js/auth-consent.js?v=3',
  './js/app.js?v=65',
  './js/routing.js',
  './js/store.js?v=5',
  './js/notifications.js?v=3',
  './js/updates.js?v=1',
  './js/fuel.js?v=2',
  './js/nav.js',
  './js/assistant.js?v=51',
  './js/main.js?v=55',
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
