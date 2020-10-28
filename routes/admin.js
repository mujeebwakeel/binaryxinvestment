var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var middleware = require("../middlewares");
var async = require("async");
var moment = require("moment");


// ADMIN LOGIN ROUTES
router.get("/admin_login", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/admin_dashboard");
    }
    res.render("admin_ui/Adminlogin");
});

router.post("/admin_login", passport.authenticate("local", {
    successFlash: "You are now logged in!",
    successRedirect: "/admin_dashboard",
    failureFlash: true,
    failureRedirect: "/admin_login"
}), function(req,res){
});

router.get("/admin_dashboard", middleware.isAdmin, function(req,res) {
    res.render("admin_ui/index");
})

router.get("/admin_profile", middleware.isAdmin, function(req,res) {
    res.render("admin_ui/profile");
})

router.put("/admin_profile/:id", middleware.isAdmin, function(req,res) {
    async.waterfall([
        function(done) {
    User.findById(req.params.id, function(err, user) {
        if(err || !user) {
            req.flash("error", "Admin not found");
            return res.redirect("/admin_profile");
        }
        user.name = req.body.name;
        user.username = req.body.email;
        user.save(function(err, updatedUser) {
            if(err || !updatedUser) {
                req.flash("error", "something went wrong while updating your profile")
                return res.redirect("/admin_profile");
            }
            updatedUser.setPassword(req.body.password, function(err) {
                if(err){
                  req.flash("error", "something went wrong while resetting password");
                  res.redirect("/admin_profile")
                }else{
                  updatedUser.save(function(err) {
                  req.logIn(updatedUser, function(err) {
                    done(err, updatedUser);
                  });
                });
                }
             })
        });
    })
}
], function(err) {
    if (err){
        req.flash("error", "Something went wrong")
        res.redirect("/admin_profile");
    }else{
        req.flash("success", "Profile updated successfully");
        res.redirect('/admin_profile');
    }
    });
});


// MEMBERS ROUTE
router.get("/members", middleware.isAdmin, function(req,res) {
    User.find({}, function(err, foundUsers) {
        if(err || !foundUsers) {
            req.flash("error", "No user was found");
            return res.redirect("/admin_dashboard");
        }
        res.render("admin_ui/members", {users: foundUsers});
    })
});

router.get("/moredetail", middleware.isAdmin, function(req,res) {
    User.findById(req.query.q, function(err, foundUsers) {
        if(err || !foundUsers) {
            req.flash("error", "No user was found");
            return res.redirect("/admin_dashboard");
        }
        res.render("admin_ui/moredetail", {users: foundUsers});
    })
})

router.post("/user_account_update/:id", middleware.isAdmin, function(req,res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err || !foundUser) {
            req.flash("error", "No user was found");
            return res.redirect("/admin_dashboard");
        }
        var updateType = req.body.updateType;
        var amount = req.body.amount;
        if(updateType == "activeDeposit") {
            var payment = {
                amount: amount,
                date: moment().format("L")
            }
            foundUser.paymentDetail.push(payment);
        }
        foundUser[updateType] = amount;
        foundUser.save(function(err, user) {
            if(err || !user) {
                req.flash("error", "User update failed, try agagin.");
                return res.redirect("/moredetail?q=" + foundUser._id)
            }
            console.log(user);
            req.flash("success", "You successfully updated a user");
            res.redirect("/moredetail?q=" + foundUser._id)
        });
    })
})

// LOG OUT ROUTE
router.get("/admin_logout", function(req,res){
    req.logout();
    req.flash("success", "You are signed out");
    res.redirect("/");
});


// CHECK ALL USERS
// router.get("/users", function(req,res) {
//     User.find({}, function(err, foundUser) {
//         res.send(foundUser);
//     })
// });

// router.get("/createadmin", function(req,res) {
//     User.findOne({username: "whykay@yahoo.com"}, function(err, foundUser) {
//         foundUser.isAdmin = true;
//         foundUser.save();
//         res.send("Admin created");
//     })
// })


module.exports = router;
