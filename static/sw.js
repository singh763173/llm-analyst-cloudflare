const CACHE_NAME = 'llmanalyst-v1';
const STATIC_ASSETS = [
  '/static/index.html',
  '/static/table.html',
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/favicon.ico',
  '/static/favicon-32x32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached || new Response('Offline'));
    })
  );
});
