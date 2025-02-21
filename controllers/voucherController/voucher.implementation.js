const paymentTrackerImpl = require("../payment.tracker/payment.tracker.controller");
const VouchersModel = require("../../models/Vouchers/voucher.model.details");
const Vouchers = require("../../models/Vouchers/voucher.model");
const commonUtils = require("../../common.functions/common.functions");
const _ = require('lodash');

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

// Get voucher tracker sum based on the date and payment model (Payment/Receipt) and voucherId.
async function getVoucherTrackerSum(options) {
  try {
    const matchQuery = Object.keys(options).reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {}); // Form the matching query based on the options object.
    var aggregateGroupId = options.voucherId !== undefined ?
        {voucherId: options.voucherId, voucherDetails: await Vouchers.findById(options.voucherId).select('voucherName')}
        : {accId: options.accId};
    return await VouchersModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: aggregateGroupId,
          totalPayment: { $sum: { $toInt: '$payment' } },
          totalReceipt: { $sum: { $toInt: '$receipt' } },
        },
      },
    ]).exec();
  } catch (err) {
    return err;
  }
};

// Get vouchers table reports value!
async function getVoucherTableReports(options) {
  var voucherModelDetails = await VouchersModel.find(options).select('voucherId'),
      voucherIds = voucherModelDetails.map(item => item.voucherId),
      voucherTableData = [],
      cellValues = [];

  await Promise.all(_.uniqWith(voucherIds, _.isEqual).map(async (voucherId) => {
    options['voucherId'] = voucherId;
    var tableData = await getVoucherTrackerSum(options);
    voucherTableData.push(tableData[0]);
  }));
  voucherTableData.map((options) => {
    options._id.voucherDetails['totalPayment'] = options.totalPayment;
    options._id.voucherDetails['totalReceipt'] = options.totalReceipt;
    cellValues.push(options._id.voucherDetails);
  });
  return cellValues;
};

// Net profit calculation implementation1
async function netProfitPreview(reqBody){
  var inflowDetails = await paymentTrackerImpl.getAllPaymentTrackerSum(reqBody),
      outflowDetails = await getVoucherTrackerSum(reqBody),
      netProfitStatus = ((inflowDetails?.totalAmount + outflowDetails[0]?.totalReceipt) - (inflowDetails?.totalTaxableAmount + outflowDetails[0]?.totalPayment)),
      tableReport = await getVoucherTableReports(reqBody),
      tableHeader = {
          outflow: ['Voucher Name', 'Payment', 'Receipt'],
          inflow: []
      };
  return {inflowDetails, outflowDetails: outflowDetails[0], netProfitStatus, tableReport, tableHeader};
};

// Get last entry voucher model voucher number!
async function getLastEntryVoucherModelNumber(reqBody){
  var voucherModelInstance = await VouchersModel.find({accId: reqBody.accId, voucherId: reqBody.voucherId});
  var lastEntryVoucherModelIndex = voucherModelInstance.length - 1;
  var lastEntryVoucherModel = voucherModelInstance[lastEntryVoucherModelIndex];
  return lastEntryVoucherModel?.vNo !== undefined ? lastEntryVoucherModel.vNo : 0;
};

async function getVouchersModel(reqBody){
  return Vouchers.find({lodge: reqBody.accId}).then((result => {
    return result;
  })).catch((err) => {
    return err;
  })
};

async function editVoucherModel(options){
  return new Promise((resolve, reject) => {
    VouchersModel.findByIdAndUpdate(options.selectedNodes, {
      dateTime: options.dateTime,
      particulars: options.particulars,
      cashMode: options.cashMode,
      receipt: options.receipt,
      payment: options.payment
    }, {new:true}).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    })
  });
};

async function deleteVoucherModel(options){
  var voucherModelIds = JSON.parse(options.selectedNodes);
  try{
    for(const id of voucherModelIds){
      await Vouchers.updateMany({voucherDetails: id}, {$pull: {voucherDetails: id}});
      await VouchersModel.findByIdAndDelete(id);
    }
    return true;
  } catch(err){
    return err;
  }
};

async function addVoucherModel(options){
  // When we add a voucher model, we want the voucher number to gets updated everytime automatically!
  // And for that, we need to get the last entry voucher model number and has to icrement it by 1.
  // Get the last entry of a voucher model!
  var lastEntryVoucherNumber = await getLastEntryVoucherModelNumber(options);
  options['vNo'] = Number(lastEntryVoucherNumber) + 1;
  var voucherModel = new VouchersModel(options);
  if(voucherModel){
    await Vouchers.findByIdAndUpdate({_id: options.voucherId}, {$push: {voucherDetails: voucherModel._id}});
    await voucherModel.save();
    return voucherModel;
  }
  return null;
};

module.exports = {
  getAllVouchersSum, netProfitPreview, getIndividualVoucherModel, getLastEntryVoucherModelNumber, getVouchersModel,
  deleteVoucherModel, editVoucherModel, addVoucherModel
}