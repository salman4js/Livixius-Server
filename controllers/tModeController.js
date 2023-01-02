const Lodge = require("../models/Lodges.js");
const T_Mode = require("../models/Tmode.js");

const create_tMode = async (req,res,next) => {
  const request = req.body.tMode.toUpperCase();
  if(request === ""){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(request === undefined){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(request === null){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else {
    try{
      if(await checkDuplicate(req.params.id, request) == null){
        const tMode = new T_Mode({
          tMode : req.body.tMode.toUpperCase(),
          lodge : req.params.id
        })
        if(tMode){
          await Lodge.findByIdAndUpdate({_id : tMode.lodge}, {$push : {tMode : tMode._id}});
        }
        await tMode.save();
        res.status(200).json({
          success : true,
          message : "Transport Mode added successfully!"
        })
      } else {
        res.status(200).json({
          success : false,
          message : "Mode already exists!"
        })
      }
    } catch(err){
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    }
  }
}

const checkDuplicate = async(lodgeid, request) => {
  const value = await T_Mode.findOne({lodge : lodgeid, tMode : request});
  return value;
}

const all_t_Mode = (req,res,next) => {
  T_Mode.find({lodge : req.params.id})
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

const delete_tMode = (req,res,next) => {
  T_Mode.findByIdAndDelete(req.body.tMode_id)
    .then(data => {
      res.status(200).json({
        success : true,
        message : "Transport Mode deleted successfully!"
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
  create_tMode, all_t_Mode, delete_tMode
}
