const CACHE_NAME = 'ramex-portal-v2';
const ASSETS = [
  '/ramex-portal/',
  '/ramex-portal/index.html',
  '/ramex-portal/manifest.json',
  '/ramex-portal/icon-192.png',
  '/ramex-portal/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
