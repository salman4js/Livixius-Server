const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  voucherName: String,
  voucherDetails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "VoucherDetails"
  }],
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
})

module.exports = mongoose.model("Vouchers", voucherSchema);