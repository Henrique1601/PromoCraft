// PromoCraft PWA Service Worker v2.2.0
const CACHE_NAME = 'promocraft-cache-v2.2.0';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo-mark.png',
  '/logo.png',
  '/favicon.ico',
];

// Instalação: pré-carrega assets críticos de shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-carregar alguns assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
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

// Interceptação de requisições:
// - Imagens e assets estáticos: Cache-First com Stale-While-Revalidate
// - Navegação de páginas e APIs: Network-First com fallback de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas métodos GET são cacheados
  if (request.method !== 'GET') return;

  // Ignorar extensões do navegador ou esquemas não-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Estratégia Cache-First para Imagens e Mídias
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif|woff2?|ttf)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Se offline e imagem falhar, retorna nada ou fallback
            return cachedResponse;
          });
      })
    );
    return;
  }

  // Estratégia Network-First para páginas e dados
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Se for requisição de navegação HTML e estiver offline
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response(JSON.stringify({ error: 'Você está offline no momento.' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        });
      })
  );
});
