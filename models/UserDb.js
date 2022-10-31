const mongoose = require("mongoose");

const userdbSchema = new mongoose.Schema({
    username : String,
    phonenumber : String,
    secondphonenumber : String,
    adults : String,
    childrens : String,
    emailid : String,
    password : String,
    aadharcard : String,
    dateofcheckin : String,
    dateofcheckout : {type : String, default : ""},
    stayedDays : String,
    roomno : String,
    userid : String,
    bill : String,
    paid : Boolean,
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
