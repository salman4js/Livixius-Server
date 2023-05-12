const Room = require("../models/Rooms.js");

const Lodge = require("../models/Lodges.js");

const UserDishes = require("../models/UserDishes.js");

const DishRate = require("../models/DishRate.js");

const UserServices = require("../models/UserServices.js");

const CallAWaiter = require("../models/CallAWaiter.js");

const User = require("../models/User.js");

const UserDb = require("../models/UserDb.js");

const RoomType = require("../models/RoomType.js");

// Importing Channel Manager!
const channel = require("./startup.data/startup.data.js");

// Importing Brew-Date package
const bd = require('brew-date');

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
      console.log("Check duplicate value", await checkDuplicate(req.params.id, req.body.roomno));
      if(await checkDuplicate(req.params.id, req.body.roomno) === null){
        const room = new Room({
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
       await room.save()
       res.status(200).json({
         success: true,
         message: "Room Added"
       })
      } else {
        res.status(200).json({
          success : false,
          message : "Room No already exists!"
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

const allRooms = async (req, res, next) => {
  const availabilityCount = await countAvailability(req.params.id, req.params.state);
  Room.find({ lodge: req.params.id })
    .then(data => {
      res.status(200).json({
        success : true,
        message : data,
        countAvailability: availabilityCount,
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

const countAvailability = async(lodgeid, state) => {
  const result = await Room.find({lodge: lodgeid, isOccupied: state});
  return result.length;
}

const availability = (req, res, next) => {
  Room.find({ lodge: req.params.id, isOccupied: "false" })
    .then(data => {
      console.log(data)
      res.status(200).json({
        success : true,
        message : data,
        channels: channel.channelManager.channelManager
      })
    })
    .catch(err => {
      console.log(err)
      res.status(200).json({
        success : false,
        message : "Some internal error has occured!"
      })
    })
}

const occupiedRooms = (req,res,next) => {
  Room.find({lodge : req.params.id, isOccupied : "true"})
    .then(data => {
      console.log(data);
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
      console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.log(err)
      res.send("Error occured, please check the console")
    })
}

const roomById = async (req, res, next) => {
  console.log(req.body.roomid)
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
      console.log(data.dishes);
      res.send(data.dishes)
    })
    .catch(err => {
      console.log(err);
      res.send("Error occured, please check the console")
    })
}


const roomsUpdater = async (req, res, next) => {

  if(req.body.roomno == ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.bedcount == ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.suitename == ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.roomno == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.bedcount == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.suitename == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else {
    try{
      if(await checkOccupiedData(req.body.roomId) === "true"){
        res.status(200).json({
          success : false,
          message : "Room already occupied, You can't modify occupied room's data!"
        })
      } else {
        // Update room price everytime the suite type gets updated!
        const roomPrice = await RoomType.findOne({lodge : req.params.id, suiteType: req.body.suitename});
        Room.findByIdAndUpdate(req.body.roomId, {
          roomno: req.body.roomno,
          suiteName: req.body.suitename,
          bedCount: req.body.bedcount,
          price : roomPrice.price
        })
          .then(data => {
            console.log(data)
            res.status(200).json({
              success : true,
              message : "Room Data Updated"
            })
          })
          .catch(err => {
            console.log(err)
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
  console.log(typeof(value.isOccupied));
  return value.isOccupied;
};

const deleteRoom = async (req, res, next) => {
  Room.findByIdAndDelete(req.body.roomId)
    .then(data => {
      console.log(data)
      res.status(200).json({
        success : true,
        message : "Room data deleted successfully!"
      })
    })
    .catch(err => {
      console.log(err)
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
      console.log(userdish.room)
      if (userdish) {
        await Room.findByIdAndUpdate({ _id: userdish.room }, { $push: { dishes: userdish._id}})
      }
      await userdish.save()
      res.status(200).json({
        success : true,
        message : "Your order is on the preparation"
      })
    } catch (err) {
      console.log(err)
      res.status(200).json({
        success : false,
        message : "Some Internal Error Occured.."
      })
    }
  }
}

const addUserRooms = async (req, res, next) => {
  
  var uniqueId = Date.now(); // Unique ID for receipt!

  if(req.body.aadhar ==  undefined || req.body.aadhar == ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, all data has to be filled in! - ID Number Field."
    })
  } else if((req.body.customername == undefined || req.body.customername == "")){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Name Field."
    })
  } else if(req.body.phonenumber == undefined || req.body.phonenumber == ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Phone Number Field."
    })
  } else if(req.body.adults === undefined || req.body.adults === ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Adults Field."
    })
  } else if (req.body.checkin == undefined || req.body.checkin == ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, All Mandatory has to be filled! - Check-In Date."
    })
  } else {
    // Check if the room is already booked or not.
    const checkValue = await Room.findById({_id: req.body.roomid});
    if(checkValue.isOccupied == "true"){
      res.status(200).json({
        success : false,
        message : "This room is already occupied!"
      })
    } else {
      
      const isChannel = req.body.isChannel;
      const updatePrice = req.body.updatePrice;
      
      try{
        const checkin = new User({
          username: req.body.customername,
          phonenumber : req.body.phonenumber,
          secondphonenumber : req.body.secondphonenumber,
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
          discount: req.body.discount,
          advance : req.body.advance,
          roomno: req.body.roomno,
          channel: req.body.channel,
          extraBeds: req.body.extraBeds,
          extraBedPrice: req.body.extraBedPrice,
          receiptId: uniqueId
        })
        const userdatabase = new UserDb({
          username: req.body.customername,
          phonenumber : req.body.phonenumber,
          secondphonenumber : req.body.secondphonenumber,
          adults : req.body.adults,
          childrens : req.body.childrens,
          aadharcard : req.body.aadhar,
          room : req.body.roomid,
          dateofcheckin : req.body.checkin,
          checkinTime: req.body.checkinTime,
          roomno : req.body.roomno,
          userid : checkin._id,
          lodge : req.params.id,
          discount: req.body.discount,
          advance : req.body.advance,
          channel: req.body.channel,
          extraBeds: req.body.extraBeds,
          extraBedPrice: req.body.extraBedPrice,
          receiptId: uniqueId
        })
        if(userdatabase){
          userdatabase.save()
        }
        // Check for the date of checkout!
        if(checkin){
          if(checkin.dateofcheckout != undefined){
            await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", channel: req.body.channel, extraCount: req.body.extraBeds, $push : {user : checkin._id}} )
          } else {
            await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", channel: req.body.channel, extraCount: req.body.extraBeds, preValid : false, $push : {user : checkin._id}} )
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
          await Room.findByIdAndUpdate({_id: checkin.room}, {totalAmount: updatePrice})
        } else {
          if(updatePrice !== undefined){
            await Room.findByIdAndUpdate({_id: checkin.room}, {price: updatePrice})
          } 
        }
        
        // Setting the prebook user room price as the price when they booked the room!
        if(req.body.prebook === true){
          if(req.body.advanceDiscount !== undefined && req.body.advanceDiscount !== ""){
            console.log(req.body.advancePrebookPrice)
            await Room.findByIdAndUpdate({_id : checkin.room}, {preBooked : req.body.prebook, 
              price : checkin.prebookroomprice, advancePrebookPrice : req.body.advancePrebookPrice, advanceDiscountPrice: req.body.advanceDiscount, discount: true})
          } else {
            await Room.findByIdAndUpdate({_id : checkin.room}, {preBooked : req.body.prebook, 
              price : checkin.prebookroomprice, advancePrebookPrice : req.body.advancePrebookPrice})
          }
        }
        
        await checkin.save();
        res.status(200).json({
          success : true,
          message : "Customer has been checked in successfully!"
        })
      } catch(err){
        console.log(err);
        res.status(200).json({
          success : false,
          message : "Some internal error occured"
        })
      }
    }
  }
}

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
    console.log(userservice.room)
    if (userservice) {
      await Room.findByIdAndUpdate({ _id: userservice.room }, { $push: { services: userservice._id } })
    }
    await userservice.save()
    res.send(true)
  } catch (err) {
    console.log(err)
    res.send("Error occured, please check the console")
  }
}


const updateRoomData = async (req, res, next) => {
  try {
    const room = req.body.roomid
    await Room.updateOne({ _id: room }, { $set: { dishes: [], services: [] } })
    console.log("Room dishes data updated sucessfully")
    res.send("Room dish data updated sucessfully!")

  } catch (err) {
    console.log(err);
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
    console.log(waiter.room)
    if (waiter) {
      await Room.findByIdAndUpdate({ _id: waiter.room }, { $push: { callawaiter: waiter._id } })
    }
    await waiter.save()
    res.send(true)
  } catch (err) {
    console.log(err)
    res.send("Error occured, please check the console")
  }
}

// Upcoming check out based on the provided date by the customer 
async function upcomingCheckOut(req,res,next){
  User.find({lodge: req.params.id})
    .then(async data => {
      const endResult = await checkUpcoming(data, req.body.datesBetween);
      res.status(200).json({
        success: true,
        message: endResult
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Upcoming checkout function template helper!
async function checkUpcoming(data, date){
    var endResult = [];
    for (const options of data) {
    if (options.dateofcheckout !== undefined && date.includes(options.dateofcheckout)){
      endResult.push(options);
    }
  }
    return endResult;
}

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
}



module.exports = {
  createRoom, allRooms, roomsUpdater, deleteRoom, addDishRooms, updateRoomData, roomOne, addUserRooms,
  roomById, dishByRoom, addServiceRooms, callAWaiter, availability, getRoomId, occupiedRooms, upcomingCheckOut, getRoomNo, updateRoomPrice

}
