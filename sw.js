importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDzy8TlMeQOAoOGKE_66wRHkQPFeBc4_s4",
  authDomain: "ramex-talep.firebaseapp.com",
  databaseURL: "https://ramex-talep-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ramex-talep",
  storageBucket: "ramex-talep.firebasestorage.app",
  messagingSenderId: "698447969770",
  appId: "1:698447969770:web:283765641281ced3af8693"
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  var n = payload.notification || {};
  var title = n.title || 'RAMEX Portal';
  var options = {
    body: n.body || 'Yeni bildirim',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200],
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/ramex-portal/');
    })
  );
});

var CACHE_NAME = 'ramex-portal-v3';
var ASSETS = [
  '/ramex-portal/',
  '/ramex-portal/index.html',
  '/ramex-portal/manifest.json',
  '/ramex-portal/icon-192.png',
  '/ramex-portal/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('firebaseio.com') >= 0 || e.request.url.indexOf('googleapis.com') >= 0) return;
  e.respondWith(
    fetch(e.request).catch(function() { return caches.match(e.request); })
  );
});
