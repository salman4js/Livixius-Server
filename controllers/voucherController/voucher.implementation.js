const paymentTrackerImpl = require("../payment.tracker/payment.tracker.controller");
const VouchersModel = require("../../models/Vouchers/voucher.model.details");
const Vouchers = require("../../models/Vouchers/voucher.model");
const commonUtils = require("../../common.functions/common.functions");

// Get all payment tracker amount sum!
async function getAllVouchersSum(reqBody){ // Could be either payment or receipt based on the params!
  var voucherDateModel = commonUtils.convertDateIntoCustomFormat(reqBody.date, 'yyyy/mm/dd');
  const vouchersModel = await VouchersModel.find({accId: reqBody.accId, dateTime: voucherDateModel});
  var totalAmount = 0;
  vouchersModel.forEach((options, index) => {
    totalAmount += Number(options[reqBody.action]);
  });
  return totalAmount
};

// Get total amount of voucher model details based on the voucher model!
// Get total amount of voucher model details based on the voucher model!
async function getTotalAmountOfVoucherModel(voucherDetails, action, reqBody) {
  var voucherDateModel = commonUtils.convertDateIntoCustomFormat(reqBody.date, 'yyyy/mm/dd');
  var totalAmount = 0;
  for (let i = 0; i <= voucherDetails.length - 1; i++) {
    const voucherModel = await VouchersModel.find({ _id: voucherDetails[i], dateTime: voucherDateModel});
    voucherModel.forEach((options, index) => {
      totalAmount += Number(options[action]);
    });
  }
  return totalAmount;
}

// Get individual voucher model payment sum!
async function getIndividualVoucherModel(reqBody, action){
  const vouchers = await Vouchers.find({lodge: reqBody.accId});
  var voucherModelObj = []; // Each voucher model array!
  await Promise.all(vouchers.map(async (options, index) => {
    var eachVoucherModel = {};
    var amount = await getTotalAmountOfVoucherModel(options.voucherDetails, action, reqBody) || 0;
    if(amount > 0){ // Only send the voucher model if there is any entry for the specified date!
      eachVoucherModel['dummyValue'] = 'dummyValueForUI'; // UI needed a dummy value at first for table
      eachVoucherModel['name'] = options.voucherName;
      eachVoucherModel['amount'] = amount;
      voucherModelObj.push(eachVoucherModel);
    }
  }));
  
  return voucherModelObj;
}

// Net profit calculation implementation1
async function netProfitPreview(reqBody){
  var voucherPayment = await getAllVouchersSum({accId: reqBody.accId, action: 'payment', date: reqBody.date});
  var vouchersReceipt = await getAllVouchersSum({accId: reqBody.accId, action: 'receipt', date: reqBody.date});
  var individualVoucherReportForPayment = await getIndividualVoucherModel(reqBody, 'payment');
  var individualVoucherReportForReceipt = await getIndividualVoucherModel(reqBody, 'receipt');
  var individualVoucherReportTableHeader = ['Voucher Name', 'Amount'];
  var paymentTrackerSum =  await paymentTrackerImpl.getAllPaymentTrackerSum(reqBody);
  var netProfitForVouchers = voucherPayment - vouchersReceipt;
  var netProfit = (paymentTrackerSum.totalAmount - paymentTrackerSum.totalTaxableAmount) - netProfitForVouchers;
  return {vouchersPayment: voucherPayment + " Rs", 
    vouchersReceipt: vouchersReceipt + " Rs", 
    paymentTrackerSum: paymentTrackerSum.totalAmount + " Rs",
    paymentTrackerTotalTaxable: Math.round(paymentTrackerSum.totalTaxableAmount) + " Rs",
    netProfit: Math.round(netProfit) + " Rs",
    netProfitForVouchers: Math.round(netProfitForVouchers) + " Rs",
    individualVoucherReportForPayment: individualVoucherReportForPayment,
    individualVoucherReportForReceipt: individualVoucherReportForReceipt,
    individualVoucherReportTableHeader: individualVoucherReportTableHeader
  };
}

module.exports = {
  getAllVouchersSum, netProfitPreview, getIndividualVoucherModel
}