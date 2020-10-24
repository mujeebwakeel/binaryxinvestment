var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Customer = require("../models/customer");
var passport = require("passport");
var middleware = require("../middlewares");


// ROUTE ROUTE
router.get("/", function(req, res){
    res.send("Here we are");
});


// AUTH ROUTES
router.get("/register", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/home");
    }
    res.render("register", {page: 'register'});
});

router.post("/register", middleware.checkEmailRepetition, function(req,res){
             var newUser = new User({username: req.body.username,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
                                    email: req.body.email,
                                });
    if(req.body.adminCode === process.env.ADMINCODE){
        newUser.isAdmin = true;
    }
   User.register(newUser, req.body.password, function(err,user){
       if(err){
           req.flash("error", err.message);
           return res.redirect("/register");
       }
       passport.authenticate("local")(req,res,function(){
           req.flash("success", "You are now signed in as " + req.user.username + ". Welcome to Gbale.");
           res.redirect("/home");
       });
     }); 
    });

// LOGIN ROUTES
router.get("/login", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/home");
    }
    res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate("local", {
    successFlash: "You are now logged in!",
    successRedirect: "/home",
    failureFlash: true,
    failureRedirect: "/login"
}), function(req,res){
});

// LOG OUT ROUTE
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "You are signed out");
    res.redirect("/home");
});


router.get("/home", function(req,res){
    res.render("home", {page: "home", houses: houses});
});

router.get("/users", function(req,res) {
    User.find({}, function(err, foundUser) {
        res.send(foundUser);
    })
})


module.exports = router;
