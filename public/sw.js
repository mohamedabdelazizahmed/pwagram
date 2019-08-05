
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-10';
var CACHE_DYNAMIC_NAME = 'dynamic-4';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];
/**
 *  USE  IDBINDEX and create posts store copy for utility.js
 */
// var dbPromise = idb.open('posts-store', 1, function (db) {
//     console.log('db', db);
//     // checking if create posts before created ...
//     if (!db.objectStoreNames.contains('posts')) {
//         // create posts as table in nosql .... and set primarykey
//         db.createObjectStore('posts', { keyPath: 'id' })

//     }
// })










// function trimCache(cacheName, maxItems) {
//     caches.keys()
//         .then(function (cache) {
//             return cache.keys()
//                 .then(function (keys) {
//                     if (keys.length > maxItems) {
//                         caches.delete(keys[0])
//                             .then(trimCache(cacheName, maxItems));
//                     }
//                 });
//         })

// }
//give me access the sw background proceess
self.addEventListener('install', function (event) {
    //console.log('[sw] Installing service worker ...' ,event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell ....');
                // cache.add('/src/js/app.js');
                // Cache Multiple Files with addAll
                cache.addAll(STATIC_FILES);
            })
    )
});

// close tab and then reload  new website again 
self.addEventListener('activate', function (event) {
    console.log('[sw] Activiating service worker ...', event);
    // Different Cache Versions Cleanup
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[sw] Removing Old Cache ...', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
});
/**
 * 086 A Better Way Of Parsing Static Cache URLs.
 * @param {*} string 
 * @param {*} array 
 */
function isInArray_v1(string, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === string) {
            return true;
        }
    }
    return false;
}

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

// 082 Cache then Network Dynamic Caching [THE BEST STRATGY]
self.addEventListener('fetch', function (event) {
    console.log('[sw] Fetching service worker ...', event);
    // 083 Cache then Network with Offline Support
    // var url = 'https://httpbin.org/get';
    var url = 'https://pwagram-557a2.firebaseio.com/posts';
    // request conation  that url
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(function (res) {
                    var clonedRes = res.clone();
                    console.log(" clonedRes ", clonedRes);
                    // clear all Data in IndexDB Before Write Data in IndexDB
                    clearAllData('posts')
                        .then(function () {
                            return clonedRes.json();
                        })
                        .then(function (data) {
                            for (var key in data) {
                                if (data.hasOwnProperty(key)) {
                                    writeData('posts', data[key])
                                }
                            }
                        });
                    // .....  Before Created clearAllData IndexDB ...... 
                    // clonedRes.json().then(function (data) {
                    //     // object  conatin keys as 
                    //     console.log("[data] In FireBase", data);
                    //     for (const key in data) {
                    //         if (data.hasOwnProperty(key)) {
                    //             // var tx = db.transaction('posts', 'readwrite');
                    //             // var store = tx.objectStore('posts');
                    //             // store.put(data[key]);
                    //             // // close transaction after saved
                    //             // return tx.complete;

                    //             writeData('posts', data[key]);
                    //         }
                    //     }
                    // })
                    return res;
                })

        );
    }
    // new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.req.url)
    else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    }
    else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        // send the original request
                        return fetch(event.request)
                            .then(function (res) {
                                // create a dynammic cahce
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            })
                            //Handling Errors
                            .catch(function (err) {
                                console.log(err);
                                // handeling offline page 
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        // 084 Cache Strategies Routing
                                        //event.request.url.indexOf('/help')
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                })
        )

    }

});




//  ... Default ....
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


/**
 *  calling event sync in serviceworker when established connection 
 */
self.addEventListener('sync', function (event) {
    console.log('[Service Worker] Background syncing', event);
    // when differnt tags && different sync-tags use switch case in different tags
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new Posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function (data) {
                    for (var dt of data) {
                        let url_previous = 'https://pwagram-557a2.firebaseio.com/posts.json';
                        let url_current = 'https://us-central1-pwagram-557a2.cloudfunctions.net/storePostData';
                        fetch(url_current, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                title: dt.title,
                                location: dt.location,
                                image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-99adf.appspot.com/o/sf-boat.jpg?alt=media&token=19f4770c-fc8c-4882-92f1-62000ff06f16'
                            })
                        })
                            .then(function (res) {
                                console.log('Sent data', res);
                                // checking if res is ok ...
                                if (res.ok) {
                                    res.json()
                                        .then(function (resData) {
                                            // Deleteing every post in indexdb after saving in firbase ...
                                            console.log(resData.id);
                                            deleteItemFromData('sync-posts', resData.id);
                                        });
                                }
                            })
                            .catch(function (err) {
                                console.log('Error while sending data', err);
                            });
                    }

                })
        );
    }
});




/**
 *  Notification is system feature  Not Display in WebApplication it's not HTML 
 *  Becouse you can get Notification in Android and ios if application is Colsed 
 *  yes, implement this action in Background Application in serviceworker   
 *  notificationclick New Event in service Worker 
 */
self.addEventListener('notificationclick', function (event) {
    // which  notification work 
    var notification = event.notification;
    // which action was clicked 
    var action = event.action;

    console.log("notification  ", notification);
    console.log("action  ", action);
    // confirm action id in button 
    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()
                .then(function (clis) {
                    var client = clis.find(function (c) {
                        return c.visibilityState === 'visible';
                    });

                    if (client !== undefined) {
                        //   client.navigate('http://localhost:8080');
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        // clients.openWindow('http://localhost:8080');
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
        );
    }
});



/**
 * using push event in notification push becouse maybe website is closed 
 *  sw is probely may working 
 */

self.addEventListener('push', function (event) {
    console.log('Push Notification received', event);

    var data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

    if (event.data) {
        console.log("event.data ", event.data);
        data = JSON.parse(event.data.text());
        console.log("data ", data);
    }

    var options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
