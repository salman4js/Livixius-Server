const RefundTracker = require("../../models/refund.tracker/refund.tracker");
const PaymentTracker = require("../payment.tracker/payment.tracker.controller")
const Lodge = require("../../models/Lodges");

// Add refund tracker implementation!
async function setRefund(data){
  var refundTracker = await new RefundTracker(data);
  if(refundTracker){
    // When refund tracker added, delete that instance from payment tracker!
    if(!data.isPaymentTrackerHandled){
      const paymentTracker = PaymentTracker.deletePrebookPaymentTracker(data.userId);
    };
    await Lodge.findByIdAndUpdate({_id: data.lodge}, {$push: {refundTrackers: refundTracker._id}});
    await refundTracker.save();
  }
  return refundTracker;
}

// Get all refund amounts!
async function getRefund(data){
  return RefundTracker.find(data)
    .then(data => {
      return {success: true, data: data}
    }).catch(err => {
      return {success: false, data: error};
    })
}

// Delete all refund tracker for the particular lodge!
async function deleteRefund(data){
  return RefundTracker.deleteMany({lodge: data.id})
    .then(data => {
      return {success: true, data: data}
    }).catch(err => {
      return {success: false, data: err}
    })
}

// Delete specific refund tracker!
async function deleteSpecificRefund(data){
  return RefundTracker.findByIdAndDelete({_id: data.refundId})
    .then(data => {
      return {success: true, data: data}
    }).catch(err => {
      return {success: false, data: err}
    })
}

module.exports = {
  setRefund, getRefund, deleteRefund, deleteSpecificRefund
}