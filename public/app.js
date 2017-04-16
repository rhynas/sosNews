function getData(data){
	for (var i = 0; i < data.length; i++) {
		 var panel = $("<div>").addClass("panel panel-primary");
		 var title = $("<div>").addClass("panel-heading");
		 // title.append("<p data-id='" + data[i]._id + "'>");
		 title.append("<h2 class='articleTitle panel-title'>" + data[i].title + "</h2");
		 var saveButton = $("<button class='btn btn-warning' align=right id='saveButton' type='submit' data-id='" + data[i]._id + "''>Save Article</button>");
		 title.append(saveButton);
		 var record = $("<div>").addClass("panel-body")
		 record.append("<p class='articleHead'>" + data[i].head + "</p>");
		 record.append("<a class='articleLink' href=" + data[i].link + ">" + data[i].link + "</a>");
		 panel.append(title)
		 panel.append(record)
		 $("#allArticles").append(panel); 
	}  
}

// Grab the articles as a json
$.getJSON("/articles", function(data) {
  	getData(data);

});
// Grab the articles as a json
$.getJSON("/articles/saved", function(data) {
 	getData(data);

});


$(document).on("click", "#scrapeButton", function() {
  // we make an ajax call to scrape the page
  	$.ajax({
	 	method: "GET",
	 	url: "/scrape" 
  	}).done(function(data) {		
		console.log("Scrape Result: " + data);
		location.reload();
  	});
});


// When you click the savenote button
$(document).on("click", "#saveButton", function() {
  	// Grab the id associated with the article from the submit button
  	var thisId = $(this).attr("data-id");
  	console.log("inside app.js:" + thisId)
  	// Run a POST request to change the note, using what's entered in the inputs
  	$.ajax({
		method: "POST",
		url: "/articles/save/" + thisId,
		data: {
		// Value taken from title input
			saved: true
	 	}
  	}).done(function(data) {
		// Log the response
		console.log("Saved Button: " + data);
		location.reload();
	});
});

// Whenever someone clicks a p tag
$(document).on("click", "#savedArticles", function() {
	// we make an ajax call to get the saved articles
	$.ajax({
	 	method: "GET",
	 	url: "/articles/saved" 
	}).done(function(data) {
		console.log("Show Saved Articles:" + data);
	});
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  	// Empty the notes from the note section
  	$("#notes").empty();
  	// Save the id from the p tag
  	var thisId = $(this).attr("data-id");

  	// Now make an ajax call for the Article
  	$.ajax({
	 	method: "GET",
	 	url: "/articles/" + thisId
  	}).done(function(data) {
		console.log(data);
		// The title of the article
		$("#notes").append("<h2>" + data.title + "</h2>");
		// An input to enter a new title
		$("#notes").append("<input id='titleinput' name='title' >");
		// A textarea to add a new note body
		$("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
		// A button to submit a new note, with the id of the article saved to it
		$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

		// If there's a note in the article
		if (data.note) {
		  	// Place the title of the note in the title input
		  	$("#titleinput").val(data.note.title);
		  	// Place the body of the note in the body textarea
		  	$("#bodyinput").val(data.note.body);
		}
	 });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  	// Grab the id associated with the article from the submit button
  	var thisId = $(this).attr("data-id");

  	// Run a POST request to change the note, using what's entered in the inputs
  	$.ajax({
	 	method: "POST",
	 	url: "/articles/" + thisId,
	 	data: {
			// Value taken from title input
			title: $("#titleinput").val(),
			// Value taken from note textarea
			body: $("#bodyinput").val()
	 	}
  	}).done(function(data) {
		// Log the response
		console.log(data);
		// Empty the notes section
		$("#notes").empty();
	 });

  	// Also, remove the values entered in the input and textarea for note entry
  	$("#titleinput").val("");
  	$("#bodyinput").val("");
});




