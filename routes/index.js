const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  middleware = require("../middleware"),
  User = require("../models/user");

// SHOWING REGISTER FORM
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  });
});

// HANDLING REGISTER LOGIC
router.post("/register", (req, res) => {
  let newUser = new User({
    username: req.body.username
  });
  User.register(newUser, req.body.password)
    .then(user => {
      req.flash(
        "success",
        "Welcome " + user.username + " to Premire League News!"
      );
      res.redirect("/login");
    })
    .catch(err => {
      req.flash("error", err.message);
      return res.redirect("back");
    });
});

// SHOW LOGIN FORM
router.get("/login", (req, res) => {
  res.render("login", {
    title: `Login`
  });
});

// HANDLING LOGIN LOGIC
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: {
      type: "error",
      message: "Invalid username or password."
    }
  }),
  (req, res) => {
    req.flash(
      "success",
      `Hi ${req.user.username}! Thanks for coming back, happy reading!`
    );
    res.redirect("/premire-league/news");
  }
);

// LOGOUT ROUTES

router.get("/logout", middleware.isLoggedIn, (req, res) => {
  req.flash("success", `Logged you out! see you soon ${req.user.username}`);
  req.logout();
  res.redirect("back");
});

module.exports = router;
