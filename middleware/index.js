var plNews = require("../models/plnews");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.isSuperAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isSuperAdmin) {
      next();
    } else {
      req.flash("error", "You don't have permission do that dude! 😢");
      res.redirect("/premire-league/news");
    }
  } else {
    req.flash(
      "error",
      "You are not logged in and you are trying to do an admin job 😢"
    );
    res.redirect("/premire-league/news");
  }
};

// middlewareObj.checkPLNewsOwnership = function (req, res, next) {
//     if (req.isAuthenticated()) {
//         plNews.findById(req.params.id, function (err, foundNews) {
//             if (err) {
//                 res.redirect("back");
//             } else {
//                 if (foundNews.author.id.equals(req.user._id) || req.user.isSuperAdmin) {
//                     next();
//                 } else {
//                     res.redirect("back");
//                 }
//             }
//         });
//     } else {
//         res.redirect("back");
//     }
// }

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id)
      .then(foundComment => {
        if (
          foundComment.author.id.equals(req.user._id) ||
          req.user.isSuperAdmin
        ) {
          next();
        } else {
          req.flash("error", "Sorry you are not the author of this comment");
          res.redirect("back");
        }
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  } else {
    req.flash(
      "error",
      "You are not logged in and you are trying to do something with someone else comments, we won't let you to do that. If you're trying to editing/deleting ur comment please login first!"
    );
    res.redirect("/login");
  }
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that dude!");
  res.redirect("/login");
};

module.exports = middlewareObj;
