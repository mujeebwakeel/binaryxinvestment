var User = require("../models/user");

var middleware = {};

middleware.isAdmin = function(req,res,next){
                if(req.isAuthenticated() && req.user.isAdmin){
                    return next();
                }
                req.flash("message", "Please login first and be sure you are an admin"); 
                res.redirect("/home");
            }

middleware.checkEmailRepetition = function (req, res, next) {
    User.findOne({email: req.body.email}, function(err, foundUser){
        if(err || foundUser) {
            req.flash("error", "Try using another email address");
            return res.redirect("/register");
        }
            next();
    });
}


module.exports = middleware;