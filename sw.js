// При каждом обновлении index.html меняйте версию (например, 'tableapp-v2', 'tableapp-v3' и т.д.)
const CACHE_NAME = 'tableapp-v2';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// АКТИВАЦИЯ: Удаляем старый кэш ('tableapp-v1'), когда активируется новый воркер
self.addEventListener('activate', (e) => {
  e.waitUntil(
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
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

// ВАЖНО: Слушаем команду от index.html, чтобы немедленно переключиться на новую версию
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
