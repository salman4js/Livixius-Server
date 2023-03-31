const mongoose = require("mongoose");

const userdbSchema = new mongoose.Schema({
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
    dateofcheckout : {type : String, default : ""},
    checkoutTime: String,
    stayedDays : String,
    roomno : String,
    userid : String,
    bill : String,
    dishbill: String,
    paid : Boolean,
    discount: String,
    advance: String,
    isGst: {type: Boolean, default: false},
    channel: {type: String, default: "Walk-In"},
    foodGst: String,
    stayGst: String,
    totalAmount: String,
    prebooked : {type : Boolean, default : false},
    room : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    },
    lodge : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Lodges"
    }
})

module.exports = mongoose.model("UserDb", userdbSchema);
