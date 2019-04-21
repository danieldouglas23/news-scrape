// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "ringerScraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.send("Hello world");
});

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
app.get("/all-data", function (req, res) {
    db.scrapedData.find({}, function (err, data) {
      if (err) {
        return console.log(err);
      }
      res.json(data);
    });
  });

  // Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

app.get("/scrape", function (req, res) {
    // Making a request via axios for `nhl.com`'s homepage
    axios.get("https://www.denverpost.com/").then(function (response) {
  
      // Load the body of the HTML into cheerio
      var $ = cheerio.load(response.data);
  
      // Empty array to save our scraped data
      var scrapedDataArray = [];
  
      // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
      $("a.article-title").each(function (i, element) {
        // Save the text of the h4-tag as "title"
        var title = $(element).children("span.dfm-title").text();
        var title = $(element).attr("title");
  
        // Find the h4 tag's parent a-tag, and save it's href value as "link"
        var link = $(element).attr("href");
        
  
        // Make an object with data we scraped for this h4 and push it to the results array
        scrapedDataArray.push({
          title: title,
          link: link
        });
      });
      console.log(title + "||||" + link);
      db.scrapedData.insert(scrapedDataArray);
    });
    res.end();
  });
  
  
  /* -/-/-/-/-/-/-/-/-/-/-/-/- */
  
  // Listen on port 3000
  app.listen(3000, function () {
    console.log("App running on port 3000!");
  });