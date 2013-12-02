var dbName = "Engeene";
var dbVersion = "1.0";
var db;

// Crea il DB e la tabella "favoriteArticle"
function createDB() {
	var request = indexedDB.open(dbName, dbVersion);

	request.onsuccess = function(e) {
		db = e.target.result;
	};

	request.onupgradeneeded = function(e) {
		var db = e.target.result;
		var store = db.createObjectStore("favoriteArticle", {autoIncrement: true});
		store.createIndex("by_url", "urlArticle");
	};

	request.onerror = function(e) {
		console.log("Si è verificato un errore nella creazione/modifica del DB!");
	};
};

// Trova gli articoli preferiti e li inserisce in un array
function getFavoriteArticles() {
	var favoriteArticles = new Array();
	var trans = db.transaction(["favoriteArticle"], "readonly");
	var store = trans.objectStore("favoriteArticle");
	// Il cursore scorre gli articoli dall'ultimo al primo
	var request = store.openCursor(null, 'prev');

	request.onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			favoriteArticles.push(cursor.value);
			cursor.continue();
		}
		else {
			displayFavorites(favoriteArticles);
		}
	};
};

// Controlla che l'articolo sia inserito tra i preferiti
function isPreferred(url, articleNumber) {
	var request = indexedDB.open(dbName, dbVersion);

	request.onsuccess = function(e) {
		db = e.target.result;

		var trans = db.transaction(["favoriteArticle"], "readonly");
		var store = trans.objectStore("favoriteArticle");
		var index = store.index("by_url");
		var req = index.get(url);
		
		req.onsuccess = function(e) {
			if (e.target.result) {
				setPreferred(articleNumber);
			}
		};
	};
};

// Inserisce l'articolo nella tabella dei preferiti
function insertFavoriteArticle(url, title, desc, imgSrc, pubDate, author) {
	var trans = db.transaction(["favoriteArticle"], "readwrite");
	var store = trans.objectStore("favoriteArticle");
	var request = store.put({
		"urlArticle": url,
		"title": title,
		"desc": desc,
		"imgSrc": imgSrc,
		"pubDate": pubDate,
		"author": author
	});

	request.onsuccess = function(e) {
		setNotice("Articolo aggiunto ai Preferiti");
	};

	request.onerror = function(e) {
		setNotice("Si è verificato un errore!");
	};
};

// Rimuove l'articolo dalla tabella dei preferiti
function removeFavoriteArticle(url) {
	var trans = db.transaction(["favoriteArticle"], "readwrite");
	var store = trans.objectStore("favoriteArticle");
	var index = store.index("by_url");
	var request = index.openKeyCursor(IDBKeyRange.only(url));

	request.onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			store.delete(cursor.primaryKey);
			setNotice("Articolo rimosso dai Preferiti");
			cursor.break;
		}
	};

	request.onerror = function(e) {
		setNotice("Si è verificato un errore!");
	};
};