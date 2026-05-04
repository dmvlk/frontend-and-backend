const CACHE_NAME = 'coffee-shop-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-16.png',
    '/icons/icon-32.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-256.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    if (event.request.method === 'GET' && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                return new Response('Offline');
            })
    );
});

self.addEventListener('push', (event) => {
    let data = {
        title: 'Кофейная лавка',
        body: 'Новое уведомление',
        icon: '/icons/icon-128.png',
        badge: '/icons/icon-96.png',
        data: {}
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: data.data || {},
        requireInteraction: true,
        tag: 'coffee-shop-notification'
    };
    
    if (data.data && data.data.type === 'sale') {
        options.actions = [
            {
                action: 'remind',
                title: 'Напомнить через 5 минут'
            }
        ];
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'remind') {
        setTimeout(() => {
            self.registration.showNotification(
                event.notification.title,
                {
                    body: event.notification.body,
                    icon: event.notification.icon,
                    badge: event.notification.badge,
                    data: event.notification.data,
                    requireInteraction: false,
                    tag: 'coffee-shop-reminder'
                }
            );
        }, 5 * 60 * 1000);
    } else {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});