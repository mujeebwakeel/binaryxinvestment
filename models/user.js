var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    phoneNumber: String,
    earnedTotal: {type: Number, default: 0},
    accountBalance: {type: Number, default: 0},
    activeDeposit: {type: Number, default: 0},
    totalWithdrawal: {type: Number, default: 0},
    paymentDetail: [
                {
                    amount: {type: Number, default: 0},
                    date: String
                }
            ],
    referrals: [
                {
                    name: String,
                    date: String,
                    amount: Number
                }
            ],
    isAdmin: {type: Boolean, default: false}

});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);