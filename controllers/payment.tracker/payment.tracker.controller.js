const PaymentTracker = require("../../models/payment.tracker/payment.tracker");
const commonUtils = require("../../common.functions/common.functions");
const Room = require("../../models/Rooms");
const Lodge = require("../../models/Lodges")
const User = require("../../models/User");
const PreBookUser = require("../../models/PreBookUser");
const ResponseHandler = require("../../ResponseHandler/ResponseHandler");

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

  // Info Message!
  var prebookInfoMessage = 'No prebook payment are currently being tracked for this room!';
  var checkinInfoMessage = 'No payment are currently being tracked for this room!'
  var infoMessage = req.body.isPrebook ? prebookInfoMessage : checkinInfoMessage

  // Model Data for trim the prebook data!
  var modelData = {
    'paymentTrackerId' : '_id', 
    'amount': 'amount', 
    'amountFor': 'amountFor', 
    'dateTime': 'dateTime', 
    'isPrebook': 'isPrebook'
  }
  
  // Table header property values for UI!
  var prebookTableHeaders = ['Amount', 'Amount For', 'Date & Time', 'Mode', 'Customer Name', "Expected Check-In"];
  
  var checkinTableHeaders = ['Amount', 'Amount For', 'Date & Time', 'Mode'];
  
  var tableHeaders = req.body.isPrebook ? prebookTableHeaders : checkinTableHeaders;
  
  PaymentTracker.find({room: req.body.room, isPrebook: req.body.isPrebook, isCheckedout: false})
    .then(async data => {
      let trimmedData = commonUtils.trimData(data, modelData); // Send only what the UI wants!
      for (var i = 0; i < trimmedData.length; i++) {
        if(req.body.isPrebook){
          // Get customer details and assign it in the table response only if its a prebook property!
          var filterQuery = {
            userId: data[i].userId,
            room: data[i].room,
            isPrebook: req.body.isPrebook
          }
          const customerDetails = await getCustomerDetails(filterQuery);
          trimmedData[i]['customername'] = customerDetails[0].prebookUsername;
          trimmedData[i]['expectedCheckin'] = customerDetails[0].prebookDateofCheckin;
        }
        trimmedData[i].isPrebook = trimmedData[i].isPrebook ? "Prebook" : "Check-In";
      }
      
      // If the amount has not provided, set it as zero!
      var transformInto = 0;
      trimmedData = commonUtils.transformNonValidValues(trimmedData, transformInto);

      res.status(200).json({
        success: true,
        message: trimmedData,
        tableHeaders: tableHeaders,
        infoMessage: infoMessage
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
    .then(async data => {
      // Delete room and lodge instance!
      const deleteRoomAndLodgeRef = await deleteRoomAndLodgeInstance(data);
      // Decrement the amount tracker by the payment tracker in the advance of the user instance!
      const getAmount = data.amount; // Single payment tracker instance!
      const totalAdvance = await getTotalAdvance(data.userId, data.isPrebook);
      const updatedAmount = Number(totalAdvance) - Number(getAmount);
      const updatedInstance = await updateInstance(data, updatedAmount);
      res.status(200).json({
        success: true,
        message: "Payment Tracker Deleted!",
        roomId: data.room
      })
    }).catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Update the schema instanc based on action!
async function updateInstance(data, updatedAmount){
  if(!data.isPrebook){
    await User.findByIdAndUpdate({_id: data.userId}, {advance: updatedAmount.toString()});
    // Update room schema for the advance amount, we are dealing with room schema for bill preview!
    await Room.findByIdAndUpdate({_id: data.room, user: data.userId}, {advancePrice: updatedAmount.toString()});
  } else {
    await PreBookUser.findByIdAndUpdate({_id: data.userId}, {prebookAdvance: updatedAmount.toString()});
  }
  return;
}

// Get the total advance paid by the guest!
async function getTotalAdvance(userId, isPrebookState){
  if(!isPrebookState){
    var userInstance =  await User.findById({_id: userId});
    return userInstance.advance;
  } else {
    var prebookUserInstance = await PreBookUser.findById({_id: userId});
    return prebookUserInstance.prebookAdvance;
  }
}

// Delete room and lodge instance when payment tracker gets deleted!
async function deleteRoomAndLodgeInstance(data){
  await Lodge.findByIdAndUpdate({_id: data.lodge}, {$pull: {paymentTracker:data._id}});
  await Room.findByIdAndUpdate({_id: data.room}, {$pull: {paymentTracker: data._id}});
  return;
}

// Get customer details from the userController!
async function getCustomerDetails(filterQuery){
  if(!filterQuery.isPrebook){
    const result = await User.find(filterQuery);
    return result;
  } else {
    const result = await PreBookUser.find(filterQuery);
    return result;
  }
}

// Data for receipt generation by the paymentID!
async function getPaymentDetails(req, res, next) {
  var paymentIds = req.body.paymentIds;
  
  // Model data for paymentTracker
  var modelData = {
    "paymentId" : '_id',
    "roomno" : 'roomno',
    'dateTime' : "dateTime",
    "amountFor": "amountFor",
    "amount": "amount",
  } 
  
  // Model data for customer details for checkin property!
  var customerData = {
    "customername" : "username",
    "phonenumber" : "phonenumber"
  }
  
  // Model data for customer details for prebook property!
  var prebookCustomerData = {
    "customername" : "prebookUsername",
    "phonenumber": "prebookPhoneNumber"
  }
  
  // total amount handler!
  var totalAmount = 0;
  
  try {
    var promises = paymentIds.map(async (id) => {
      // Check to see if the selection are of the same customers, in prebook scenario!
      const paymentTracker = await PaymentTracker.findById({ _id: id });
      return paymentTracker;
    });
    const paymentTracker = await PaymentTracker.findById({_id: paymentIds[0]}); //  Since we are dealing with the same room
    // By payment id, we can able to get room id!
    // Get customer details for receipt generation!
    var filterQuery = {
      room: paymentTracker.room,
      _id: paymentTracker.userId,
      isPrebook: req.body.isPrebook
    }
    const customerDetails = await getCustomerDetails(filterQuery);
    const modelDataForCustomerDetails = req.body.isPrebook ? prebookCustomerData : customerData; // Send the modelData based on the state the user in!
    const customizedCustomerDetails = commonUtils.trimData(customerDetails, modelDataForCustomerDetails);

    var result = await Promise.all(promises);
    // Check for same selection!
    const checkSelections = await checkValidSelections(result);
    if(checkSelections){
      let trimmedData = commonUtils.trimData(result, modelData);
      
      // When the amount field is empty or not provided, set the field amount into zero value!
      trimmedData = commonUtils.transformNonValidValues(trimmedData, "0");

      // Generate total amount for the selected paymentTracker!
      trimmedData.map((options, index) => {
        totalAmount += Number(options.amount);
      })
      
      res.status(200).json({
        success: true,
        message: trimmedData,
        customerDetails: customizedCustomerDetails[0], // We always get one object 
        // in the array as we can only able to checkin one customer at a time!
        // But in case of prebook receipt generation, we might get multiple objects!
        totalAmount: totalAmount,
        tableHeaders: ['Room No', 'Date & Time', "Amount For", 'Amount']
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Multiple different users selections!"
      });
    }
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Some internal error occurred!"
    });
  }
}

// Check for same customer selections!
async function checkValidSelections(data){
  // Take first userId as the reference!
  const refUserId = data[0].userId;
  const areValidSelections = data.every(obj => obj.userId === refUserId);
  return areValidSelections; 
}

// Delete payment tracker while checking out implementation! (Move this payment tracker from prebook section to checkin section~!)
async function deletePaymentTracker(roomId){
  const result = await PaymentTracker.updateMany({room: roomId, isPrebook: false}, {isCheckedout: true});
  return result;
}

// Update paymentTracker state to checkin!
async function updatePaymentTracker(options){
  const result = await PaymentTracker.updateMany({room: options.room, userId: options.userId}, {isPrebook: false, userId: options.updatedUserId});
  return result;
}

// Get all payment tracker!
async function getAllPaymentTracker(req, res, next){
  var infoMessage = 'No payment are currently being tracked for this room';
  var tableHeaders = ['Amount', 'Amount For', 'Date & Time', 'Booking Mode', 'Status'];
  // Trim model data!
  var modelData = {
    'paymentTrackerId' : '_id', 
    'amount': 'amount', 
    'amountFor': 'amountFor', 
    'dateTime': 'dateTime',
    'isPrebook': 'isPrebook',
    'isCheckedout': 'isCheckedout'
  }
  PaymentTracker.find({lodge: req.body.accId, room: req.body.roomId})
    .then(data => {
      // Send what only the UI wants!
      var trimmedData = commonUtils.trimData(data, modelData);
      // Modify the data according to the UI!
      for (var i = 0; i < trimmedData.length; i++) {
        trimmedData[i].isPrebook = trimmedData[i].isPrebook ? "Prebook" : "Check-In";
        trimmedData[i].isCheckedout = trimmedData[i].isCheckedout ? 'OUT' : 'IN'
      }
      
      res.status(200).json({
        success: true,
        message: trimmedData,
        infoMessage: infoMessage,
        tableHeaders: tableHeaders
      })
    }).catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Delete all payment tracker of the particular!
async function deleteAllPaymentTracker(req,res,next){
  PaymentTracker.deleteMany({lodge: req.params.id})
    .then(data => {
      res.status(200).json({
        success: true,
        message: "Deleted!"
      })
    }).catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
};

// Check any payments has been made by the user!
async function checkPayments(userId){
  return PaymentTracker.find({ userId: userId })
      .then(data => {
        return data;
      })
      .catch(error => {
        return error;
      });
};

// Get all payment tracker amount sum controller!
async function getAllPaymentTrackerAmountSum(req,res,next){
  const result = await getAllPaymentTrackerSum(req.body);
  console.log(result)
  if(result){
    ResponseHandler.success(res, result);
  } else {
    ResponseHandler.error(res);
  }
};

// Get paid amount by the particular user!
async function getPaidAmount(paymentsData){
  var attribute = "amount"; // Attribute to get added!
  return commonUtils.addModelDataAttribute(paymentsData, attribute);
}

// Delete payment tracker instance for prebook by userId!
async function deletePrebookPaymentTracker(userId){
  const paymentTracker = await PaymentTracker.deleteMany({userId: userId});
  return paymentTracker;
};

// Get all payment tracker sum as lodge wise!
async function getAllPaymentTrackerSum(reqBody){
  const paymentTracker = await PaymentTracker.find({lodge: reqBody.accId});
  var totalAmount = 0;
  var totalTaxableAmount = 0;
  paymentTracker.map((options, index) => {
    totalAmount += Number(options.amount);
    totalTaxableAmount += commonUtils.getTaxableAmount(Number(options.amount));
  });
  return {totalAmount, totalTaxableAmount};
}


module.exports = {
  addPaymentTracker, getPayment, deleteSinglePaymentTracker, setPaymentTracker, 
  getPaymentDetails, deletePaymentTracker, deleteAllPaymentTracker,
  getAllPaymentTracker, updatePaymentTracker, checkPayments, getPaidAmount,
  deletePrebookPaymentTracker, getAllPaymentTrackerSum, getAllPaymentTrackerAmountSum
}