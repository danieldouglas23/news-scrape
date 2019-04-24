// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/onionScraper", { useNewUrlParser: true });

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function (error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.send("Hello world");
});

app.get("/scrape", function (req, res) {
  // Making a request via axios for theonion politics page
  axios.get("https://politics.theonion.com/").then(function (response) {

    // Load the body of the HTML into cheerio
    var $ = cheerio.load(response.data);

    // Empty array to save our scraped data
    var scrapedDataArray = [];

    $("article.postlist__item").each(function (i, element) {
      var title = $(element).find("h1.headline").text();

      var link = $(element).find("h1.headline").children("a").attr("href");

      var summary = $(element).find("div.excerpt").children("p").text();

      scrapedDataArray.push({ 
        title: title,
        link: link,
        summary: summary
      });

      
    });
    // Create a new Article using the data array built from scraping
    db.Article.create(scrapedDataArray)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
    });
    
    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(dbArticle) {
      // If any Articles are found, send them to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "comment",
  // then responds with the article with the comment included
  db.Article.findOne({ _id: req.params.id })
  .populate("comment")
  .then(function (dbArticle) {
    res.json(dbArticle);
  })
  .catch(function (err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });

});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new comment that gets posted to the Comments collection
  // then find an article from the req.params.id
  // and update it's "comment" property with the _id of the new comment
   // Create a new Comment in the db
   db.Comment.create(req.body)
   .then(function (dbComment) {
     return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { comment: dbComment._id } }, { new: true });
   })
   .then(function (dbArticle) {
     res.json(dbArticle);
   })
   .catch(function (err) {
     // If an error occurs, send it back to the client
     res.json(err);
   });
});

// app.post("/deleteComment/:id", function(req, res) {
//   db.Comment.findOneAndRemove({ id: req.params.id })
//   .then(function (dbComment) {
//     res.json(dbComment);
//   }).catch(function(err) { res.json(err) });
// });

app.post("/deleteComment/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .then(function (dbArticle) {
      return db.Comment.findOneAndRemove({ _id: dbArticle.comment })
    })
    .then(function (dbArticle) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $unset: { comment: "" }})   
    })
    .then(function (dbArticle) {
      res.json(dbArticle);      
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

