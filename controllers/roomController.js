const Room = require("../models/Rooms.js");

const Lodge = require("../models/Lodges.js");

const UserDishes = require("../models/UserDishes.js");

const DishRate = require("../models/DishRate.js");

const UserServices = require("../models/UserServices.js");

const CallAWaiter = require("../models/CallAWaiter.js");

const User = require("../models/User.js");

const UserDb = require("../models/UserDb.js");

const RoomType = require("../models/RoomType.js");

// Payment tracker controller instance!
const paymentTrackerController = require("../controllers/payment.tracker/payment.tracker.controller");

// Room Status implementation!
const RoomStatusImplementation = require('./room.status/room.status.implementation');

// Room Controller Implementation!
const RoomControllerImpl = require("./room.controller.implementation/room.controller.implementation");

// User controller
const userController = require("../controllers/userController");

// Importing Channel Manager!
const channel = require("./startup.data/startup.data.js");

// Importing Brew-Date package
const bd = require('brew-date');

// Create room!
const createRoom = async (req, res, next) => {
  if (req.body.roomno == "") {
    res.status(200).json({
      success: false,
      message: "Check the input"
    })
  } else if(req.body.bedcount == ""){
    res.status(200).json({
      success : false,
      message : "Check the input"
    })
  } else if(req.body.suitename == ""){
    res.status(200).json({
      success : false,
      message : "Check the input"
    })
  } else if(req.body.suitename == "Choose..."){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.price == ""){
    res.status(200).json({
      success : false,
      message : "Check your input"
    })
  } else {
    try {
      if(await checkDuplicate(req.params.id, req.body.roomno) === null){
        const room = new Room({
         floorNo: req.body.floorNo,
         roomno: req.body.roomno,
         bedCount: req.body.bedcount,
         suiteName: req.body.suitename,
         price : req.body.price,
         extraBedPrice: req.body.extraBedPrice,
         lodge: req.params.id
       })
       if (room) {
         await Lodge.findByIdAndUpdate({ _id: room.lodge }, { $push: { rooms: room._id } })
       }
       await room.save();
       
       // After the room has been saved, set the initial room status to ['afterCleaned'] state!
       const roomStatuses = await RoomStatusImplementation.getTheNextRoomState(req.body, 'afterCleaned');
       req.body['roomStatus'] = roomStatuses.currentRoomStatus
       req.body['nextRoomStatus'] = roomStatuses.nextRoomStatus
       req.body['nextOfNextRoomStatus'] = roomStatuses.nextOfNextRoomStatus
       req.body['roomStatusConstant'] = "afterCleaned";
       req.body['roomId'] = room._id;
       await RoomStatusImplementation.roomStatusSetter(req.body);
       res.status(200).json({
         success : true,
         message : "Room created",
         updatedData: room // Sending the created room data so that the roomData can be added in the global collections in the UI.
       })
      } else {
        res.status(200).json({
          success : false,
          message : "Room No already exists!",
        })
      }
    } catch (err) {
      res.status(200).json({
        success: false,
        message: "Some internal Error"
      })
    }
  }
}

const checkDuplicate = async (lodgeid, roomno) => {
  const value = await Room.findOne({lodge : lodgeid, roomno : roomno});
  return value;
}

// Room lodge route handler!
const allRooms = async (req, res, next) => {
  // Create an response object with basic response data!
  var responseData = {success: undefined, message: undefined};
  const availabilityCount = await countAvailability(req.params.id, req.params.state);
  // UI wants room status along with this response!
  var roomStatus = await RoomStatusImplementation.getAllRoomStatus({accId: req.params.id});
  const result = await Room.find({lodge: req.params.id});
  if(result){
    responseData.success = true,
    responseData.message = result,
    responseData.countAvailability = availabilityCount,
    responseData.channels = channel.channelManager.channelManager,
    responseData.roomStatus = roomStatus;
  } else {
    responseData.success = false;
    responseData.message = 'Internal error occured!'
  };
  // When the computations are done, send the response back to the client!
  res.status(200).json(responseData);
};

const countAvailability = async(lodgeid, state) => {
  const result = await Room.find({lodge: lodgeid, isOccupied: state});
  return result.length;
}

const availability = (req, res, next) => {
  Room.find({ lodge: req.params.id, isOccupied: "false" })
    .then(data => {
      res.status(200).json({
        success : true,
        message : data,
        channels: channel.channelManager.channelManager
      })
    })
    .catch(err => {
      res.status(200).json({
        success : false,
        message : "Some internal error has occured!"
      })
    })
}

const occupiedRooms = (req,res,next) => {
  Room.find({lodge : req.params.id, isOccupied : "true"})
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

const roomOne = async (req, res, next) => {
  Room.find({ roomno: req.body.roomno })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.send("Error occured, please check the console")
    })
}

const roomById = async (req, res, next) => {
  Room.findById({ _id: req.body.roomid })
    .then(data => {
        res.status(200).json({
          success : true,
          message : data.roomno
        })
    })
    .catch(err => {
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    })
}

const dishByRoom = (req, res, next) => {
  Room.findById({ _id: req.body.roomid })
    .then(data => {
      res.send(data.dishes)
    })
    .catch(err => {
      res.send("Error occured, please check the console")
    })
}


const roomsUpdater = async (req, res, next) => {

  if(req.body.roomno === ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.bedcount === ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.suitename === ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.roomno === undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.bedcount === undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.suitename === undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else {
    try{
      if(await checkOccupiedData(req.body.roomId)){
        res.status(200).json({
          success : false,
          message : "Room already occupied, You can't modify occupied room's data!"
        })
      } else {
        
        // When we manually set the room status, we have to keep track of old status
        // So that when releasing it from the custom state, it will go back to what state it is already in..
        // get the current room status constant and room status and store it in the prev states of those!
        var roomInstance = await Room.findById({_id: req.body.roomId});
        var currentRoomStatusConstant = roomInstance.prevRoomStatusConstant;
        var currentRoomStatus = roomInstance.prevRoomStatus;
      
        // Update room price everytime the suite type gets updated!
        const roomPrice = await RoomType.findOne({lodge : req.params.id, suiteType: req.body.suitename});
        Room.findByIdAndUpdate(req.body.roomId, {
          floorNo: req.body.floorNo,
          roomno: req.body.roomno,
          suiteName: req.body.suitename,
          roomStatusConstant: req.body.roomStatus !== undefined && req.body.roomStatus !== 'Release' ? req.body.roomStatusConstant : currentRoomStatusConstant, 
          roomStatus: req.body.roomStatus !== undefined && req.body.roomStatus !== 'Release' ? req.body.roomStatus : currentRoomStatus,
          prevRoomStatus: req.body.roomStatus !== undefined ? currentRoomStatus : undefined,
          prevRoomStatusConstant: req.body.roomStatus !== undefined ? currentRoomStatusConstant : undefined,
          bedCount: req.body.bedcount,
          price : roomPrice.price
        }, {new: true}) // This will return the updated data so that UI collections can be updated.
          .then(data => {
            res.status(200).json({
              success : true,
              message : "Room Data Updated",
              updatedData: data
            })
          })
          .catch(err => {
            res.status(200).json({
              success : false,
              message : "Some internal error occured"
            })
          })
      }
    } catch(err) {
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    }
  }
}

const checkOccupiedData = async (roomId) => {
  const value = await Room.findOne({ _id : roomId});
  return value.isOccupied;
};

const deleteRoom = async (req, res, next) => {
  Room.findByIdAndDelete(req.body.roomId)
    .then(data => {
      res.status(200).json({
        success : true,
        message : "Room data deleted successfully!"
      })
    })
    .catch(err => {
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    })
}

const getRoomId = (req,res,next) => {
  if(req.body.roomno == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else {
    Room.find({lodge : req.body.lodgeid, roomno : req.body.roomno})
    .then(data => {
      res.status(200).json({
        success : true,
        message : data
      })
    })
    .catch(err => {
      res.status(200).json({
        success : false,
        message : "Some internal error occured"
      })
    })
  }
}

const addDishRooms = async (req, res, next) => {
  if(req.body.quantity == undefined){
    res.status(200).json({
      success : false,
      message : "That's a bad request!"
    })
  } else if(req.body.quantity == ""){
    res.status(200).json({
      success : false,
      message : "That's a bad request!"
    })
  } else if(req.body.roomno == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.roomno == ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.roomno == "Choose..."){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else {
    try {
      const userdish = new UserDishes({
        roomno : req.body.roomno,
        dishName: req.body.dishname,
        dishRate : req.body.dishrate,
        quantity: req.body.quantity,
        comments: req.body.comments,
        room: req.body.roomid,
        time: req.body.time,
        lodge : req.params.id,
      })
      if (userdish) {
        await Room.findByIdAndUpdate({ _id: userdish.room }, { $push: { dishes: userdish._id}})
      }
      await userdish.save()
      res.status(200).json({
        success : true,
        message : "Your order is on the preparation"
      })
    } catch (err) {
      res.status(200).json({
        success : false,
        message : "Some Internal Error Occured.."
      })
    }
  }
}

const addUserRooms = async (req, res, next) => {
  
  var uniqueId = Date.now(); // Unique ID for receipt!

  if(req.body.aadhar ===  undefined || req.body.aadhar === ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, all data has to be filled in! - ID Number Field."
    })
  } else if((req.body.customername === undefined || req.body.customername === "")){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Name Field."
    })
  } else if(req.body.phonenumber === undefined || req.body.phonenumber === ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Phone Number Field."
    })
  } else if(req.body.adults === undefined || req.body.adults === ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Adults Field."
    })
  } else if (req.body.checkin === undefined || req.body.checkin === ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Check-In Date."
    })
  } else {
    // Check if the room is already booked or not.
    const checkValue = await Room.findById({_id: req.body.roomid});
    if(checkValue.isOccupied === "true"){
      res.status(200).json({
        success : false,
        message : "This room is already occupied!"
      })
    } else {
      
      const isChannel = req.body.isChannel;
      const updatePrice = req.body.updatePrice;
      
      // Current room instance!
      var currentRoomInstance = await Room.findById({_id: req.body.roomid});
      
      try{
        const checkin = new User({
          username: req.body.customername,
          phonenumber : req.body.phonenumber,
          secondphonenumber : req.body.secondphonenumber,
          address: req.body.address,
          adults : req.body.adults,
          childrens : req.body.childrens,
          aadharcard : req.body.aadhar,
          room : req.body.roomid,
          dateofcheckin : req.body.checkin,
          checkinTime: req.body.checkinTime,
          dateofcheckout : req.body.checkout,
          checkoutTime: req.body.checkoutTime,
          prebookroomprice : req.body.prebookprice,
          lodge : req.params.id,
          // Room transfer representations
          oldRoomPrice: req.body.oldRoomPrice, // this is to keep track of old room price incase of room transfer!
          oldRoomNo: req.body.oldRoomNo,
          oldRoomStayDays: req.body.oldRoomStayDays,
          isRoomTransfered: req.body.isRoomTransfered,
          // End of room transfer representations
          discount: req.body.discount,
          advance : req.body.advance,
          roomno: req.body.roomno,
          floorNo: req.body.floorNo,
          channel: req.body.channel,
          extraBeds: req.body.extraBeds,
          extraBedPrice: req.body.extraBedPrice,
          receiptId: uniqueId,
          checkinBy: req.body.checkinBy,
          transferBy: req.body.transferBy
        })
        const userdatabase = new UserDb({
          username: req.body.customername,
          phonenumber : req.body.phonenumber,
          secondphonenumber : req.body.secondphonenumber,
          address: req.body.address,
          adults : req.body.adults,
          childrens : req.body.childrens,
          aadharcard : req.body.aadhar,
          room : req.body.roomid,
          dateofcheckin : req.body.checkin,
          checkinTime: req.body.checkinTime,
          expCheckinTime: req.body.expCheckinTime,
          actualCheckinTime: req.body.actualCheckinTime,
          roomno : req.body.roomno,
          floorNo: req.body.floorNo,
          userid : checkin._id,
          lodge : req.params.id,
          // Room transfer representations
          oldRoomPrice: req.body.oldRoomPrice, // this is to keep track of old room price incase of room transfer!
          oldRoomNo: req.body.oldRoomNo,
          oldRoomStayDays: req.body.oldRoomStayDays,
          isRoomTransfered: req.body.isRoomTransfered,
          // End of room transfer representations
          discount: req.body.discount,
          advance : req.body.advance,
          channel: req.body.channel,
          extraBeds: req.body.extraBeds,
          extraBedPrice: req.body.extraBedPrice,
          receiptId: uniqueId,
          checkinBy: req.body.checkinBy,
          transferBy: req.body.transferBy
        })
        if(userdatabase){
          userdatabase.save();
        }
        
        // Track payment in paymentTracker schema!
        if(!req.body.prebook){ // If not prebook, add advance to the paymentTracker!
          const paymentParams = {
            roomno: req.body.roomno,
            amount: req.body.advance,
            amountFor: req.body.amountFor,
            room: req.body.roomid,
            dateTime: req.body.dateTime,
            isPrebook: req.body.isPrebook,
            lodge: req.params.id,
            userId: checkin._id
          }
          const paymentTracker = await paymentTrackerController.setPaymentTracker(paymentParams);
        } else {
          const paymentParams = {
            room: req.body.roomid,
            userId: req.body.userId, // Prebook user id!
            updatedUserId: checkin._id
          }
          const paymentTracker = await paymentTrackerController.updatePaymentTracker(paymentParams);
        }
        
        // Check for the date of checkout!
        if(checkin){
          if(checkin.dateofcheckout != undefined){
            await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", channel: req.body.channel, extraCount: req.body.extraBeds, extraBedPrice: req.body.extraBedPrice, $push : {user : checkin._id}} )
          } else {
            await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", channel: req.body.channel, extraCount: req.body.extraBeds, extraBedPrice: req.body.extraBedPrice, preValid : false, $push : {user : checkin._id}} )
          }
          
          // Check the response for the discount!
          if(req.body.discount !== undefined && req.body.discount !== ""){
            await Room.findByIdAndUpdate({_id: checkin.room}, {isOccupied: "true", discount: true, discountPrice: req.body.discount, $push: {user: checkin._id}})
          }
          
          // Check the response for the advance!
          if(req.body.advance !== undefined && req.body.advance !== ""){
            await Room.findByIdAndUpdate({_id: checkin.room}, {isOccupied: "true", advance: true, advancePrice: req.body.advance, $push:{user: checkin._id}})
          }
        }
        
        // Check for the channel manager!
        if(isChannel && updatePrice !== undefined){
          await Room.findByIdAndUpdate({_id: checkin.room}, {totalAmount: updatePrice});
        };
        
        if(isChannel && updatePrice === undefined){
          /**
            This is added here to prevent showing bill preview value as Zero,
            that can happen when the channel manager is enabled and update price
            has not been changed (undefined). Applicable to both dashboards.
          **/
          await Room.findByIdAndUpdate({_id: checkin.room}, {totalAmount: currentRoomInstance.price});
        };
        // When the channel manager is false and the request was made to update the price.
        if(!isChannel && updatePrice !== undefined){
          await Room.findByIdAndUpdate({_id: checkin.room}, {price: updatePrice});
        };
        
        // Setting the prebook user room price as the price when they booked the room!
        if(req.body.prebook === true){
          if(req.body.advanceDiscount !== undefined && req.body.advanceDiscount !== ""){
            await Room.findByIdAndUpdate({_id : checkin.room}, {preBooked : req.body.prebook, 
              price : checkin.prebookroomprice, advancePrebookPrice : req.body.advancePrebookPrice, advanceDiscountPrice: req.body.advanceDiscount, discount: true})
          } else {
            await Room.findByIdAndUpdate({_id : checkin.room}, {preBooked : req.body.prebook, 
              price : checkin.prebookroomprice, advancePrebookPrice : req.body.advancePrebookPrice})
          }
        };
        
        // Update the room status!
        await userController.checkAndMoveRoomStatus(req.body, "afterCheckin");
        
        // After all the checkin and prebook checkin operations are done, Get the latest updated room model and pass it in the response!
        var updatedModel = await Room.findById({_id: checkin.room});
        
        await checkin.save();
        res.status(200).json({
          success : true,
          updatedModel: updatedModel,
          updatedUserModel: checkin,
          message : "Customer has been checked in successfully!"
        })
      } catch(err){
        res.status(200).json({
          success : false,
          message : "Some internal error occured"
        });
      };
    };
  };
};

// Update Room Price data
async function updateRoomPrice(req,res,next){
  try{
    await Room.findByIdAndUpdate({_id: req.body.roomid}, {price: req.body.updatePrice});
    res.status(200).json({
      success: true,
      message: "Room Price has been changed successfully!"
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
}

const addServiceRooms = async (req, res, next) => {
  try {
    const userservice = new UserServices({
      serviceType: req.body.servicetype,
      room: req.body.roomId,
      time: req.body.time
    })
    if (userservice) {
      await Room.findByIdAndUpdate({ _id: userservice.room }, { $push: { services: userservice._id } })
    }
    await userservice.save()
    res.send(true)
  } catch (err) {
    res.send("Error occured, please check the console")
  }
}


const updateRoomData = async (req, res, next) => {
  try {
    const room = req.body.roomid
    await Room.updateOne({ _id: room }, { $set: { dishes: [], services: [] } })
    res.send("Room dish data updated sucessfully!")

  } catch (err) {
    res.send("Error occured, please check the console!")
  }
}

const callAWaiter = async (req, res, next) => {
  try {
    const waiter = new CallAWaiter({
      callAwaiter: req.body.callawaiter,
      Time: req.body.time,
      room: req.body.roomid
    })
    if (waiter) {
      await Room.findByIdAndUpdate({ _id: waiter.room }, { $push: { callawaiter: waiter._id } })
    }
    await waiter.save()
    res.send(true)
  } catch (err) {
    res.send("Error occured, please check the console")
  }
}

// Upcoming check out based on the provided date by the customer!
// Externalized upcoming checkout computational part to room controller implementation!
async function upcomingCheckOut(req,res,next){ 
  const result = await RoomControllerImpl.getUpcomingCheckout(req.body);
  if(result){
    res.status(200).json({
      success: true,
      message: result
    })
  } else {
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
};

async function getRoomNo(req,res,next){
  try{
    const result = await Room.findById({_id: req.params.id});
    res.status(200).json({
      success: true,
      message: result.roomno
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
};

module.exports = {
  createRoom, allRooms, roomsUpdater, deleteRoom, addDishRooms, updateRoomData, roomOne, addUserRooms,
  roomById, dishByRoom, addServiceRooms, callAWaiter, availability, getRoomId, occupiedRooms, upcomingCheckOut, getRoomNo, updateRoomPrice,
}
