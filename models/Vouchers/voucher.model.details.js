const mongoose = require("mongoose");

const voucherDetails = new mongoose.Schema({
  vNo: String,
  dateTime: String,
  particulars: String,
  cashMode: String,
  receipt: String,
  payment: String,
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vouchers"
  }
})

module.exports = mongoose.model("VoucherDetails", voucherDetails);