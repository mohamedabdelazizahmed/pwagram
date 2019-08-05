/**
 *  Connection to indexDB 
 *  create  posts-store name of Database 
 *  create  posts  name of  table 
 *  create  sync-posts  name of  table  to save data offline in Background-sync  
 */
var dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', { keyPath: 'id' });
  }
});
/**
 * write & save data in IndexDB
 * @param {*} st  name of collection table 
 * @param {*} data 
 */
function writeData(st, data) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.put(data);
      return tx.complete;
    });
}
/**
 * Read All Data In collection table 
 * @param {*} st table 
 */

function readAllData(st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readonly');
      var store = tx.objectStore(st);
      return store.getAll();
    });
}
/**
 * clear all data in IndexDB 
 * @param {*} st  collection  of table
 */
function clearAllData(st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.clear();
      return tx.complete;
    });
}
/**
 * Delete Item From IndexDB 
 * @param {*} st  collection of table 
 * @param {*} id 
 */
function deleteItemFromData(st, id) {
  debugger;
  dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(function () {
      console.log('Item deleted!');
    });
}

/**
 * urlBase64ToUint8Array uses in push Notification 
 * @param {*} base64String vapidPublicKey
 */
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}