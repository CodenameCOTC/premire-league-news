var express = require('express'),
    app = express(),
    faker = require('faker'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    plNews = require('./models/plnews'),
    User = require('./models/user'),
    PORT = process.env.PORT || 50000;

// REQUIRING ROUTES
var plRoutes = require('./routes/premireleague');
var indexRoutes = require('./routes/index');
var commentRoutes = require('./routes/comments');

// APP CONFIG
mongoose.connect(process.env.DB);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(flash());
app.use(methodOverride('_method'));
require('dotenv').config();

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", plRoutes);
app.use("/", indexRoutes);
app.use("/", commentRoutes);

app.get("/*", function (req, res) {
    res.send("error 404");
})
app.listen(PORT, function () {
    console.log("PL-NEWS SITE STARTING TO ONLINE!: " + PORT);

});
