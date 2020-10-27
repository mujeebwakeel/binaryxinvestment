var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var moment = require("moment");
var flash = require("connect-flash");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var session = require('express-session')
var MemoryStore = require('memorystore')(session);
var User = require("./models/user");
require('dotenv').config();

 var port = process.env.PORT || 8000;

// REQUIRING ROUTES
var adminRoutes = require("./routes/admin");
var userRoutes = require("./routes/user");
var passwordReset = require("./routes/passwordreset");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, 'useUnifiedTopology': true, 'useFindAndModify': false, useCreateIndex: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({
    cookie: { maxAge: 86400000 },       
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: "I want to be the best in all I do",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.logout = req.flash("logout");
    res.locals.message = req.flash("message");
    res.locals.success = req.flash("success");
    next();
});

app.use(adminRoutes);
app.use(userRoutes);
app.use(passwordReset);


app.get("*", function(req,res){
    res.send("<h1>The entered URL does not exit on this server.</h1> <h2>Kindly check the URL characters for the correct link.</h2> <h2>Thank you.</h2>");
});


app.listen(port, function(){
    console.log("Server has started");
});