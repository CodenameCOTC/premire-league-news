const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  PLNews = require("../models/plnews"),
  Comment = require("../models/comment"),
  middleware = require("../middleware");

router.get(
  "/premire-league/news/:id/comments/new",
  middleware.isLoggedIn,
  (req, res) => {
    PLNews.findById(req.params.id)
      .then(news => {
        res.render("add-comment", {
          title: `Add comment to ${news.title}`,
          plNews: news
        });
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
);

router.post(
  "/premire-league/news/:id/comments",
  middleware.isLoggedIn,
  (req, res) => {
    let comment = {
      text: req.sanitize(req.body.comment.text)
    };
    PLNews.findById(req.params.id)
      .then(news => {
        Comment.create(comment)
          .then(comment => {
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            news.comments.push(comment);
            news.save();
            req.flash(
              "success",
              "Successfully post a comment to " + news.title
            );
            res.redirect("/premire-league/news/" + news._id);
          })
          .catch(err => {
            req.flash("error", err.message);
            res.redirect("back");
          });
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
);

// COMMENTS EDIT ROUTE
router.get(
  "/premire-league/news/:newsID/comments/:comment_id/edit",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id)
      .then(foundComment => {
        res.render("edit-comments", {
          news_id: req.params.newsID,
          comment: foundComment,
          title: `Edit comments`
        });
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
);

router.put(
  "/premire-league/news/:newsID/comments/:comment_id",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment)
      .then(updateComment => {
        req.flash("success", "Grats you're successfully editing ur comment's");
        res.redirect("/premire-league/news/" + req.params.newsID);
      })
      .catch(err => {
        req.flash("error", "Oooops something went wrong");
        res.redirect("back");
      });
  }
);

router.delete(
  "/premire-league/news/:newsID/comments/:comment_id",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id)
      .then(deletedComment => {
        req.flash("success", "Grats you are successfully deleting ur comments");
        res.redirect("back");
      })
      .catch(err => {
        req.flash("error", "Oops something went wrong");
        res.redirect("back");
      });
  }
);

module.exports = router;
