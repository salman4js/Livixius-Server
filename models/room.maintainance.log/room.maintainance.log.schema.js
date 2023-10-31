const mongoose = require("mongoose");

// Room maintainance log design schema!
const roomMaintainanceLog = new mongoose.Schema({
  price: {type: Number, default: 0},
  priceLog: String,
  priceType: {type: String, default: 'Others'},
  isPaid: {type: Boolean, default: false},
  dateTime: {type: String, default: "0:00:000"},
  userId: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Users"
  }
});

module.exports = mongoose.model("MaintainanceLog", roomMaintainanceLog);