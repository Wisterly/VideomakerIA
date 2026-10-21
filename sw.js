const CACHE_NAME = 'videomaker-ia-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/assets/previews/portrait_smile.jpg',
  '/assets/previews/portrait_smile.mp4',
  '/assets/previews/golden_hour.jpg',
  '/assets/previews/golden_hour.mp4',
  '/assets/previews/cyberpunk_neon.jpg',
  '/assets/previews/cyberpunk_neon.mp4',
  '/assets/previews/action_turn.jpg',
  '/assets/previews/action_turn.mp4',
  '/assets/previews/nature_wind.jpg',
  '/assets/previews/nature_wind.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
