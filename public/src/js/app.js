
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
});

/***
 *   Notification API  For Application 
 */
// get All enableNotificationsButtons 
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');
/**
 * displayConfirmNotification
 */
function displayConfirmNotification() {
    // IF BROWSER SUPPORT SERVICES WORKER TO DISPLAY && PUSH NOTIFICATION ....
    // WE NEED SERVICES WORKER TO DISPLAY && PUSH NOTIFICATION ....
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US', // BCP 47,
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
                { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
            ]
        };
        // CHECKING IF SERVICEWORKER REGISTERATION USING FUNCTION READY()
        // 141 Notifications from Within the Service Worker
        navigator.serviceWorker.ready
            .then(function (swreg) {
                // SERVICESWORKER CONTROL TO SHOW NOTIFCATION ...
                swreg.showNotification('Successfully subscribed!', options);
            });
    }

}

/**
 *  trigger push event from server 
 */
function configurePushSub() {
    // checking in browser don't support serviceWorker
    if (!('serviceWorker' in navigator)) {
        return;
    }

    var reg; // sw register
    // after serviceworker register 
    navigator.serviceWorker.ready
        .then(function (swreg) {
            reg = swreg;
            //  getSubscription return any subscription exists in this device 
            return swreg.pushManager.getSubscription();
        })
        .then(function (sub) {
            // each browser has one subscription 
            if (sub === null) {
                // Create a new subscription

                //https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/
               var vapidPublicKey = 'BMLMcYR3fXWjTd21uhhIDKFOJGBhIsJVy5d9i1bcMJyayCN6ruRLbjBpZ_75FaJxUUiqBBfR7nfw5bxIkOORrTo';
                var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,   //send for only visible user secuirty menish
                    applicationServerKey: convertedVapidPublicKey
                });
            } else {
                // We have a subscription
            }
        })
        .then(function (newSub) {
            debugger;
            return fetch('https://pwagram-557a2.firebaseio.com/subscriptions.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
        })
        .then(function (res) {
            if (res.ok) {
                // display Notification 
                displayConfirmNotification();
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

/**
 * Browser Ask For Notification  Permission
 */
function askForNotificationPermission() {
    Notification.requestPermission(function (result) {
        console.log('User Choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted!');
        } else {
            // displayConfirmNotification();
            configurePushSub();
        }
    });
}

// checking if browser support to Notification 
if ('Notification' in window) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}
