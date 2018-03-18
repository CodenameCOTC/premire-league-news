var express = require('express'),
    router = express.Router(),
    faker = require('faker'),
    plNews = require('../models/plnews'),
    request = require('request'),
    multer = require('multer'),
    middleware = require('../middleware');

require('dotenv').config();


var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

router.get("/", function (req, res) {
    res.render("landing-page");
});

// RENDERING A PAGE TO SHOW ALL PL NEWS
router.get("/premire-league/news", function (req, res) {
    var perPage = 6;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    plNews.find({})
        .sort({
            created: -1
        })
        .skip((perPage * pageNumber) - perPage)
        .limit(perPage)
        .exec(function (err, news) {
            plNews.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("index-news", {
                        plNews: news,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });
});




// SHOWING FORM TO POST A NEW NEWS
router.get("/premire-league/news/new", middleware.isSuperAdmin, function (req, res) {
    res.render("new-news");
});

// HADLING POST NEWS
router.post("/premire-league/news", middleware.isLoggedIn, middleware.isSuperAdmin, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {
        var title = req.sanitize(req.body.post["title"]);
        var image = result.secure_url;
        var desc = req.sanitize(req.body.post["dsc"]);
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newNews = {
            title: title,
            image: image,
            description: desc,
            author: author
        }
        plNews.create(newNews, function (err, newNews) {
            // console.log(newNews);
            if (err) {
                console.log(err);
                res.redirect("back");
            } else {
                res.redirect("/premire-league/news");
            }
        });
    });
});

//SHOWING PAGE NEWS
router.get("/premire-league/news/:id", function (req, res) {
    plNews.findById(req.params.id).populate("comments").exec(function (err, foundNews) {
        if (err) {
            console.log(err);
        } else {
            res.render("show-news", {
                plNews: foundNews
            });
        }
    });
});

// EDIT NEWS ROUTE

// SHOWING FORM TO EDIT A NEWS
router.get("/premire-league/news/:id/edit", middleware.isSuperAdmin, function (req, res) {
    plNews.findById(req.params.id, function (err, foundNews) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("edit-news", {
                plNews: foundNews
            });
        }
    });
});

// HANDLING UPDATE NEWS
router.put("/premire-league/news/:id", middleware.isSuperAdmin, function (req, res) {
    req.body.news.body = req.sanitize(req.body.news.body);
    var formData = req.body.news
    plNews.findByIdAndUpdate(req.params.id, formData, function (err, updateNews) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

// DESTROY NEWS ROUTE

router.delete("/premire-league/news/:id", middleware.isSuperAdmin, function (req, res) {
    plNews.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/premire-league/news");
        }
    });
});

module.exports = router;