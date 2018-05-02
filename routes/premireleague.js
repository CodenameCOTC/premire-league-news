var express = require("express"),
  router = express.Router(),
  faker = require("faker"),
  plNews = require("../models/plnews"),
  request = require("request"),
  multer = require("multer"),
  middleware = require("../middleware");

require("dotenv").config();

const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = (req, file, cb) => {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env_API_SECRET
});

router.get("/", (req, res) => {
  res.redirect("/premire-league/news");
});

// RENDERING A PAGE TO SHOW ALL PL NEWS
router.get("/premire-league/news", (req, res) => {
  // Check if search query true
  if (req.query.Search) {
    let keywords = req.query.Search.split(" ").join("+");
    let noMatch = null;
    let regex = new RegExp(escapeRegex(req.query.Search), "gi");
    const perPage = 8;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;

    plNews
      .find({ tags: regex })
      .sort({
        created: -1
      })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec((err, news) => {
        plNews.count({ tags: regex }, (err, count) => {
          if (err) {
            console.log(err);
            res.redirect("back");
          } else {
            if (count < 1) {
              noMatch = `Sorry no news match with your criteria: ${
                req.query.Search
              }`;
              req.flash("error", noMatch);
              res.render("index-news", {
                plNews: news,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                Search: keywords,
                error: req.flash("error")
              });
            } else {
              req.flash(
                "success",
                `We found ${count} article match with your keywords: ${
                  req.query.Search
                }`
              );
              res.render("index-news", {
                plNews: news,
                current: pageNumber,
                pages: Math.ceil(count / perPage),
                Search: keywords,
                success: req.flash("success"),
                title: `Result: ${req.query.Search}`
              });
            }
          }
        });
      });
  } else {
    const perPage = 8;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    plNews
      .find({})
      .sort({
        created: -1
      })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function(err, news) {
        plNews.count((err, count) => {
          if (err) {
            console.log(err);
            res.redirect("back");
          } else {
            res.render("index-news", {
              plNews: news,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              title: `PL News Index`
            });
          }
        });
      });
  }
});

// SHOWING FORM TO POST A NEW NEWS
router.get("/premire-league/news/new", middleware.isSuperAdmin, (req, res) => {
  res.render("new-news", { title: "Create a new News" });
});

// HADLING POST NEWS
router.post(
  "/premire-league/news",
  middleware.isSuperAdmin,
  upload.single("image"),
  (req, res) => {
    cloudinary.uploader.upload(req.file.path, function(result) {
      let title = req.sanitize(req.body.post.title);
      let image = result.secure_url;
      let desc = req.sanitize(req.body.post.dsc);
      let tags = req.body.post.tags.split(",");
      let author = {
        id: req.user._id,
        username: req.user.username
      };
      let newNews = {
        title: title,
        image: image,
        description: desc,
        tags: tags,
        author: author
      };

      plNews
        .create(newNews)
        .then(newsCreated => {
          req.flash(
            "success",
            `Grats! ${newNews.title} has successfully created`
          );
          res.redirect("/premire-league/news");
        })
        .catch(err => {
          req.flash("error", err.message);
          res.redirect("back");
        });
    });
  }
);

//SHOWING PAGE NEWS
router.get("/premire-league/news/:id", (req, res) => {
  plNews
    .findById(req.params.id)
    .populate("comments")
    .exec()
    .then(foundNews => {
      res.render("show-news", {
        title: foundNews.title,
        plNews: foundNews
      });
    })
    .catch(err => {
      req.flash(
        "error",
        "Ooops article that you're looking for is not found..."
      );
      res.redirect("/premire-league/news");
    });
});

// EDIT NEWS ROUTE

// SHOWING FORM TO EDIT A NEWS
router.get(
  "/premire-league/news/:id/edit",
  middleware.isSuperAdmin,
  (req, res) => {
    plNews
      .findById(req.params.id)
      .then(foundNews => {
        res.render("edit-news", {
          plNews: foundNews,
          title: `Edit: ${foundNews.title}`
        });
      })
      .catch(err => {
        req.flash("errorr", err.message);
        res.redirect("/premire-league/news");
      });
  }
);

// HANDLING UPDATE NEWS
router.put("/premire-league/news/:id", middleware.isSuperAdmin, (req, res) => {
  let formData = req.body.news;
  console.log(formData);
  plNews
    .findByIdAndUpdate(req.params.id, formData)
    .then(updatedNews => {
      req.flash(
        "success",
        `You have successfully editing: '${updatedNews.title}'`
      );
      res.redirect("/premire-league/news");
    })
    .catch(err => {
      req.flash("error", err.message);
      res.redirect("back");
    });
});

// DESTROY NEWS ROUTE

router.delete(
  "/premire-league/news/:id",
  middleware.isSuperAdmin,
  (req, res) => {
    plNews
      .findByIdAndRemove(req.params.id)
      .then(deletedNews => {
        req.flash("success", `You just deleted ${deletedNews.title}`);
        res.redirect("/premire-league/news");
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
);

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
