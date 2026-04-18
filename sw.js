const CACHE_NAME = 'a10-sim-v1';

const ASSETS = [
  './',
  'index.html',
  'index.js',
  'index.wasm',
  'index.pck',
  'index.png',
  'index.icon.png',
  'index.apple-touch-icon.png',
  'index.audio.worklet.js',
  'index.audio.position.worklet.js',
  'manifest.json',
];

// Cache all assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Serve from cache; add COOP/COEP headers required for SharedArrayBuffer
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const source = cached || fetch(event.request);
      return Promise.resolve(source).then((response) => {
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      });
    })
  );
});

// Godot sends 'update' to activate a waiting service worker
self.addEventListener('message', (event) => {
  if (event.data === 'update') {
    self.skipWaiting();
  }
});
