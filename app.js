const express = require("express"),
  app = express(),
  faker = require("faker"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  favicon = require("serve-favicon"),
  path = require("path"),
  expressSanitizer = require("express-sanitizer"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  plNews = require("./models/plnews"),
  User = require("./models/user"),
  PORT = process.env.PORT || 50000;

// REQUIRING ROUTES
const plRoutes = require("./routes/premireleague");
const indexRoutes = require("./routes/index");
const commentRoutes = require("./routes/comments");

// APP CONFIG
mongoose
  .connect(process.env.DB)
  .then(connected => {
    console.log("DB Connected");
  })
  .catch(err => console.log("Something went wrong with DB host connection"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(flash());
app.use(methodOverride("_method"));
app.locals.moment = require("moment");
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
require("dotenv").config();

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", plRoutes);
app.use("/", indexRoutes);
app.use("/", commentRoutes);

app.get("/*", (req, res) => {
  req.flash("error", "404! Page that you're looking for is not found");
  res.redirect("/premire-league/news");
});
app.listen(PORT, () => {
  console.log("PL-NEWS SITE STARTING TO ONLINE!: 127.0.0.1:" + PORT);
});
