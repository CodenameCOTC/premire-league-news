var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    middleware = require('../middleware'),
    User = require('../models/user');

// SHOWING REGISTER FORM
router.get("/register", function (req, res) {
    res.render("register");
});

// HANDLING REGISTER LOGIC
router.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/premire-league/news");
        });
    });
});

// SHOW LOGIN FORM
router.get("/login", function (req, res) {
    res.render("login");
});

// HANDLING LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
    successRedirect: "/premire-league/news",
    failureRedirect: "/login"
}), function (req, res) { });

// LOGOUT ROUTES

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("back");
})

module.exports = router;