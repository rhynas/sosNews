var express = require("express");
var app = express.Router();
// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Routes
// ======


// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://venezuelanalysis.com/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("div.node-inner").each(function(i, element) {

      // Save an empty result object
      var result = {};

 
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("h2").text().trim();
      result.head = $(this).find('div.content-text-inner > p').text().trim();
      result.link = $(this).find("div.node-inner > h2 > a").attr("href");

  //     // Using our Article model, create a new entry
  //     // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

  //     // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          res.send(doc);
        }
      });

    });
  });
  // // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      // res.json(doc);
      res.render("index",{"articles": doc})
    }
  });
});

// This will get the articles saved by the user
app.get("/saved", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({"saved":true}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        // res.send(doc);
        res.render("articles/articles",{"articles": doc})
      }
    });
});

// This will get the articles saved by the user
app.post("/articles/delete/:id", function(req, res) {
   console.log(req.params.id)
   // Use the article id to find and update it's note
   Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false })
   // Execute the above query
   .exec(function(err, doc) {
     // Log any errors
     if (err) {
       console.log(err);
     }
     else {
       // Or send the document to the browser
       // res.send(doc);
       res.redirect('/saved')
     }
   });
});
// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


app.post("/articles/save/:id", function(req, res) {
   console.log(req.params.id)
   // Use the article id to find and update it's note
   Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
   // Execute the above query
   .exec(function(err, doc) {
     // Log any errors
     if (err) {
       console.log(err);
     }
     else {
       // Or send the document to the browser
       // res.send(doc);
       res.redirect('/articles')
     }
   });
});

// Export routes for server.js to use.
module.exports = app;