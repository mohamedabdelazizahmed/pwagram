var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  console.log(".... openCreatePostModal  ....");
  // createPostArea.style.display = 'block';
  // setTimeout(function() {
  createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  // plz revsion .... show install banner 
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

/**  
 * Currently not in use, allows to save assets in cache on demand otherwise
 *  save card in cache 
 **/
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}
/**
 * clearCards
 */
function clearCards() {
  while (sharedMomentsArea.hasChildNodes) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

/**
 *  create Card using javascript 
 *  create inside card buttom can save it in cache
 */
function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  // feed.css
  //cardTitle.style.height = '180px'; 
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

//  081 Strategy Cache then Network
var url = 'https://httpbin.org/get';
var networkDataReceived = false;

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    message: 'Some message'
  })
})
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    clearCards();
    createCard();
  });


// [GET] USING FETCH FUNCTION
// fetch(url)
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     networkDataReceived = true;
//     console.log("[GET] data form the WEB  ... ", data)
//     clearCards();
//     createCard();
//   });


if ('caches' in window) {
  caches.match(url)
    .then(function (response) {
      if (response) {
        return response.json();
      }
    }).then(function (data) {
      // the newtworkData is faster ...
      if (!networkDataReceived) {
        console.log("[GET] data form the cache  ... ", data)
        clearCards();
        createCard();
      }
    })
}


















// fetch('https://httpbin.org/get')
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });
















/**
 * function openCreatePostModal() {
  console.log(".... openCreatePostModal  ....");
  createPostArea.style.display = 'block';
  // plz revsion .... show install banner
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  }
}
 */