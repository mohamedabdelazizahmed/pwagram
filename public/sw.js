var CACHE_STATIC_NAME = 'static-10';
var CACHE_DYNAMIC_NAME = 'dynamic-4';

//give me access the sw background proceess
self.addEventListener('install', function (event) {
    //console.log('[sw] Installing service worker ...' ,event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell ....');
                // cache.add('/src/js/app.js');
                // Cache Multiple Files with addAll
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/css/help.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                ]);
            })
    )
});

// close tab and then reload  new website again 
self.addEventListener('activate', function (event) {
    console.log('[sw] Activiating service worker ...', event);
    // Different Cache Versions Cleanup
    caches.keys()
        .then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('[sw] Removing Old Cache ...', key);
                    return caches.delete(key);
                }
            }))
        })
    return self.clients.claim();
})


// self.addEventListener('fetch', function (event) {
//     console.log('[sw] Fetching service worker ...', event);
//     // Retrieving Items from the Cache...
//     event.respondWith(
//         caches.match(event.request)
//             .then(function (response) {
//                 if (response) {
//                     return response;
//                 } else {
//                     // send the original request
//                     return fetch(event.request)
//                         .then(function (res) {
//                             // create a dynammic cahce
//                             return caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function (cache) {
//                                     cache.put(event.request.url, res.clone());
//                                     return res;
//                                 })
//                         })
//                         //Handling Errors
//                         .catch(function (err) {
//                             console.log(err);
//                             // handeling offline page 
//                             return caches.open(CACHE_STATIC_NAME)
//                                 .then(function (cache) {
//                                     return cache.match('/offline.html');
//                                 });
//                         });
//                 }
//             })
//     )
// })










//  078  Strategy Cache Only
// self.addEventListener('fetch', function (event) {
//     console.log('[sw] Fetching service worker ...', event);
//     // Retrieving Items from the Cache...
//     event.respondWith(
//         caches.match(event.request)
//     );
// })


// 079 Strategy Network Only
// self.addEventListener('fetch', function (event) {
//     console.log('[sw] Fetching service worker ...', event);
//     event.respondWith(
//         fetch(event.request)
//     );
// })




//  080 Strategy Network with Cache Fallback -->[ Network first] // no the best soluation 
// self.addEventListener('fetch', function (event) {
//     console.log('[sw] Fetching service worker ...', event);
//     event.respondWith(
//         fetch(event.request)
//             .then(function (res) {
//                 // create a dynammic cahce
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function (cache) {
//                         cache.put(event.request.url, res.clone());
//                         return res;
//                     })
//             })
//             .catch(function (err) {
//                 return caches.match(event.request)

//             })
//     );
// })