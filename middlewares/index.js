var User = require("../models/user");

var middleware = {};

middleware.isUserLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("message", "Please login first"); 
    res.redirect("/user_login");
}

middleware.isAdmin = function(req,res,next){
                if(req.isAuthenticated() && req.user.isAdmin){
                    return next();
                }
                req.flash("message", "Please login first and be sure you are an admin"); 
                res.redirect("/");
            }




module.exports = middleware;