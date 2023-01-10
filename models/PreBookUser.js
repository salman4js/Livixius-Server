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
  prebookprice : String,
  room : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  }, 
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("Prebooks", preBookSchema);