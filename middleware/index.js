var plNews = require('../models/plnews');

var middlewareObj = {};

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

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("back");
}

module.exports = middlewareObj;