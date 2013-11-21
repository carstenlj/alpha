var feeds = {
	"http://tv2.dk/rss/seneste.xml" : "tv2.dk",
	"http://rss.slashdot.org/Slashdot/slashdot" : "slashdot.org"
};

// Returns an array of objects based on multiple RSS feed url
function getFeeds(urls, callback) {
	var count = 0;
	var results = [];

	for (var i = 0; i < urls.length; i++) {
		// Call getFeed for each url
		getFeed(urls[i], function (e) {
			//Add results to collection
			for (var n = 0; n < e.items.length; n++) {
				results.push(e.items[n]);
			}

			// Raise callback if this was the last url
			if (++count == urls.length)
				callback(results);
		});
	}
}

// Returns an array of objects based on multiple RSS feed url
function getFeed(url, callback) {
	$.get(url, function (xmldoc) {
		// Parse xml using jquery
		var xml = $(xmldoc);
		var items = [];

		// Create ojbect foreach <item> entry
		xml.find("item").each(function () {
			items.push({
				title : $(this).find("title").text(),
				link: $(this).find("link").text(),
				description: $(this).find("description").text(),
				date: $(this).find("pubDate").text()
			});
		})

		// Raise callback with JSON array of news items
		callback({ url: url, items: items });
	});
}

$(function () {

	var template = $("#item-template").html();
	for (url in feeds) {
		// Add feed to left panel list
		$(".feed-list").append("<li>" + feeds[url] + "</li>");

		// Add all feed items to content
		getFeed(url, function (e) {
			for (var n = 0; n < e.items.length; n++) {
				var html = $(template);
				var item = e.items[n];
				html.find('[data-field=title]').text(item.title);
				html.find('[data-field=description]').text(item.description.replace(/<.*>/, ""));
				html.find('[data-field=info]').text(feeds[e.url] + " - " + item.date);
				html.find('a').attr("href", item.link);

				// Append templated html to content
				$(".content").append(html);
			}
		})
	}

});