var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    firstName: String,
    lastName: String,
    resetPasswordExpires: Date,
    resetPasswordToken: String,
    email: {type: String, unique: true, required: true},
    isAdmin: {type: Boolean, default: false},
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);