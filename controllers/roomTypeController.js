const RoomControllerImpl = require('./room.controller.implementation/room.controller.implementation')
const ResponseHandler = require('../ResponseHandler/ResponseHandler');
const RoomType = require("../models/RoomType.js");
const Room = require("../models/Rooms.js");

const createSuite = async (req,res,next) => {
  RoomControllerImpl._createRoomTypeModel(req.body).then((result) => {
    if(!result.notCreated){
      ResponseHandler.staticParser(res, {statusCode: 201, result: result, success: true});
    } else {
      ResponseHandler.staticParser(res, {statusCode: 200, message: result.message, success: false});
    }
  }).catch((err) => {
    ResponseHandler.staticParser(res, {statusCode: 500, error: err});
  });
}

const editTypeData = async (req,res,next) => {
  if(req.body.price == ""){
    res.status(200).json({
      success : false,
      message : "Check your input data!"
    })
  } else if(req.body.price == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input"
    })
  } else if(req.body.price == null){
    res.status(200).json({
      success : false,
      message : "Check your input"
    })
  } else {
    await RoomType.findOneAndUpdate({lodge : req.body.lodgeid, suiteType : req.body.suitetype},{
      suiteType : req.body.suitetype,
      price : req.body.price
    })
    .then(data => {
      res.status(200).json({
        success : true,
        message : "Changes has been made successfully!"
      })
      })
      .catch(err => {
        res.status(200).json({
          success : false,
          message : "Some Internal Error Occured!"
        })
    })
    try{
      await Room.updateMany({lodge: req.body.lodgeid, isOccupied : false, suiteName : req.body.suitetype}, {$set : {price : req.body.price}})
    } catch(err){
      console.error("Some internal error occured when updating the unreserved rooms!");
    }
  }
}

// Get all available room types!
const allRoomType = (req,res,next) => {
  RoomType.find({lodge : req.params.id})
  .then(data => {
    res.status(200).json({
      success: true,
      message: data
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }) 
}

const getPrice = (req,res,next) => {
  RoomType.find({lodge : req.params.id, suiteType : req.body.suitename})
  .then(data => {
    res.status(200).json({
      success: true,
      message: data
    })
  })
  .catch(err => {
    console.log(err);
    res.send(err);
  })
}

const deleteRoomType = (req,res,next) => {
  RoomType.deleteMany({lodge : req.params.id})
  .then(data => {
    console.log(data);
    res.status(200).json({
      success : true,
      message : "Room Type deleted successfully!"
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

module.exports = {
  createSuite, allRoomType, editTypeData, deleteRoomType, getPrice
}