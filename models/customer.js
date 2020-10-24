var mongoose = require("mongoose");
var moment = require("moment");

var customerSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    phoneNum: {type: String, required: true},
    request: {type: String, required: true},
    area: {type: String, required: true}, 
    paid: {type: Boolean, default:false},
    counter: {type: Number, default: 1},
    created: {type: Date, default: moment().format()},
    moveCreated: {type: Date, default: moment().format()}
});


module.exports = mongoose.model("Customer", customerSchema);