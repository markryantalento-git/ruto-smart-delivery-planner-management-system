const CACHE_NAME = 'ruto-shell-v79';
const SHELL_FILES = [
  './',
  './index.html',
  './password-reset.html',
  './manifest.webmanifest',
  './css/style.css?v=67',
  './assets/app-icon-180.png',
  './assets/app-icon-192.png',
  './assets/app-icon-512.png',
  './assets/support-qr.png',
  './js/config.js',
  './js/i18n.js?v=53',
  './js/app.js?v=54',
  './js/routing.js',
  './js/store.js?v=4',
  './js/fuel.js',
  './js/nav.js',
  './js/assistant.js?v=45',
  './js/main.js?v=50',
  './js/pwa.js',
  './js/waves.js?v=45',
  './js/reset.js',
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
