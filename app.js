var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override');

// APP CONFIG
mongoose.connect("mongodb://localhost/pl_news_demo");   
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));

//SCHEMA SETUP
var plNewsSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    created: {type: Date, default: Date.now}
});

var premireLeagueNews = mongoose.model("premireLeagueNews", plNewsSchema);


app.get("/", function(req, res){
    res.render("landing-page");
});

// RENDERING A PAGE TO SHOW ALL PL NEWS
app.get("/premire-league/news", function(req, res){
    premireLeagueNews.find({}, function(err, news){
        if(err){
            console.log(err);
        } else {
            console.log("somebody visit /premire-league/news");
            res.render("index-news", {plNews: news});
        }
    });
});

// SHOWING FORM TO POST A NEW NEWS
app.get("/premire-league/news/new", function(req, res){
    res.render("new-news");
});

// HADLING POST NEWS
app.post("/premire-league/news", function(req, res){
    req.body.news.body = req.sanitize(req.body.news.body);
    var formData = req.body.news;
    premireLeagueNews.create(formData, function(err, newNews){
        console.log(newNews);
        if(err){
            console.log(err);
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

//SHOWING PAGE NEWS
app.get("/premire-league/news/:id", function(req, res){
    premireLeagueNews.findById(req.params.id, function(err, foundNews){
        if(err){
            console.log(err);
        } else {
            res.render("show-news", {plNews: foundNews});
        }
    });
});

// EDIT NEWS ROUTE

// SHOWING FORM TO EDIT A NEWS
app.get("/premire-league/news/:id/edit", function(req, res){
    premireLeagueNews.findById(req.params.id, function(err, foundNews){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.render("edit-news", {plNews: foundNews});
        }
    });
});

// HANDLING UPDATE NEWS
app.put("/premire-league/news/:id", function(req, res){
    req.body.news.body = req.sanitize(req.body.news.body);
    var formData = req.body.news;
    premireLeagueNews.findByIdAndUpdate(req.params.id, formData, function(err, updateNews){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

// DESTROY NEWS ROUTE

app.delete("/premire-league/news/:id", function(req, res){
    premireLeagueNews.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/premire-league/news");
        }
    }); 
 });

app.listen(3000, function() {
    console.log("PL-NEWS SITE STARTING TO ONLINE! 127.0.0.1:3000/");
});