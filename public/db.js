let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {

  const db = event.target.result;

  db.createObjectStore("Working", { autoIncrement: true });
};


request.onsuccess = function (event) {
  db = event.target.result;

  

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Errorls " + event.target.errorCode);
};



function checkDatabase() {

  const db = request.result;
  let transaction = db.transaction([pendingObjectStoreName], `readwrite`);
  let store = transaction.objectStore(pendingObjectStoreName);
  const getAll = store.getAll();



  getAll.onsuccess = () => {
      if (getAll.result.length > 0) {
          fetch(`/api/transaction/bulk`, {
              method: `POST`,
              body: JSON.stringify(getAll.result),
              headers: {
                  Accept: `application/json, text/plain, */*`,
                  "Content-Type": `application/json`
              }
          })
              .then(response => response.json())
              .then(() => {
                  transaction = db.transaction([pendingObjectStoreName], `readwrite`);
                  store = transaction.objectStore(pendingObjectStoreName);
                  store.clear();
              });
      }
  };
  getAll.onerror = function(event) {
    console.log("Errorcd " + event.target.errorCode);
  };
}