// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var cheerio = require("cheerio");

//Initalize Express
var app = express();

//Set app with morgan
app.use(logger("dev"));
// Setup the app with body-parser and a static folder
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static("public"));

//Database Configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

//Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(err){
    console.log("Database Error: ", err);
});


// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    res.send("Hello world");
  });


  

// 1. Save a note to the database's collection
// POST: /submit
// ===========================================
app.post("/submit", function(req, res){
  console.log(req.body);
  db.notes.insert(req.body, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.json(data);
    }
  });
})

// 2. Retrieve all notes from the database's collection
// GET: /all
// ====================================================
app.get("/all", function(req, res){
  db.scrappedData.find({}, function(err, data){
    if(err){
      console.log(err);
      return false;
    }else{
    res.json(data);
    }
  })
})
// 3. Retrieve one note in the database's collection by it's ObjectId
// TIP: when searching by an id, the id needs to be passed in
// as (mongojs.ObjectId(IdYouWantToFind))
// GET: /find/:id
// ==================================================================
app.get("/find/:id", function(req, res){
  var id = req.params.id
  db.scrappedData.findOne({_id: mongojs.ObjectId(id)}, function(err, data){
    if(err){
      console.log(err);
      return false;
    }else{
    res.json(data);
    }
  })

})

// 4. Update one note in the database's collection by it's ObjectId
// (remember, mongojs.ObjectId(IdYouWantToFind)
// POST: /update/:id
// ================================================================
app.post("/update/:id", function(req, res){
  var id = req.params.id
  db.scrappedData.update({_id: mongojs.ObjectId(id)},{$set:req.body}, function(err, data){
    if(err){
      console.log(err);
      return false;
    }else{
    res.json(data);
    }
  })

})

// 5. Delete one note from the database's collection by it's ObjectId
// (remember, mongojs.ObjectId(IdYouWantToFind)
// GET: /delete/:id
// ==================================================================
app.get("/delete/:id", function(req, res){
  var id = req.params.id
  db.scrappedData.remove({_id: mongojs.ObjectId(id)}, function(err, data){
    if(err){
      console.log(err);
      return false;
    }else{
    res.json(data);
    }
  })
})

// 6. Clear the entire note collection
// GET: /clearall
// ===================================
app.get("/clearall", function(req, res){
  db.scrappedData.remove({}, function(err, data){
    if(err){
      console.log(err);
      return false;
    }else{
    res.json(data);
    }
  })

})


  var results = [];
 

  app.get("/scrape", function(req, res){
    for (i=0; i < 5; i++){
      var newArr = []
      newArr.push(results[(Math.floor(Math.random()*28))]);
    }
    console.log(newArr);
    db.scrappedData.insert(newArr),function(err,data){
      console.log(data);
    };
  
  })
  

  
  // Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });

  request('https://news.ycombinator.com', function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('span.comhead').each(function(i, element){
        var a = $(this).prev();
        var rank = a.parent().parent().text();
        var title = a.text();
        var url = a.attr('href');
        var subtext = a.parent().parent().next().children('.subtext').children();
        var points = $(subtext).eq(0).text();
        var username = $(subtext).eq(1).text();
        var comments = $(subtext).eq(2).text();
        // Our parsed meta data object
        var metadata = {
          rank: parseInt(rank),
          title: title,
          url: url,
          points: parseInt(points),
          username: username,
          comments: parseInt(comments)
        };
        results.push(metadata);
        
        //console.log(metadata);
      });
    }
  });