// db-storage.js - IndexedDB storage wrapper with fallback to localStorage
(function(){
  var DB_NAME = 'MonzerDB', STORE_NAME = 'app_state';
  
  function openDB() {
    return new Promise(function(resolve, reject) {
      if(!window.indexedDB) return reject('No IDB');
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        e.target.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function(e) { resolve(e.target.result); };
      req.onerror = function(e) { reject(e.target.error); };
    });
  }

  var idbStorage = {
    getItem: async function(key) {
      try {
        var db = await openDB();
        return new Promise(function(resolve) {
          var tx = db.transaction(STORE_NAME, 'readonly');
          var req = tx.objectStore(STORE_NAME).get(key);
          req.onsuccess = function() { resolve(req.result); };
          req.onerror = function() { resolve(null); };
        });
      } catch(e) {
        return localStorage.getItem(key);
      }
    },
    setItem: async function(key, val) {
      try {
        var db = await openDB();
        return new Promise(function(resolve, reject) {
          var tx = db.transaction(STORE_NAME, 'readwrite');
          var req = tx.objectStore(STORE_NAME).put(val, key);
          req.onsuccess = function() { resolve(true); };
          req.onerror = function() { reject(false); };
        });
      } catch(e) {
        try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch(x){}
      }
    }
  };

  window.idbStorage = idbStorage;
})();
