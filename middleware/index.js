var plNews = require('../models/plnews');
var Comment = require('../models/comment');
var middlewareObj = {};

middlewareObj.isSuperAdmin = function(req, res, next){
    if(req.isAuthenticated()) {
        if (req.user.isSuperAdmin) {
            next();
        } else {
            req.flash("error", "You don't have permission do that shit dude!");
            res.redirect("back");
        }
    }
}

middlewareObj.checkPLNewsOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        plNews.findById(req.params.id, function (err, foundNews) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundNews.author.id.equals(req.user._id) || req.user.isSuperAdmin) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isSuperAdmin) {
                    next();
                } else {
                    res.redirect('back');
                }
            }
        })
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that dude!");
    res.redirect("back");
}

module.exports = middlewareObj;
