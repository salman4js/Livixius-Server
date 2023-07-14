const RefundTracker = require("../../models/refund.tracker/refund.tracker");
const RefundTrackerImplementation = require("./refund.tracker.implementation");
const PaymentTracker = require("../payment.tracker/payment.tracker.controller")
const Lodge = require("../../models/Lodges");

// Add refund to the refund list controller!
async function addRefund(req,res,next){
  const refundTracker = await RefundTrackerImplementation.setRefund(req.body);
  // Create a new refund tracker instance!
  if(refundTracker){
    res.status(200).json({
      success: true,
      message: "Refund tracker added.."
    })
  } else {
    res.status(200).json({
      success: false,
      message: "Internal error occured"
    })
  }
}

// Get refund tracker controller!
async function getRefund(req,res,next){
  // Form search query!
  const data = {
    lodge: req.params.id
  }
  // If roomno is not undefined, add it as the search query params!
  if(req.body.roomId !== undefined){
    data.roomId = req.body.roomId
  }
  const refundTracker = await RefundTrackerImplementation.getRefund(data);
  if(refundTracker){
    res.status(200).json({
      success: refundTracker.success,
      message: refundTracker.data,
      infoMessage: "No refund being tracked for this room",
      tableHeaders: ['Date', 'Amount For', 'Amount', 'Room No', "Guest Name"]
    })
  }
}

// Delete refund tracker controller!
async function deleteRefund(req, res, next){
  const refundTracker = await RefundTrackerImplementation.deleteRefund(req.params);
  if(refundTracker){
    res.status(200).json({
      success: refundTracker.success,
      message: refundTracker.data
    })
  }
}

// Delete specific refund tracker controller!
async function deleteSpecificRefund(req,res,next){
  const refundTracker = await RefundTrackerImplementation.deleteSpecificRefund(req.body);
  if(refundTracker){
    res.status(200).json({
      success: refundTracker.success,
      message: refundTracker.data
    })
  }
}

module.exports = {
  addRefund, getRefund, deleteRefund, deleteSpecificRefund
}