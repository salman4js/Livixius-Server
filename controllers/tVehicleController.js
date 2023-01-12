const Lodge = require("../models/Lodges.js");
const Room = require("../models/Rooms.js");
const T_Vehicle = require("../models/Tvehicle.js");
const T_Mode = require("../models/Tmode.js");
const T_User = require("../models/UserTransport.js");

const create_transport = async (req,res,next) => {
  if(req.body.vehicle === ""){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.vehicle === undefined){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.charge === ""){
    res.status(200).json({
      success : false, 
      message : "That's the bad input!"
    })
  } else if(req.body.charge === undefined){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.mode === "Choose..."){
    res.status(200).json({
      success : false, 
      message : "Please choose the transport mode!"
    })
  } else if(req.body.mode === undefined){
    res.status(200).json({
      success : false,
      message : "Please choose the transport mode!"
    })
  } else {
    try{
      const tVehicle = new T_Vehicle({
        vehicle : req.body.vehicle.toUpperCase(),
        charge : req.body.charge,
        mode : req.body.mode,
        lodge : req.params.id
      })
      if(tVehicle){
        const mode_id = await T_Mode.findOne({tMode : tVehicle.mode});
        await T_Mode.findByIdAndUpdate({_id : mode_id.id}, {$push : {tVehicle : tVehicle._id}});
        await Lodge.findByIdAndUpdate({_id : tVehicle.lodge}, {$push : {tVehicle : tVehicle._id}});
      }
      await tVehicle.save();
      res.status(200).json({
        success : true,
        message : "Vehicle has been saved successfully!"
      })
    } catch(err) {
      console.log(err);
      res.status(200).json({
        success :  false,
        message : "Some internal error occured!"
      })
    }
  }
}

const deleteEntry = async (req,res,next) => {
  if(await checkDuty(req.body.id) === false){
    T_Vehicle.findByIdAndDelete({_id : req.body.id})
      .then(data => {
        res.status(200).json({
          success : true,
          message : "Entry deleted successfully!"
        })
      })
      .catch(err => {
        console.log(err);
        res.status(200).json({
          success : false,
          message : "Some internal error occured!"
        })
      })
  } else {
    res.status(200).json({
      success : false,
      message : "Cannot delete already booked vehicle!"
    })
  }
}

const checkDuty = async (id) => {
  const value = await T_Vehicle.findOne({_id : id});
  console.log(value.duty);
  return value.duty;
}

const getAllVehicle = (req,res,next) => {
  T_Vehicle.find({lodge : req.params.id})
    .then(data => {
      res.status(200).json({
        success : true, 
        message : data
      })
    })
    .catch(err => {
      res.status(200).json({
        success : false,
        message : "Some internal error occured while getting transport modes!"
      })
    })
}

const onToggle = async (req,res,next) => {
  // Getting the duty of the selected transport mode
  const value = await T_Vehicle.findOne({_id : req.body.id});
  // Setting it to the opposite value!
  T_Vehicle.findByIdAndUpdate(req.body.id, {
    duty : !value.duty
  })
  .then(data => {
    res.status(200).json({
      success : true,
      message : `Vehicle state changed`,
      response : data
    })
  })
  .catch(err => {
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

const orderTransport = async(req,res,next) => {
  try{
    const tUser = new T_User({
      roomno : req.body.roomno,
      name : req.body.name,
      charge : req.body.charge,
      room : req.body.roomid,
      lodge : req.params.id
    })
    if(tUser){
      await Room.findByIdAndUpdate({_id : tUser.room}, {$set : {transport : true}});
    }
    await tUser.save();
    res.status(200).json({
      success : true,
      message : "Getting the driver ready, please wait"
    })
  } catch(err){
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  }
}

module.exports = {
  create_transport, getAllVehicle, onToggle, deleteEntry
}