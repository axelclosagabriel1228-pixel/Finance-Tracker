const CACHE = 'budsync-shell-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg']
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())) })
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response }).catch(() => caches.match('/index.html')))) })
self.addEventListener('sync', (event) => { if (event.tag === 'budsync-queue') event.waitUntil(self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage({ type: 'SYNC_REQUESTED' })))) })
