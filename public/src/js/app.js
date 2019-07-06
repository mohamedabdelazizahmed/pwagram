/** Checking If Browser support for Promise or fetch */
if (!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    // tell the browser should be rgister serviceworker ...
    // .register('/sw.js',{scope:'/help'}) to set sw control the specific page 
    navigator.serviceWorker.register('/sw.js')
        .then(function () {
            console.log("Service Worker registered ... ");
        }).catch(function (err) {
            console.log(err);
        });
}


/** Install Banner Add To Home Screen 
 * beforeinstallprompt this event fire before install banner
*/
var deferredPrompt;
window.addEventListener('beforeinstallprompt', function (event) {
    console.log('beforeinstallprompt fired ...');
    event.preventDefault();
    deferredPrompt = event;
    return false;
})