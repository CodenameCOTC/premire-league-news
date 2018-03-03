var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    plNews = require('./models/plnews'),
    PORT = process.env.PORT || 50000,
    User = require('./models/user');

// REQUIRING ROUTES
var plRoutes = require('./routes/premireleague');   
var indexRoutes = require('./routes/index'); 

// APP CONFIG
mongoose.connect("mongodb://testusername:password@ds155218.mlab.com:55218/plnews");   
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "Winner winner chicken dinner",
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
    next();
});

app.use("/", plRoutes);
app.use("/", indexRoutes);

app.get("/*", function(req, res){
    res.send("error 404");
})
app.listen(PORT, function() {
    console.log("PL-NEWS SITE STARTING TO ONLINE! 127.0.0.1:3000/");
});