const mongoose = require("mongoose");

const paymentTracker = new mongoose.Schema({
  roomno: String,
  amount: String,
  amountFor: String,
  dateTime: String,
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rooms"
  }
})

module.exports = mongoose.model("PaymentTracker", paymentTracker);