const PaymentTracker = require("../../models/payment.tracker/payment.tracker");

const Room = require("../../models/Rooms");

// Add payment tracker to the particular rooms!
async function addPaymentTracker(req,res,next){
  const paymentTracker = await setPaymentTracker(req.body) // Create a new payment 
  // tracker instance using the request params!
  if(paymentTracker){
    res.status(200).json({
      success: true,
      message: "Payment tracker added!"
    })
  } else {
    res.status(200).json({
      error: err,
      success: false,
      message: "Internal error occured!"
    })
  }  
}

// Add payment tracker implementation!
async function setPaymentTracker(data){
  const paymentTracker = await new PaymentTracker(data);
  if(paymentTracker){
    await Room.findByIdAndUpdate({_id: data.room}, {$push: {paymentTracker: paymentTracker._id}})
  }
  await paymentTracker.save();
  return paymentTracker;
}

// Get all the payment for the specific rooms!
async function getPayment(req,res,next){
  PaymentTracker.find({room: req.body.room})
    .then(data => {
      res.status(200).json({
        success: true,
        message: data
      })
    }).catch(err => {
      res.status(200).json({
        success: false,
        message: "Internal server error occured!"
      })
    })
}

// Delete single payment tracker!
async function deleteSinglePaymentTracker(req,res,next){
  PaymentTracker.findByIdAndDelete({_id: req.body.paymentId})
    .then(data => {
      res.status(200).json({
        success: true,
        message: "Payment Tracker Deleted!"
      })
    })
    .catch(err => {(
      res.status(200).json({
        success: false,
        message: "Internal error occured"
      })
    )})
}

module.exports = {
  addPaymentTracker, getPayment, deleteSinglePaymentTracker, setPaymentTracker
}