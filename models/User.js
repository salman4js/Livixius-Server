const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : String,
    phonenumber : String,
    secondphonenumber : String,
    adults : String,
    childrens : String,
    extraBeds: {type: String, default: 0},
    extraBedPrice: {type: String, default: 0},
    emailid : String,
    password : String,
    aadharcard : String,
    dateofcheckin : String,
    checkinTime: String,
    dateofcheckout : String,
    checkoutTime: String,
    prebookroomprice : String,
    discount:  String,
    advance: String,
    roomno: String,
    room : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    },
    lodge: String,
    channel: {type: String, default: "Walk-In"}
})

module.exports = mongoose.model("Users", userSchema);
