var express = require('express'),
  router = express.Router(),
  faker = require('faker'),
  plNews = require('../models/plnews'),
  request = require('request'),
  multer = require('multer'),
  middleware = require('../middleware');

require('dotenv').config();


var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function(req, file, cb) {
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
  api_secret: process.env.DB.API_SECRET
});

router.get("/", function(req, res) {
  res.redirect("/premire-league/news");
});

// RENDERING A PAGE TO SHOW ALL PL NEWS
router.get("/premire-league/news", function(req, res) {    
  if(req.query.Search) {
    let keywords = req.query.Search.split(" ").join("+");
    let noMatch = null;
    let regex = new RegExp(escapeRegex(req.query.Search), 'gi');
    const perPage = 8;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    plNews.find({tags: regex})
      .sort({
        created: -1
      })
      .skip((perPage * pageNumber) - perPage)
      .limit(perPage)
      .exec(function(err, news) {
        plNews.count({tags: regex},(function(err, count) {
          if (err) {
            console.log(err);
            res.redirect("back");
          } else {
            if (news.length < 1) {
              
              noMatch = "Sorry no news match with your criteria: " + req.query.Search
              req.flash("error", noMatch);
              res.render("index-news", {
                plNews: news,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                Search: keywords,
                error: req.flash("error")

              });
            } else {              
              req.flash("success", "We found " + count + " article match with your keywords: " + req.query.Search);
              res.render("index-news", {
              plNews: news,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              Search: keywords,
              success: req.flash("success")

            });
          }
          }
        }));
      });
  } else {
  const perPage = 8;
  let pageQuery = parseInt(req.query.page);
  let pageNumber = pageQuery ? pageQuery : 1;
  plNews.find({})
    .sort({
      created: -1
    })
    .skip((perPage * pageNumber) - perPage)
    .limit(perPage)
    .exec(function(err, news) {
      plNews.count((function(err, count) {
        if (err) {
          console.log(err);
          res.redirect("back")
        } else {
          res.render("index-news", {
            plNews: news,
            current: pageNumber,
            pages: Math.ceil(count / perPage)
          });
        }
      }));
    });
  }
});




// SHOWING FORM TO POST A NEW NEWS
router.get("/premire-league/news/new", middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
  res.render("new-news");
});

// HADLING POST NEWS
router.post("/premire-league/news", middleware.isLoggedIn, middleware.isSuperAdmin, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    let title = req.sanitize(req.body.post.title);
    let image = result.secure_url;
    let desc = req.sanitize(req.body.post.dsc);
    let tags = req.body.post.tags.split(",");
    let author = {
      id: req.user._id,
      username: req.user.username
    }
    let newNews = {
      title: title,
      image: image,
      description: desc,
      tags: tags,
      author: author
    }
    plNews.create(newNews, function(err, newNews) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Grats! " + newNews.title + " has successfully created");
        res.redirect("/premire-league/news");
      }
    });
  });
});

//SHOWING PAGE NEWS
router.get("/premire-league/news/:id", function(req, res) {
  plNews.findById(req.params.id).populate("comments").exec(function(err, foundNews) {
    if (err) {
      req.flash("error", "Ooops article that you're looking for is not found...");
      res.redirect("/premire-league/news");
    } else {
      res.render("show-news", {
        plNews: foundNews
      });
    }
  });
});

// EDIT NEWS ROUTE

// SHOWING FORM TO EDIT A NEWS
router.get("/premire-league/news/:id/edit", middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
  plNews.findById(req.params.id, function(err, foundNews) {
    if (err) {
      req.flash("errorr", err.message);
      res.redirect("/premire-league/news");
    } else {
      res.render("edit-news", {
        plNews: foundNews
      });
    }
  });
});

// HANDLING UPDATE NEWS
router.put("/premire-league/news/:id", middleware.isSuperAdmin, function(req, res) {
  let formData = req.body.news
  plNews.findByIdAndUpdate(req.params.id, formData, function(err, updateNews) {
    if (err) {
      req.flash("error", err)
      res.redirect("back");
    } else {
      req.flash("success", "You've successfully editing: " + "'" + updateNews.title + "'");
      res.redirect("/premire-league/news");
    }
  });
});

// DESTROY NEWS ROUTE

router.delete("/premire-league/news/:id", middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
  plNews.findByIdAndRemove(req.params.id, function(err, deletedNews) {
    if (err) {
      req.flash("error", err.message);
    } else {
      req.flash("success", "You just deleted: " + deletedNews.title);
      res.redirect("/premire-league/news");
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
