const Lodge = require("../models/Lodges.js");
const RoomType = require("../models/RoomType.js");

const createSuite = async (req,res,next) => {
  
  if(req.body.suitetype == ""){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.suitetype == undefined){
    res.status(200).json({
      success :  false,
      message : "Check your input!"
    })
  } else if(req.body.suitetype == null){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.price == ""){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  }  else if(req.body.price == undefined){
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(req.body.price == null) {
    res.status(200).json({
      success : false,
      message : "Check your input!"
    })
  } else if(!(/^[0-9]+$/.test(req.body.price))){
    res.status(200).json({
      success : false,
      message : "Price should be in number format!"
    })
  } else {
    try{
      if(await checkSuite(req.params.id, req.body.suitetype) === null){
        const roomType = new RoomType({
          suiteType : req.body.suitetype.toUpperCase(),
          price : req.body.price,
          lodge : req.params.id
        })
        if(roomType){
          await Lodge.findByIdAndUpdate({_id : roomType.lodge}, {$push : {types : roomType._id}})
        }
        await roomType.save()
        res.status(200).json({
          success : true,
          message : "Room Type Added Successfully!"
        })
      } else {
        res.status(200).json({
          success : false,
          message : "Room Type already exists."
        })
      }
    } catch(err){
      res.status(200).json({
        success : false,
        message : "Some Internal Error Occured!"
      })
    }
  }
}

const checkSuite = async (lodgeId, suitetype) => {
  const value = await RoomType.findOne({lodge : lodgeId, suiteType : suitetype})
  return value;
}

const editTypeData = (req,res,next) => {
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
    RoomType.findOneAndUpdate({lodge : req.body.lodgeid, suiteType : req.body.suitetype},{
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
  }
  
}

const allRoomType = (req,res,next) => {
  RoomType.find({lodge : req.params.id})
  .then(data => {
    console.log(data)
    res.send(data);
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  }) 
}

const getPrice = (req,res,next) => {
  RoomType.find({lodge : req.params.id, suiteType : req.body.suitename})
  .then(data => {
    console.log(data);
    res.send(data);
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