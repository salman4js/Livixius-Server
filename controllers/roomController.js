const Room = require("../models/Rooms.js");

const Lodge = require("../models/Lodges.js");

const UserDishes = require("../models/UserDishes.js");

const DishRate = require("../models/DishRate.js");

const UserServices = require("../models/UserServices.js");

const CallAWaiter = require("../models/CallAWaiter.js");

const User = require("../models/User.js");

const UserDb = require("../models/UserDb.js");

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
  console.log("Check",value)
  return value;
}

const allRooms = (req, res, next) => {
  Room.find({ lodge: req.params.id })
    .then(data => {
      console.log(data)
      res.status(200).json({
        success : true,
        message : data
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

const availability = (req, res, next) => {
  Room.find({ lodge: req.params.id, isOccupied: "false" })
    .then(data => {
      console.log(data)
      res.status(200).json({
        success : true,
        message : data
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
        Room.findByIdAndUpdate(req.body.roomId, {
          roomno: req.body.roomno,
          suiteName: req.body.suitename,
          bedCount: req.body.bedcount
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
  if(req.body.aadhar ==  undefined || req.body.aadhar == ""){
    res.status(200).json({
      success : false,
      message : "Check Customer Data, all data has to be filled in! - Aadhar Field."
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
  } else if(req.body.adults == undefined || req.body.adults == ""){
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
        dateofcheckout : req.body.checkout,
        prebookroomprice : req.body.prebookprice,
        lodge : req.params.id
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
        roomno : req.body.roomno,
        userid : checkin._id,
        lodge : req.params.id
      })
      if(userdatabase){
        userdatabase.save()
      }
      if(checkin){
        if(checkin.dateofcheckout != undefined){
          await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", $push : {user : checkin._id}} )
        } else {
          await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", preValid : false, $push : {user : checkin._id}} )
        }
      }
      await checkin.save();
      // Setting the prebook user room price as the price when they booked the room!
      if(req.body.prebook == true){
        await Room.findByIdAndUpdate({_id : checkin.room}, {preBooked : req.body.prebook, price : checkin.prebookroomprice})
      }
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



module.exports = {
  createRoom, allRooms, roomsUpdater, deleteRoom, addDishRooms, updateRoomData, roomOne, addUserRooms,
  roomById, dishByRoom, addServiceRooms, callAWaiter, availability, getRoomId, occupiedRooms

}
