let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function(event) {
  
  const db = event.target.result;
   
  db.createObjectStore("pendingTransaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.online) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log("Error: " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pendingTransaction"], "readwrite");

  const store = transaction.objectStore("pendingTransaction");

  store.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(["pendingTransaction"], "readwrite");

  const store = transaction.objectStore("pendingTransaction");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["pendingTransaction"], "readwrite");
          const store = transaction.objectStore("pendingTransaction");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["pendingTransaction"], "readwrite");
  const store = transaction.objectStore("pendingTransaction");
  store.clear();
}

window.addEventListener("online", uploadTransaction);