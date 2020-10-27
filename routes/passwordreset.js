var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var crypto = require("crypto");

// forgot password
router.get('/user_forget', function(req, res) {
  if(req.user) {
    req.flash("message", "You are currently logged in");
    return res.redirect("/user_login");
}
  res.render('user_ui/forget');
});

router.post('/user_forget', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({username: req.body.email}, function(err, user) {
          if (err || !user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/user_forget');
        }

        done(err,user);
      });
    },
    
    function(user, done) {
      var password = user.password;
      var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail', 
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS
        }
      }));
       

      var mailOptions = {
        to: user.username,
        from: process.env.GMAIL_ADDRESS,
        subject: 'Binaryxinvestment User Password ',
        text: 'Your password is: ' + password
      };
      transporter.sendMail(mailOptions, function(err) {
        if(!err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.username + ' with your password.');
        }
        
        done(err, user, 'done');
      });
    }
  ], function(err) {
    if (err) {
      req.flash("error", "E-mail not sent, kindly contact the admin via ");
      return res.redirect('/user_forget');
  }
  res.redirect('/user_forget');
  });
});

module.exports = router;