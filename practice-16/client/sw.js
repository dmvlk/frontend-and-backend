const CACHE_NAME = 'coffee-v1';
const ASSETS = ['/', '/index.html', '/app.js', '/manifest.json'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('push', e => {
    let data = { title: 'Кофейная лавка', body: 'Новый кофе добавлен' };
    if (e.data) try { data = e.data.json(); } catch(e) { data.body = e.data.text(); }
    e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/' }));
});const CACHE_NAME = 'coffee-v1';
const ASSETS = ['/', '/index.html', '/app.js', '/manifest.json'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('push', e => {
    let data = { title: 'Кофейная лавка', body: 'Новый кофе добавлен' };
    if (e.data) try { data = e.data.json(); } catch(e) { data.body = e.data.text(); }
    e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/' }));
});