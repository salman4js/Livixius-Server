const Lodge = require("../models/Lodges.js");
const T_Vehicle = require("../models/Tvehicle.js");

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
      message : "Pleas choose the transport mode!"
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
        await Lodge.findByIdAndUpdate({_id : tVehicle.lodge}, {$push : {tVehicle : tVehicle._id}});
      }
      await tVehicle.save();
      res.status(200).json({
        success : true,
        message : "Vehicle has been saved successfully!"
      })
    } catch(err) {
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

module.exports = {
  create_transport, getAllVehicle, onToggle, deleteEntry
}