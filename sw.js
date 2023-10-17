//Los archivos propios que tengamos en nuestra aplicación, como html, css, js, etc.
const STATIC = 'staticv2';
const INMUTABLE = 'inmutablev1';
const DYNAMIC = 'dynamicv1';
const APP_SHELL = [
    '/',
    '/index.html',
    'js/app.js',
    'img/flash.webp',
    'css/style.css',
    'img/flash.webp'
];

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    '/pages/offline.html'
];
self.addEventListener('install', (e) => {
    console.log('Instalando...');
    const staticCache = caches.open(STATIC)
        .then(cache => {
            cache.addAll(APP_SHELL);
        });
    const inmutableCache = caches.open(INMUTABLE)
        .then(cache => {
            cache.addAll(APP_SHELL_INMUTABLE);
        });
    e.waitUntil(Promise.all([staticCache, inmutableCache]));
    //e.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('Activado');
});

/*Hacer por medio de estrategias de cache, mostrar la página  de html con el nombre offline cuando no tengamos internet */
self.addEventListener('fetch', (e) => {
    //5. Network with Offline Fallback
    const source = fetch(e.request)
        .then(res => {
            return res;
        })
        .catch(err => {
            return caches.match(e.request).then(response => {
                if (response) {
                    return response;
                } else if (e.request.headers) {
                    console.log(e.request.headers)
                    return caches.match('/pages/offline.html')
                }
            });
        });
    e.respondWith(source);
    //5. Cache and network race
    // const source = new Promise((resolve, reject) => {
    //     let flag = false;
    //     const failsOnce = () => {
    //     //Si falló
    //         if(flag){
    //             if(/\.(png|jpg)/i.test(e.request.url)){
    //                 resolve(catches.match('/img/notfound.png'));
    //             }else{
    //                 reject('No existe');
    //             }
    //         }else{
    //             flag = true;
    //         };
    //     }

    //     fetch(e.request).then(resFetch => {
    //         resFetch.ok ? resolve(resFetch) : failsOnce();
    //     }).catch(failsOnce);
    //     caches.match(e.request).then(sourceCache => {
    //         sourceCache.ok ? resolve(sourceCache) : failsOnce();
    //     }).catch(failsOnce);
    // });

    // e.respondWith(source);

    //4.Cache with network update
    //Primero todo lo devuelve del caché
    //Después actualiza el recurso
    //Rendimiento crítico. Siempre se queda un paso atrás
    // const source = catches.open(STATIC).then(cache => {
    //     fetch(e.request).then(resFetch => {
    //         cache.put(e.request, resFetch);
    //     });
    //     return cache.match(e.request);
    // });
    // e.respondWith(source);

    //3. Network with cache fallback
    // const source = fetch(e.request)
    // .then(res =>{
    //     if (!res) throw Error("NotFound");
    //     caches.open(DYNAMIC).then(cache =>{
    //         cache.put( e.request, res );
    //     });
    //     return res.clone();
    // }).catch(err =>{
    //     return caches.match(e.request);
    // });
    // e.respondWith(source);
    //2. Cache with network fallback
    // const source = caches.match(e.request)
    // .then(res =>{
    //     if (res) return res;
    //     return fetch(e.request).then(resFetch =>{
    //         caches.open(DYNAMIC).then(cache => {
    //             cache.put( e.request, resFetch );
    //         });
    //         return resFetch.clone();
    //     });
    // });
    // e.respondWith(source);
    //1. Cache Only
    //e.respondWith(caches.match(e.request));
});

const deleteOldCache = () => {
    return caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
            if (cacheName !== STATIC && cacheName !== INMUTABLE && cacheName !== DYNAMIC) {
                return caches.delete(cacheName);
            }
        }));
    });
}

deleteOldCache();