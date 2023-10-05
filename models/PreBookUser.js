const mongoose = require("mongoose");

const preBookSchema = new mongoose.Schema({
  roomno : String,
  prebookUsername : String,
  prebookPhoneNumber : String,
  prebookSecondNumber : String,
  prebookAdults : String,
  prebookChildren : String,
  prebookAadharCard : String,
  prebookDateofCheckin : String,
  prebookDateofCheckout : String,
  prebookAdvance : String,
  prebookdiscount : String,
  prebookprice : String,
  prebookcheckinTime: String,
  prebookcheckoutTime: String,
  prebookChannelManager: String,
  prebookChannel: String,
  room : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  }, 
  floorNo: String,
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("Prebooks", preBookSchema);