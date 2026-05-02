const CACHE_NAME = 'coffee-shop-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/css/style.css',
    '/manifest.json',
    '/icons/icon-16.png',
    '/icons/icon-32.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-256.png',
    '/icons/icon-512.png',
    '/images/brazil-sul-de-minas.webp',
    '/images/costa-rica-san-jose.webp',
    '/images/indonesia-sumatra-gayo.webp',
    '/images/ethiopia-irgacheff.webp',
    '/images/ethiopia-oromia.webp',
    '/images/colombia-bogota.webp',
    '/images/peru-alto-pirias.webp',
    '/images/bolivia-karanavi.webp',
    '/images/brazil-tres-pontas.webp',
    '/images/brazil-cerrado.webp',
    '/images/peru-victoria-ramos.webp',
    '/images/peru-geisha-felipe-cauachinchay.webp'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});