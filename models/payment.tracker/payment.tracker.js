const mongoose = require("mongoose");

const paymentTracker = new mongoose.Schema({
  roomno: String,
  amount: String,
  amountFor: String,
  dateTime: String,
  isPrebook: {type: Boolean, default: false},
  isCheckedout: {type: Boolean, default: false},
  userId: String,
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rooms"
  },
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
});

module.exports = mongoose.model("PaymentTracker", paymentTracker);