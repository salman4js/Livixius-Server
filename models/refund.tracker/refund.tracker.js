const mongoose = require("mongoose");

const refundTracker = new mongoose.Schema({
  date: String,
  refundFor: String,
  refundAmount: String,
  roomno: String,
  roomId: String,
  username: String,
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
})

module.exports = mongoose.model("RefundTracker", refundTracker);