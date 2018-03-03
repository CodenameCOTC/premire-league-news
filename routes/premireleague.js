var express = require('express'),
    router = express.Router(),
    plNews = require('../models/plnews'),
    middleware = require('../middleware');

router.get("/", function(req, res){
    res.render("landing-page");
});

// RENDERING A PAGE TO SHOW ALL PL NEWS
router.get("/premire-league/news", function(req, res){
    plNews.find({}, function(err, news){
        if(err){
            console.log(err);
        } else {
            console.log("somebody visit /premire-league/news");
            res.render("index-news", {plNews: news});
        }
    });
});

// SHOWING FORM TO POST A NEW NEWS
router.get("/premire-league/news/new", middleware.isLoggedIn, function(req, res){
    res.render("new-news");
});

// HADLING POST NEWS
router.post("/premire-league/news", middleware.isLoggedIn, function(req, res){
    var title = req.sanitize(req.body.post["title"]);
    var image = req.body.post["image"];
    var desc = req.sanitize(req.body.post["dsc"]);
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newNews = {title: title, image: image, description: desc, author: author}
    plNews.create(newNews, function(err, newNews){
       // console.log(newNews);
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

//SHOWING PAGE NEWS
router.get("/premire-league/news/:id", function(req, res){
    plNews.findById(req.params.id, function(err, foundNews){
        if(err){
            console.log(err);
        } else {
            res.render("show-news", {plNews: foundNews});
        }
    });
});

// EDIT NEWS ROUTE

// SHOWING FORM TO EDIT A NEWS
router.get("/premire-league/news/:id/edit", middleware.checkPLNewsOwnership, function(req, res){
    plNews.findById(req.params.id, function(err, foundNews){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.render("edit-news", {plNews: foundNews});
        }
    });
});

// HANDLING UPDATE NEWS
router.put("/premire-league/news/:id", middleware.checkPLNewsOwnership, function(req, res){
    
    var formData = req.sanitize(req.body.news);
    plNews.findByIdAndUpdate(req.params.id, formData, function(err, updateNews){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

// DESTROY NEWS ROUTE

router.delete("/premire-league/news/:id", middleware.checkPLNewsOwnership, function(req, res){
    plNews.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/premire-league/news");
        }
    }); 
 });

 module.exports = router;