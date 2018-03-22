var express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  middleware = require('../middleware'),
  User = require('../models/user');

// SHOWING REGISTER FORM
router.get("/register", function(req, res) {
  res.render("register");
});

// HANDLING REGISTER LOGIC
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Hi " + user.username + " , welcome to the family!");
      res.redirect("/premire-league/news");
    });
  });
});

// SHOW LOGIN FORM
router.get("/login", function(req, res) {
  res.render("login");
});

// HANDLING LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
  successRedirect: "/premire-league/news",
  failureRedirect: "/login"
}), function(req, res) {});

// LOGOUT ROUTES

router.get("/logout", function(req, res) {
  req.flash("success", "Logged you out! see you soon " + req.user.username + "!");
  req.logout();
  res.redirect("back");
})

module.exports = router;
