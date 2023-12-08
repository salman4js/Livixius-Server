const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : String,
    phonenumber : String,
    secondphonenumber : String,
    address: String,
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
    isRoomTransfered: {type: Boolean, default: false},
    oldRoomPrice: {type: Number, default: 0}, // this is to keep track of old room price incase of room transfer!
    oldRoomNo: String,
    oldRoomStayDays: {type: Number, default: 0},
    discount:  String,
    advance: String,
    roomno: String,
    floorNo: String,
    receiptId: {type: String, default: Date.now()},
    checkinBy: String,
    checkoutBy: String,
    transferBy: String,
    room : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    },
    maintainanceLog: [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "MaintainanceLog"
    }],
    lodge: String,
    channel: {type: String, default: "Walk-In"}
})

module.exports = mongoose.model("Users", userSchema);
