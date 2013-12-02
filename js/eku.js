var feedUrl = "http://www.engeene.it/feed";
var feedUrlNotFound = "Pagina Engeene non disponibile";
var blogUrl = "http://www.engeene.it";
var noItems = "Non hai articoli in Preferiti";
var naImgName = "notAvailable.png";
var monthsName = {0:"Gen", 1:"Feb", 2:"Mar", 3:"Apr", 4:"Mag", 5:"Giu", 6:"Lug", 7:"Ago", 8:"Set", 9:"Ott", 10:"Nov", 11:"Dic"};

// Crea il div del titolo
function createTitleArticle(title) {
	return $("<div class='titleArticle'><a><span><strong>" + title + "</strong></span></a></div>");
};

// Crea il div dell'autore
function createAuthorArticle(author) {
	return $("<div class='authorArticle'><span>Di </span><i><span id='authorUrl'>" + author + "</span></i></div>");
};

// Crea il div dell'immagine
function createImgArticle(imgSrc) {
	if (!imgSrc) imgSrc = "../img/"+naImgName;
	return $("<div class='imgArticle'><img src='" + imgSrc + "'></div>");
};

// Crea il div della descrizione
function createDescArticle(desc) {
	return $("<div class='descArticle'>" + desc + "</div>");
};

// Crea il div della data di pubblicazione
function createPubDateArticle(date, isFavorite) {
	var pubDate = new Date(date);
	var day = pubDate.getDate();
	var month = pubDate.getMonth();
	var	publicationDate;

	if (isFavorite) {
		var year = pubDate.getFullYear();
		publicationDate = day + " " + monthsName[month] + "\n" + year;
	}
	else {
		var hours = pubDate.getHours();
		var minutes = pubDate.getMinutes();
		if (day == new Date().getDate()) publicationDate = (hours.toString().length==1 ? "0"+hours : hours) + ":" + (minutes.toString().length==1 ? "0"+minutes : minutes);
		else publicationDate = day + " " + monthsName[month];
	}
	return $("<div class='dateArticle'>" + publicationDate + "</div>");
};

// Crea il div dell'icona not/favorite
function createFavoriteIconArticle(isFavorite) {
	var classFavorite = (isFavorite) ? "favorite" : "notFavorite";
	return $("<div class='containerFavoriteIcon'><img id='favorite' class='" + classFavorite + "'></div>");
};

// Crea il div dell'url
function createUrlArticle(url) {
	return $("<div class='url' style='visibility:hidden'>" + url + "</div>");
};

// Crea il div dell'articolo
function createArticle(url, title, imgSrc, desc, pubDate, author, isFavorite) {
	article = $("<div class='article'></div>");
	var titleArt = createTitleArticle(title)
	titleArt.children().bind("click", {url: url}, createNewTab);
	article.append(titleArt);
	article.append(createImgArticle(imgSrc));
	article.append(createDescArticle(desc));
	article.append(createPubDateArticle(pubDate, isFavorite));
	article.append(createFavoriteIconArticle(isFavorite));
	article.append(createUrlArticle(url));
	var authorArt = createAuthorArticle(author);
	article.append(authorArt);
	article.find("img").filter("#favorite").bind("click", {url: url, title: title, imgSrc: imgSrc, desc: desc, pubDate: pubDate, author: author}, toggleFavorite);
	article.bind("mouseover", function() {$(this).css("background-color", "#F5F5F5")});
	article.bind("mouseout", function() {$(this).css("background-color", "#FFFFFF")});
	return article;
};

// Setta la trasparenza del boxShadow a 0 o 1
function getScoll() {
	if ($(this).scrollTop() != 0) $(".boxShadow").css("opacity", 1);
	else $(".boxShadow").css("opacity", "0");
};

// Aggiusta le dimensioni del container dei preferiti
function adjustContainerFavoriteHeight(numOfArticles) {
	headerHeight = Number($(".header").css("height").substring(0,$(".header").css("height").length-2));
	// Se il numero totale degli articoli è = 0
	if (numOfArticles == 0) {
		$("#containerFavorites").append("<div id='notFound'>" + noItems + "</div>");
		$("#containerFavorites").css("border-top", "1px solid #D7D7D7");
		$("body").css("height", headerHeight+30);
		$(".current").parent().parent().css("height", headerHeight+30);
		$("#containerFavorites").css("height", 30);
	}
	// Se il numero totale degli articoli è < 5
	else if (numOfArticles < 5) {
		$("#containerFavorites").css("height", numOfArticles*131);
		$("body").css("height", (numOfArticles*131)+headerHeight);
		$(".current").parent().parent().css("height", (numOfArticles*131)+headerHeight);
	}
	// Se il numero totale degli articoli è >= 5
	else {
		containerFavoritesHeight = Number($("#containerArticles").css("height").substring(0,$("#containerArticles").css("height").length-2));
		$("#containerFavorites").css("height", containerFavoritesHeight);
	}
};

// Completa l'evento della notifica
function completeEvent() {
	// Stoppa l'evento sul div con classe 'notice'
	$(".notice").stop();
	// Rimuove il div con classe 'notice'
	$(".notice").remove();
};

// Crea il div della notifica
function setNotice(text) {
	/* Se esiste già il div con classe 'notice' allora vuol dire che è ancora in corso un evento sollevato precedentemente
	   => viene richamata la funzione 'completeEvent' che stoppa l'evento e rimuove il div */
	if ($(".notice")) completeEvent();
	// Appende il div appena creato
	$(".header").append($("<div class='notice'>" + text + "</div>"));
	// Esegue l'effetto 'fadeOut' ed al termine richama la funzione 'completeEvent'
	$(".notice").fadeOut(1800, completeEvent);
};

// Aggiunge o rimuove un preferito
function toggleFavorite(event) {
	// Viene effettuato il toggle della classe
	$(this).toggleClass("notFavorite favorite");
	// Viene aggiunto l'articolo ai preferiti
	if($(this).hasClass("favorite")) {
		insertFavoriteArticle(event.data.url, event.data.title, event.data.desc, event.data.imgSrc, event.data.pubDate, event.data.author);
	}
	// Viene rimosso l'articolo dai preferiti
	else {
		removeFavoriteArticle(event.data.url);
		currentArticle = $(this).parent().parent();
		// Viene controllato se l'id del div container dell'articolo corrente è "containerFavorites"
		if (currentArticle.parent().attr("id") == "containerFavorites") {
			currentArticle.slideUp(function () {
				currentArticle.remove();
				// Viene dapprima cercato lo stesso articolo nel "containerArticles" e poi viene cambiata la classe dell'immagine a "notFavorite"
				urlArticle = currentArticle.children(".url").text();
				$("#containerArticles .article:contains("+urlArticle+") .containerFavoriteIcon .favorite").attr("class", "notFavorite");

				adjustContainerFavoriteHeight($("#containerFavorites").children().size());
			});
		}
	}
};

// Crea un nuovo tab
function createNewTab(event) {
	chrome.tabs.create({"url": event.data.url});
};

// Mostra gli articoli preferiti nel relativo div
function displayFavorites(favoriteArticles) {
	$("#containerFavorites").empty();
	$.each(favoriteArticles, function() {
		$("#containerFavorites").append(createArticle(this.urlArticle, this.title, this.imgSrc, this.desc, this.pubDate, this.author, true));
	});
	$(".current").removeClass('current');
	$("#containerFavorites").parent().addClass('current');

	adjustContainerFavoriteHeight(favoriteArticles.length);
	if (favoriteArticles.length != 0) $("#containerFavorites").css("border-top", "0px");

	$(".current").effect("slide", {direction: "right"}, 200);
	$(".boxShadow").css("opacity", "0");
};

// Ritorna alla schermata home
function displayHome() {
	$(".current").removeClass('current');
	$("#containerArticles").parent().addClass('current');
	$(".current").effect("slide", {direction: "left"}, 200);
	$(".boxShadow").css("opacity", "0");
};

// Setta l'articolo come preferito
function setPreferred(articleNumber) {
	$($(".article")[articleNumber]).find("img").filter("#favorite").attr("class", "favorite");
};

// Crea il container contenente gli articoli nella home
function createHomeContainer() {
	var homeContainer = $("<div class='container current'></div>");
	$("body").append(homeContainer);
	homeContainer.append("<div class='header'><span id='titleHeader'><a>Engeene</a></span><span id='favorites'><a>Preferiti</a></span></div>");
	$($("body #titleHeader a")[0]).bind("click", {url: blogUrl}, createNewTab);
	$("#favorites a").bind("click", getFavoriteArticles);
	homeContainer.append("<div id='containerArticles' class='containerArticles'></div>");
	$("#containerArticles").bind("scroll", getScoll);
};

// Crea il container contenente gli articoli preferiti
function createFavoriteContainer() {
	var favoriteContainer = $("<div class='container'></div>");
	$("body").append(favoriteContainer);
	favoriteContainer.append("<div class='header'><span id='titleHeader'><a>‹ Indietro</a></span></div>");
	$($("body #titleHeader a")[1]).bind("click", displayHome);
	favoriteContainer.append("<div id='containerFavorites' class='containerArticles'></div>");
	$("#containerFavorites").bind("scroll", getScoll);
};

// Quando il document è in stato "ready"
$(document).ready(function() {
	createDB();

	// Effettua una chiamata ajax all'url di Engeene
	var jqxhr = $.ajax({
					url: feedUrl,
					crossDomain: true
				});

	// In caso di fallimento rimuove il div di caricamento ed appende quello del notFound
	jqxhr.fail(function(data, status, error) {
		$("#loading").remove();
		$("body").append("<div id='notFound'>" + feedUrlNotFound + "</div>");
	});

	// In caso di esito positivo
	jqxhr.done(function(data, status, jqXHR) {
		$("#loading").remove();
		createHomeContainer();
		createFavoriteContainer();
		// Appende tutti gli articoli ritornati dalla chiamata
		listItems = $(data).find("item");
		for (var i = 0; i < listItems.length; i++) {
			title = $(listItems[i]).find("title").text();
			imgSrc = $($(($($(listItems[i]).children("content\\:encoded")[0].firstChild.nodeValue))[0]).find("img")[0]).attr("src");
			desc = $(listItems[i]).find("description").text();
			desc = desc.substring(0, desc.indexOf(" <a"));
			pubDate = $(listItems[i]).find("pubDate").text();
			url = $(listItems[i]).find("guid").text();
			author = $($(listItems[i]).children("dc\\:creator")[0]).text();
			$("#containerArticles").append(createArticle(url, title, imgSrc, desc, pubDate, author, false));
		}
		// Per ogni articolo controlla che lo stesso sia stato memorizzato o meno tra i preferiti
		for (var i = 0; i < $(".article").length; i++) {
			isPreferred($($(".article .url")[i]).text(), i);
		}
		$("body").append("<div class='boxShadow'></div>");
	});

});