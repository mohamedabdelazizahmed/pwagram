//give me access the sw background proceess
self.addEventListener('install',function (event) {
    console.log('[sw] Installing service worker ...' ,event);
});

// close tab and then reload 
self.addEventListener('activate',function (event) {
    console.log('[sw] Activiating service worker ...' ,event);
    return self.clients.claim();
})


self.addEventListener('fetch',function (event) {
    console.log('[sw] Fetching service worker ...' ,event);
    // override the response for evey fetch
    // return event.resposeWith(null);
})