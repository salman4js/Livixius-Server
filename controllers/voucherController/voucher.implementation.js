const paymentTrackerImpl = require("../payment.tracker/payment.tracker.controller");
const VouchersModel = require("../../models/Vouchers/voucher.model.details");

// Get all payment tracker amount sum!
async function getAllVouchersSum(reqBody){ // Couls be either payment or receipt based on the params!
  const vouchersModel = await VouchersModel.find({accId: reqBody.accId});
  var totalAmount = 0;
  vouchersModel.map((options, index) => {
    totalAmount += Number(options[reqBody.action])
  });
  return totalAmount
};

// Net profit calculation implementation1
async function netProfitPreview(reqBody){
  var voucherPayment = await getAllVouchersSum({accId: reqBody.accId, action: 'payment'});
  var vouchersReceipt = await getAllVouchersSum({accId: reqBody.accId, action: 'receipt'});
  var paymentTrackerSum =  await paymentTrackerImpl.getAllPaymentTrackerSum(reqBody);
  var netProfit = (paymentTrackerSum.totalAmount + voucherPayment) - (paymentTrackerSum.totalTaxableAmount - vouchersReceipt);
  var netProfitForVouchers = voucherPayment - vouchersReceipt;
  return {vouchersPayment: voucherPayment + " Rs", 
    vouchersReceipt: vouchersReceipt + " Rs", 
    paymentTrackerSum: paymentTrackerSum.totalAmount + " Rs",
    paymentTrackerTotalTaxable: Math.round(paymentTrackerSum.totalTaxableAmount) + " Rs",
    netProfit: Math.round(netProfit) + " Rs",
    netProfitForVouchers: Math.round(netProfitForVouchers) + " Rs"
  };
}

module.exports = {
  getAllVouchersSum, netProfitPreview
}