const User = require("../models/User");
const Room = require("../models/Rooms.js");
const UserDish = require("../models/UserDishes");
const UserDb = require("../models/UserDb.js");
const RoomType = require("../models/RoomType.js");
const jwt = require("jsonwebtoken");
const commonUtils = require("../common.functions/common.functions")

// Payment tracker instance!
const paymentTrackerController = require("../controllers/payment.tracker/payment.tracker.controller");

// Room status instance!
const roomStatusImplementation = require("../controllers/room.status/room.status.implementation");

// Importing brew date package to do the date handling!
const bwt = require('brew-date');
// Importing invoice memory generator implementation function!
const invoiceMemory = require("./Invoice.controller/Invoice.controller");

const addUser = (req, res, next) => {
    const user = new User({
        username: req.body.username,
        phonenumber: req.body.phonenumber,
        emailid: req.body.emailid,
        password: req.body.password
    })
    user.save()
        .then(data => {
            console.log(data)
            res.send(true)
        })
        .catch(err => {
            console.log(err)
            res.send(false)
        })
}

const addUserFromD2 = (req,res,next) => {
  const user = new User({
    phonenumber : req.body.phonenumber
  })
  user.save()
  .then(res => {
    console.log(res);
    res.status(200).json({
      success : true,
      message : "Added to the database!"
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    })
  })
}

const userdb = (req,res,next) => {
    UserDb.find({lodge : req.params.id})
    .then(data => {
        res.status(200).json({
            success : true,
            message : data,
        })
    })
    .catch(err => {
        res.status(200).json({
            success : false,
            message : "Some internal error occured!"
        })
    })
}

// Weekly Estimate

async function weeklyEstimate(req,res,next){
  const datesBetween = req.body.dates;
  UserDb.find({lodge: req.params.id})
  .then(data => {
    const valueDatesBetween = data.filter((option) => {
      return datesBetween.includes(option.dateofcheckout);
    })
    const totalRate = weekEstimate(valueDatesBetween, datesBetween); 
      res.status(200).json({
      success: true,
      message: totalRate,
      dates: datesBetween
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err} `
    })
  })
}

// Helper Function for the above implementation!
function weekEstimate(data, datesBetween){
  const result = [];
  let dayResult = 0;
  for(i = 0; i <= datesBetween.length -1; i++){
    data.map((option,key) => {
      if(option.bill !== undefined && option.dateofcheckout !== undefined){
        if(option.dateofcheckout === datesBetween[i]){
          dayResult += Number(option.bill);
        }
      }
    })
    result.push(dayResult);
    dayResult = 0;
  }
  return result;
}

const totalDailyCalculator = (req,res,next) => {
  const result = [];
  UserDb.find({lodge: req.params.id})
    .then(async data => {
      for (i = 0; i <= req.body.datesBetween.length -1; i++){
        const totalRate = await totalDailyAmount(data, req.body.datesBetween[i]);
        result.push(totalRate);
      }
      res.status(200).json({
        success: true,
        dailyCollection: result,
        label: req.body.datesBetween
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Total amount calculator for the Line monthly chart!
async function totalDailyAmount(data, date){
  let rate = 0;
  await data.map((options,key) => {
    if(options.bill !== undefined && date === options.dateofcheckout){
      rate += Number(options.bill)
    }
  })
  return rate;
}


const totalDateCalculator = (req,res,next) => {
  
  const datesBetween = bwt.getBetween(req.body.date1, req.body.date2);
  UserDb.find({lodge: req.params.id})
    .then(async data => {
      const filteredData = data.filter((item) => {
        return datesBetween.includes(item.dateofcheckout);
      })
      const totalRate = totalAmount(data, datesBetween);
      res.status(200).json({
        success: true,
        message: filteredData,
        totalAmount: totalRate,
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Generating total revenue for the brew-mobile!
const totalAmount =  (data, datesBetween) => {
  var totalRate = 0;
   data.map((item,key) => {
    if(item.bill !== undefined && datesBetween.includes(item.dateofcheckout)){
      totalRate += Number(item.bill);
      
    } 
  });
  return totalRate;
}

const userdbRoom = (req,res,next) => {
  UserDb.find({lodge : req.params.id, room: req.body.roomid})
  .then(data => {
      res.status(200).json({
          success : true,
          message : data
      })
  })
  .catch(err => {
      res.status(200).json({
          success : false,
          message : "Some internal error occured!"
      })
  })
}

const checkUser = (req, res, next) => {
    phonenumber = req.body.phonenumber,
    secphonenumber = req.body.secondphonenumber,
    roomid = req.params.id

    User.findOne({$or : [{phonenumber : phonenumber}, {secondphonenumber : secphonenumber}], room : roomid})
        .then(user => {
            if (user) {
                let token = jwt.sign({name : phonenumber}, "secretValue", {expiresIn : '1h'})
                res.status(200).json({
                  success : true,
                  message : "User logged in",
                  token
                })
            } else {
                res.status(200).json({
                  success : false,
                  message : "User not found!"
                })
            }
        })
}


const loginUser = (req, res, next) => {
    phonenumber = req.body.phonenumber,
        password = req.body.password

    User.findOne({ phonenumber: phonenumber })
        .then(user => {
            if (user) {
                if (user.password !== password) {
                    res.send("0")
                } else {
                    res.send(true)
                }
            } else {
                res.send(false)
            }
        })
}

// Get all user irrespective of the lodge!
const allUser = (req, res, next) => {
    User.find({})
        .then(data => {
            console.log(data)
            res.send(data)
        })
        .catch(err => {
            console.log(err)
            res.send(err)
        })
}

// Get remaming amount has to be paid by the staying customer!
async function getRemainingAmount(roomid, daysStayed, isHourly){
  const roomData = await Room.findById({_id: roomid});
  // Calculate the remaining amount by the customer!
  const isChannel = roomData.channel !== "Walk-In" ? true : false;
  const calculatedPrice = isChannel ? roomData.totalAmount : (Number(roomData.price) - Number(roomData.advancePrice) - Number(roomData.discountPrice));
  const totalAmount = Number(calculatedPrice) + Number(roomData.extraBedPrice) + Number(roomData.advancePrice);
  const gstPercent = getGSTPercent(roomData.price);
  const gstAmount = Number(totalAmount) * Number(gstPercent);
  const amountWithGst = totalAmount + gstAmount
  return Math.round(amountWithGst - +roomData.advancePrice);
}

// Get GST percent!
function getGSTPercent(price){
  return Number(price) < 7500 ? 0.12 : 0.18;
}

// Get customer details!
async function getCustomerDetails(roomId){
  const result = await User.find({ room: roomId });
  return result;
}

// Get customer data for the particular room!
const userRoom = async (req, res, next) => {
    // Get remaining amount has to be paid by the customer!
    // const noofstays = req.body.stayeddays.match(/\d+/);
    // const remainingAmount = await getRemainingAmount(req.body.roomid, noofstays[0], req.body.isHourly)

    // Get user data
    getCustomerDetails(req.body.roomid) // Externalizing the implementation out of the controller!
        .then(data => {
            res.status(200).json({
                success: true,
                message: data
            })
        })
        .catch(err => {
            res.status(200).json({
                success: false,
                message: "Some Internal Error Occured, Please Try Again Later!"
            })
        })
}

const deleteUser = async (req, res, next) => {
    // Check for the date, if its the first date of the month, reset the invoice
    // Count to zero.
    const date = new Date();
    const currentDate = new Date(req.body.checkoutdate); // Current Date 
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toString(); // First day of the month!
    if(currentDate == firstDayOfMonth){
      await invoiceMemory.updateInitialState(req.params.id);
    }
    
    var isGstEnabled = req.body.isGst;
    if(isGstEnabled){
      // Create invoice memory for the particular user only when GST is disabled!
      await createInvoiceMemory(req.params.id, req.body.userid, req.body.checkoutTime, req.body.checkoutdate);
    }
    
    // Get the room status of after checkout!
    checkAndMoveRoomStatus(req.body, 'afterCheckedout');
    
    // Before checking out add the checkout payment to payment tracker and then delete it!
    var paymentTrackerAmountFor = 'While checking out'
    var paymentTrackerData = {roomno: req.body.roomno, amount: req.body.amount + req.body.stayGst, 
      amountFor: paymentTrackerAmountFor, userId: req.body.userid, 
      room: req.body.roomid, lodge: req.body.accId, dateTime: req.body.dateTime }
    await paymentTrackerController.setPaymentTracker(paymentTrackerData)
    
    // Delete paymentTracker for the checking out room!
    await paymentTrackerController.deletePaymentTracker(req.body.roomid); // Delete paymentTracker when the customer checks out!
    
    try {
        const room = req.body.roomid
        // Reverting the changes caused by the discount and advance in the schema!
        await Room.updateOne({ _id: room }, { $set: { dishes: [], services: [], user : [], isOccupied : "false", channel : undefined, extraCount : 0,
        preBooked : false, preValid : true, advance: false, discount: false, 
        discountPrice: String, advancePrice: String, advanceDiscountPrice: String, 
        advancePrebookPrice: String } })
        await User.findByIdAndDelete({_id : req.body.userid})
        await UserDish.deleteMany({room : req.body.roomid})
        await UserDb.updateOne({userid : req.body.userid}, { $set : {stayedDays : req.body.stayeddays, 
          dateofcheckout : req.body.checkoutdate, checkoutTime: req.body.checkoutTime, 
          prebooked : req.body.prebook, bill: req.body.amount, dishbill: req.body.totalDishAmount, refund: req.body.refund,
          foodGst: req.body.foodGst, stayGst: req.body.stayGst, 
          totalAmount: req.body.amount + req.body.stayGst + req.body.foodGst, 
          isGst: req.body.isGst, roomType: req.body.roomtype}})
        const updateRate = await RoomType.findOne({lodge : req.params.id, suiteType : req.body.roomtype})
        //console.log("Room type", updateRate.price);
        await Room.findOneAndUpdate({_id : room}, {$set : {price : updateRate.price}});
        // Sending the response back to brew!
        res.status(200).json({
            success : true,
            message : "Customer has been checked out properly!"
        })
    } catch (err) {
        res.status(200).json({
            success : false,
            message : err
        })
    }
}

// Check and move room status!
async function checkAndMoveRoomStatus(reqBody, key){
  // Convert roomid request into roomId!
  reqBody['roomId'] = reqBody.roomid
  var data = {key: key, accId: reqBody.accId}
  const roomStatus = await roomStatusImplementation.getRoomStatusSeq(data);
  // Get the next room status!
  const nextStatus = await roomStatusImplementation.getTheNextRoomState(reqBody, key);
  if(nextStatus){
    reqBody['roomStatus'] = roomStatus;
    reqBody['nextStatus'] = nextStatus.nextRoomStatus
    reqBody['nextOfNextStatus'] = nextStatus.nextOfNextStatus
    reqBody['roomStatusConstant'] = key
  }
  if(roomStatus){
    await roomStatusImplementation.roomStatusSetter(reqBody)
  } else {
    return;
  }
}

// Helper Function -- deleteuser!
async function createInvoiceMemory(lodgeId, userid, checkoutTime, checkoutDate){
  const userdata = await UserDb.find({userid: userid});
  
  // Form data for invoice generator!
  const invoiceData = {
    receiptId: userdata.receiptId,
    invoiceDate: checkoutDate,
    paymentDate: checkoutDate,
    dateofCheckin: userdata[0].dateofcheckin,
    dateofCheckout: checkoutDate,
    customerName: userdata[0].username,
    customerPhoneNumber: userdata[0].phonenumber,
    aadharCard: userdata[0].aadharcard,
    timeofCheckin: userdata[0].checkinTime,
    timeofCheckout: checkoutTime,
    lodgeId: lodgeId
  }
  
  const result = await invoiceMemory.addInvoiceData(invoiceData);
  return result;
}

// Generate bill preview!
const generateBill = async (req,res,next) => {
  try{
    const noofstays = req.body.stayeddays.match(/\d+/);
    const isExtraCalc = req.body.extraCalc;
    const test = await Room.findById({_id: req.body.roomid})
    const discountPrice = test.discountPrice;
    await Room.findById({lodge : req.body.lodgeid, _id : req.body.roomid})
    .then(data => {
      const price = calculatePrice(+data.price, noofstays[0], req.body.isHourly);
      const extraBedCollection = +data.extraBedPrice * +data.extraCount;
      const extraBedPrice = calculatePrice(extraBedCollection, noofstays[0], req.body.isHourly);
      res.status(200).json({
        success : true,
        message : price,
        prebook : test.preBooked,
        advance: +test.advancePrebookPrice,
        advanceCheckin : +test.advancePrice,
        isAdvanced: test.advance,
        discountPrice : +discountPrice,
        extraBedCount: data.extraCount,
        extraBedPrice: data.extraBedPrice,
        extraBedCollection: isExtraCalc ? extraBedPrice : extraBedCollection,
        advanceDiscountPrice: +test.advanceDiscountPrice,
        discount: test.discount,
        totalAmount: +data.totalAmount,
        isChannel: data.channel !== "Walk-In" ? true : false
      })
    })
    
  } catch(err) {
    res.status(200).json({
      success : false,
      message : "Some internal error has occured",
    })
  }
}

// Calculate price based on the config for hourly or daily!
function calculatePrice(price, days, isHourly, extraCount, extraBedPrice){
  if(isHourly){
    const pricePerHour = price / 24; // 24 being the number of hours per day!
    return Math.round((pricePerHour * days)); // Days being the hours in the context along with it calculate extra bed price
  } else {
    return ((price * days));
  }
}

// Favourite customer handler
async function favCustomer(req, res, next){
  try{
    await UserDb.find({lodge: req.params.id})
      .then(async data => {
        const endResult = await checkFrequent(data);
        if(endResult !== undefined){
          res.status(200).json({
            success: true,
            message: endResult
          })
        } else {
          res.status(200).json({
            success: true,
            message: []
          })
        }
      }) 
  } catch(err){
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err}`,
    })
  }
}

async function checkFrequent(users){
  
  const phoneNumbers = users.map(user => user.phonenumber);
  const count = phoneNumbers.reduce((acc, phoneNumber) => {
    acc[phoneNumber] = (acc[phoneNumber] || 0) + 1;
    return acc;
  }, {});

  const frequentUsers = users.filter(user => count[user.phonenumber] >= 2 && user.dateofcheckout !== '');
  
  // Filter the user to remove duplicates as we take this data from the userdb which tends to have duplicates!
  const filteredUsers = frequentUsers.reduce((acc, user) => {
    const key = user.username + user.phonenumber;
    if (!acc.has(key)) {
      acc.set(key, user);
    }
    return acc;
  }, new Map());
  return [...filteredUsers.values()];
}

// Chart Dashboard Calculation Controllers!
async function datesEstimate(req,res,next){
  const dateArr = req.body.dates;
  UserDb.find({lodge: req.params.id})
    .then(data => {
      const weeklyTotal = weeklyHelperEstimate(data, dateArr);
      res.status(200).json({
        success: true,
        message: weeklyTotal
      }) 
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured."
      })
    })
}

function datesHelperEstimate(data, dates){
  // Performs filtering out for the specific dates!
  var weeklyTotal = 0;
  data.map((options,key) => {
    if(dates.includes(options.dateofcheckout)){
      weeklyTotal += Number(options.bill);
    }
  });
  return weeklyTotal;
}

async function roomTypeAnalysis(req,res,next){
  const result = await UserDb.find({lodge: req.params.id});
  const roomType = await getRoomType(result, req.body.date);
  res.status(200).json({
    success: true,
    result: roomType.result,
    total: roomType.total
  })
}

async function getRoomType(data, date){
  let total = 0;
  const resultObj = {};
  data.map((options, key) => {
    if(options.dateofcheckout === date){
      if(resultObj[options.roomType] !== undefined){
        resultObj[options.roomType] += Number(options.bill);
        total += Number(options.bill)
      } else {
        resultObj[options.roomType] = Number(options.bill);
        total += Number(options.bill)
      }
    }
  })
  return {result: resultObj, total: total};
} 

// Room type revenue estimator!
async function roomTypeRev(req,res,next){
  UserDb.find({lodge: req.params.id})
  .then(async data => {
    // Get Room Type by roomid and lodgeid!
    const roomType = await getType(req.params.id, data, req.body.date);
    res.status(200).json({
      success: true,
      roomTypeRev: roomType.result,
      total: roomType.total
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err}`
    })
  })
}

// Room Type Helper Function!
async function getType(lodgeid, data, date){
  const resultObj = {};
  let total = 0;
  await Promise.all(data.map(async (options) => {
    if(date === undefined){
      if(options.bill !== undefined){
        const room = await Room.findById(options.room);
        if (resultObj[room.suiteName] !== undefined) {
          resultObj[room.suiteName] += Number(options.bill);
          total += Number(options.bill);
        } else {
          resultObj[room.suiteName] = Number(options.bill);
          total += Number(options.bill);
        }
      }
    } else {
      if(options.bill !== undefined && options.dateofcheckout === date){
        const room = await Room.findById(options.room);
        if (resultObj[room.suiteName] !== undefined) {
          resultObj[room.suiteName] += Number(options.bill);
          total += Number(options.bill);
        } else {
          resultObj[room.suiteName] = Number(options.bill);
          total += Number(options.bill)
        }
      }
    }
  }));
  return {result : resultObj, total: total};
}

// Update checkedin room data!
const updateOccupiedData = async (req, res, next) => {
  try{
    const userId = req.body.userId
    if(userId === undefined){
      res.status(200).json({
        success: false,
        message: "Missing User Id"
      })
    } else {
      await User.findByIdAndUpdate(userId, {
        username: req.body.username,
        phonenumber: req.body.phonenumber,
        secondphonenumber: req.body.secondphonenumber,
        adults: req.body.adults,
        childrens: req.body.childrens,
        extraBeds: req.body.extraBeds,
        aadharcard: req.body.aadharcard,
        dateofcheckout: req.body.dateofcheckout,
        advance: req.body.updatedAdvance, // Added prev advance with the updated advance in the UI itself!
        discount: req.body.discount,
        checkoutTime: req.body.checkOutTime,
      })
      
      // Track advance payment entry
      const paymentParams = {
        roomno: req.body.roomno,
        room: req.body.roomId,
        amountFor: req.body.amountFor,
        amount: req.body.advance,
        dateTime: req.body.dateTime,
        isPrebook: req.body.isPrebook,
        lodge: req.params.id,
        userId: userId
      }
      const paymentTracker = await paymentTrackerController.setPaymentTracker(paymentParams);
      
      // Update room schema advancePrice, since we are dealing with room schema for bill preview!
      // Check if the updatedAdvance schema has been updated!
      if(commonUtils.checkIfValid(req.body.updatedAdvance, "0")){
        const updateRoomSchemaAdvancePrice = await Room.findByIdAndUpdate({_id: req.body.roomId}, {advancePrice: req.body.updatedAdvance, advance: true}); 
      }
      
      // Updating room prevalid to true as we got date of checkout!
      if(req.body.dateofcheckout !== undefined){
        // Change prevalid boolean value!
        await Room.findByIdAndUpdate(req.body.roomId, {
          preValid: true
        })
      }
      
      // Sending Response!
      res.status(200).json({
        success: true,
        message: "Customer Details has been updated!"
      })
    }
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured..."
    })
  }
}


module.exports = {
    allUser, addUser, loginUser, deleteUser, checkUser, userRoom, userdb, generateBill, addUserFromD2, userdbRoom, totalDateCalculator, 
    favCustomer, datesEstimate, weeklyEstimate, totalDailyCalculator, roomTypeRev, updateOccupiedData, roomTypeAnalysis, checkAndMoveRoomStatus
}
