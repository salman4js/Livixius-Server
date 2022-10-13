const Room = require("../models/Rooms.js");

const Lodge = require("../models/Lodges.js");

const UserDishes = require("../models/UserDishes.js");

const DishRate = require("../models/DishRate.js");

const UserServices = require("../models/UserServices.js");

const CallAWaiter = require("../models/CallAWaiter.js");

const User = require("../models/User.js");

const UserDb = require("../models/UserDb.js");

const createRoom = async (req, res, next) => {
  console.log(req.body)
  if (req.body.roomno == "" && req.body.bedcount == "" && req.body.suitename == "") {
    res.status(200).json({
      success: false,
      message: "Check the input"
    })
  } else {
    try {
      const room = new Room({
        roomno: req.body.roomno,
        bedCount: req.body.bedcount,
        suiteName: req.body.suitename,
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
    } catch (err) {
      res.status(200).json({
        success: false,
        message: "Some internal Error"
      })
    }
  }

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
  Room.findById({ _id: req.body.roomid })
    .then(data => {
      console.log(data.roomno);
      res.send(data.roomno)
    })
    .catch(err => {
      console.log(err)
      res.send("Error occured, please check the console!")
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


const roomsUpdater = (req, res, next) => {

  if (req.body.roomno == "" && req.body.bedcount == "" && req.body.suitename == "") {
    res.status(200).json({
      success: false,
      message: "Data is inaccurate"
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
}

const deleteRoom = (req, res, next) => {
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
        lodge : req.body.lodgeid,
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
  console.log(req.body)
  console.log(req.body.customerphonenumber)
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
      console.log(checkin.dateofcheckin);
      if(userdatabase){
        userdatabase.save()
      }
      if(checkin){
        await Room.findByIdAndUpdate({_id : checkin.room}, {isOccupied : "true", $push : {user : checkin._id}} )
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
