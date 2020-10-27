var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var middleware = require("../middlewares");
var async = require("async");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

// HOMEPAGE
router.get("/", function(req,res) {
    res.render("user_ui/index");
})


// USER AUTH ROUTES
router.get("/user_signup", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/user_logged");
    }
    res.render("user_ui/signup");
});

router.post("/user_signup", function(req,res){
             var newUser = new User({ name: req.body.name,
                                      username: req.body.username,
                                      password: req.body.password,
                                      phoneNumber: req.body.phoneNumber
                                });
   User.register(newUser, req.body.password, function(err,user){
       if(err || !user){
           console.log(err.message);
           req.flash("error", err.message);
           return res.redirect("/user_signup");
       }
       passport.authenticate("local")(req,res, function(){
            res.redirect("/user_logged");
       });
     }); 
    });


// USER LOGIN ROUTES
router.get("/user_login", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/user_logged");
    }
    res.render("user_ui/login");
});

router.post("/user_login", passport.authenticate("local", {
    successFlash: "You are now logged in!",
    successRedirect: "/user_logged",
    failureFlash: true,
    failureRedirect: "/user_login"
}), function(req,res){
});

router.get("/user_logged", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/logged");
})

router.get("/user_profile", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/profile");
})


//USER EDIT PASSWORD ROUTES
router.put("/user_profile/:id", middleware.isUserLoggedIn, function(req,res) {
    async.waterfall([
        function(done) {
    User.findById(req.params.id, function(err, user) {
        if(err || !user) {
            req.flash("error", "User not found");
            return res.redirect("/user_profile");
        }

            user.setPassword(req.body.newPassword, function(err) {
            if(err){
                req.flash("error", "something went wrong while resetting password");
                res.redirect("/user_profile")
            }else{
                user.password = req.body.newPassword;
                user.save(function(err) {
                req.logIn(user, function(err) {
                done(err, user);
                });
            });
            }
        })
    })
}
], function(err) {
    if (err){
        console.log(err.message);
        req.flash("error", "Something went wrong")
        res.redirect("/user_profile");
    }else{
        req.flash("success", "Password updated successfully");
        res.redirect('/user_profile');
    }
    });
});


// MEMBERS ROUTE
router.get("/user_payment", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/payment");
});

router.get("/user_buy", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/buy");
})

router.get("/user_withdraw", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/withdraw");
})

router.post("/user_withdraw/:id", middleware.isUserLoggedIn, function(req, res) {
        var amount = req.body.amount;
        var wallet = req.body.walletAddress;
            async.waterfall([
            function(done) {
                User.findById(req.params.id, function(err, user) {
                    if (err || !user) {
          req.flash('error', 'You have no account with us.');
          return res.redirect('/');
        }
        done(err, user);
      });
    },
        function(user, done) {
        var userEmail = user.username;
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail', 
            auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_PASS
            }
        }));
        
    
        var mailOptions = {
            to: process.env.WITHDRAW_GMAIL_ADDRESS, 
            from: 'Binaryxinvestment',
            subject: 'withdrawal alert',
            text: 'I would like to make a withdrawal of $' + amount + ' using the wallet ' + wallet 
        };
        transporter.sendMail(mailOptions, function(err) {
            console.log(amount);
            console.log(wallet);
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent for withdrawal notification');
            done(err, 'done');
        });
        }
    ], function(err) {
        if (err) {
            console.log(err.message);
            req.flash("error", "E-mail not sent");
            return res.redirect('/user_withdraw');
        }
        res.redirect('/user_withdraw');
    });
})

router.post("/user_buy/:id", middleware.isUserLoggedIn, function(req, res) {
    var amount = req.body.amount;
    var method = req.body.method;
        async.waterfall([
        function(done) {
            User.findById(req.params.id, function(err, user) {
                if (err || !user) {
      req.flash('error', 'You have no account with us.');
      return res.redirect('/');
    }
    done(err, user);
  });
},
    function(user, done) {
    var userEmail = user.username;
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail', 
        auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASS
        }
    }));
    

    var mailOptions = {
        to: userEmail,
        from: 'Binaryxinvestment',
        subject: 'Payment alert',
        text: 'Make your payment using ' + method 
    };

    var mailOptions1 = {
        to: process.env.WITHDRAW_GMAIL_ADDRESS, 
        from: 'Binaryxinvestment',
        subject: 'Payment alert',
        text: userEmail + ' is about to make a payment via ' + method 
    };

    transporter.sendMail(mailOptions, function(err) {
        console.log('Mail sent');
        req.flash('success', 'An e-mail has been sent for buy notification');

        transporter.sendMail(mailOptions1, function(err) {
            console.log("Message sent to admin");
        });
        done(err, 'done');
    });
    
}
], function(err) {
    if (err) {
        req.flash("error", "E-mail not sent");
        return res.redirect('/user_buy');
    }
    res.redirect('/user_buy');
});
})

router.get("/user_ref", middleware.isUserLoggedIn, function(req,res) {
    res.render("user_ui/ref");
})


// LOG OUT ROUTE
router.get("/user_logout", function(req,res){
    req.logout();
    req.flash("success", "You are signed out");
    res.redirect("/");
});


module.exports = router;