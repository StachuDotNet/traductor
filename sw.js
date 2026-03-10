const CACHE = 'traductor-v9';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  // Broadcast version to all open pages
  self.clients.matchAll().then(clients =>
    clients.forEach(c => c.postMessage({ version: CACHE }))
  );
});

self.addEventListener('message', e => {
  if (e.data.getVersion) {
    e.source.postMessage({ version: CACHE });
  }
});

self.addEventListener('fetch', e => {
  // Network-first for everything — fall back to cache only if offline
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
