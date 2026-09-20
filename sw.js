const CACHE_NAME = 'tableapp-v3'; // Поменяли на v3

// Кэшируем только тяжелые статичные ресурсы. 
// Исключаем '.', чтобы не зацикливать index.html в жестком кэше!
const ASSETS = [
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация и полная очистка старых версий кэша
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

// Стратегия Network First для HTML страниц, и Cache First для картинок
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Если запрашивают главную страницу (или index.html) — СНАЧАЛА ИДЕМ В СЕТЬ
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Если сеть доступна, сохраняем свежую копию в кэш и отдаем пользователю
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return response;
        })
        .catch(() => {
          // Если интернета нет (оффлайн) — достаем из кэша
          return caches.match(e.request);
        })
    );
  } else {
    // Для картинок и манифеста оставляем быструю работу из кэша
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});

// Быстрая активация без ожидания
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
