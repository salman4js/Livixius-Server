const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceCount: String,
  receiptId: String,
  invoiceDate: String,
  paymentDate: String,
  dateofCheckin: String,
  dateofCheckout: String,
  customerName: String,
  customerPhoneNumber: String,
  aadharCard: String,
  timeofCheckin: String,
  timeofCheckout: String,
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
})

module.exports = mongoose.model("Invoice", invoiceSchema);