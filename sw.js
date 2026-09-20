// При каждом обновлении index.html меняйте эту версию (например, v4, v5 и т.д.)
const CACHE_NAME = 'tableapp-v3'; 

// Кэшируем только тяжелую статику. index.html сюда НЕ добавляем!
const ASSETS = [
  'manifest.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// АКТИВАЦИЯ: Полностью удаляем старые версии кэша из памяти смартфона
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

// Перехват сетевых запросов
self.addEventListener('fetch', (e) => {
  // Важно: создаем объект URL, чтобы ваш код ниже работал корректно
  const url = new URL(e.request.url);

  // Если запрашивают главную страницу — СНАЧАЛА ИДЕМ В СЕТЬ И ИГНОРИРУЕМ КЭШ БРАУЗЕРА
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
    e.respondWith(
      // cache: 'reload' заставляет браузер пробить свой HTTP-кэш и взять файл прямо с сервера!
      fetch(e.request, { cache: 'reload' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return response;
        })
        .catch(() => {
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

// Быстрая активация без ожидания по команде из index.html
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
