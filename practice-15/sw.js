const CACHE_NAME = 'coffee-shop-v3';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/css/style.css',
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
                keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.origin !== location.origin) return;
    
    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request)
                .then(networkRes => {
                    const resClone = networkRes.clone();
                    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        cache.put(event.request, resClone);
                    });
                    return networkRes;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(cached => cached || caches.match('/content/home.html'));
                })
        );
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});