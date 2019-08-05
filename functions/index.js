const functions = require('firebase-functions');
// to access firebasedatabase 
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

///////////////////  Question  FirbaseFunction  /////////////////

//>  npm install -g firebase-tools
//>  firebase login 
//>  firebase init
//>  Are you ready to proceed? Yes
//> Which Firebase CLI features do you want to set up for this folder? Press Space to select features, then Enter to confirm your choices. Functions: Configure and deploy Cloud Functions, Hosting: Configure and deploy Firebase Hosting sites
//? Select a default Firebase project for this directory: pwagram-557a2 (pwagram)
//? What language would you like to use to write Cloud Functions? JavaScript
//? Do you want to use ESLint to catch probable bugs and enforce style? Yes
// ? Do you want to install dependencies with npm now? Yes
// ? What do you want to use as your public directory? public
// ? Configure as a single-page app (rewrite all urls to /index.html)? No
// ? File public/index.html already exists. Overwrite? No

/////////////////////////////////////////////////////////////////////////
var serviceAccount = require("./pwagram-fb-key.json");
// https://console.firebase.google.com/project/pwagram-557a2/settings/serviceaccounts/adminsdk
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pwagram-557a2.firebaseio.com/'
});

// npm install firebase-admin cors --save
exports.storePostData = functions.https.onRequest((request, response) => {

    cors(request, response, function () {
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        })
            .then(function () {
                // Createing web push after inserted database ...
                webpush.setVapidDetails('mailto:mr.mohamedabdelaziz@gmail.com',
                    'BMLMcYR3fXWjTd21uhhIDKFOJGBhIsJVy5d9i1bcMJyayCN6ruRLbjBpZ_75FaJxUUiqBBfR7nfw5bxIkOORrTo',
                    'B6x0md9BaUWnDZKVMdfqOB9waW2pigW5hogaheCKJXA');
                return admin.database().ref('subscriptions').once('value');
            })
            .then(function (subscriptions) {
                subscriptions.forEach(function (sub) {
                    var pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: {
                            auth: sub.val().keys.auth,
                            p256dh: sub.val().keys.p256dh
                        }
                    };

                    webpush.sendNotification(pushConfig, JSON.stringify({
                        title: 'New Post',
                        content: 'New Post added!',
                        openUrl: '/help'
                    }))
                        .catch(function (err) {
                            console.log(err);
                        })
                });
                return response.status(201).json({ message: 'Data stored', id: request.body.id });
            })
            .catch(function (err) {
                response.status(500).json({ error: err });

            });
    })

});
/////////////////////////////////////////////////////////////////////////////////////////////

// firebase deploy

// npm install --save web-push
// npm run web-push
// npm run web-push generate-vapid-keys

// =======================================

// Public Key:
// BMLMcYR3fXWjTd21uhhIDKFOJGBhIsJVy5d9i1bcMJyayCN6ruRLbjBpZ_75FaJxUUiqBBfR7nfw5bxIkOORrTo

// Private Key:
// B6x0md9BaUWnDZKVMdfqOB9waW2pigW5hogaheCKJXA

// =======================================