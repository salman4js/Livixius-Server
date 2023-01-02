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

module.exports = {
  create_transport, getAllVehicle
}