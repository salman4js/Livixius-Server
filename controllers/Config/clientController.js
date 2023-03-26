const Config = require("../../models/Config.js");
const Lodge = require('../../models/Lodges.js');
var data = ['Dish', 'Transport', 'PreBook'];

const checkConfig = async (req,res,next) => {
  
  // Check if GST has been enabled!
  const isGstEnabled = await Lodge.findById(req.params.id);
  
  Config.find({lodge : req.params.id})
    .then(data => {
      res.status(200).json({
        success : true,
        message : data,
        isGstEnabled: isGstEnabled.isGst
      })
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        success : false,
        message : err
      })
    })
}

const showConfig = (req,res,next) => {
  res.status(200).json({
    success : true,
    message : data
  })
}

const create_config = async (req,res,next) => {
  if(req.body.config === "Choose..."){
    res.status(200).json({
      success: false,
      message : "Please choose the valid config!"
    })
  } else if(req.body.config == undefined) {
    res.status(200).json({
      success : false,
      message : "Please choose the valid config!"
    })
  } else {
    if(await checkDuplicate(req.params.id, req.body.config) === 0){
      try{
        const config = new Config({
          config : req.body.config,
          lodge : req.params.id
        })
        if(config){
          await Lodge.findByIdAndUpdate({_id : config.lodge}, {$push : {config : config._id}})
        }
        await config.save();
        res.status(200).json({
          success : true,
          message : "Config created."
        })
      } catch(err){
        res.status(200).json({
          success: false, 
          message : err
        })
      }
    } else {
      res.status(200).json({
        success :  false,
        message : "Config already exists!"
      })
    }
  }
}

const checkDuplicate = async (lodgeId, config) => {
  const value = await Config.find({lodge: lodgeId, config: config});
  return value.length;
}

// GST enable/ disable controller!
const gstEnabler = (req,res,next) => {
  console.log("Function coming here!")
  Lodge.findByIdAndUpdate(req.params.id, {
    isGst: req.body.isGst
  })
  .then(data => {
    res.status(200).json({
      success: true,
      message: "GST status has been changed successfully!"
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: "Some internal  error occured!", err
    })
  })
}

const deleteConfig = (req,res,next) => {
  Config.findByIdAndDelete({_id : req.body.id})
    .then(data => {
      res.status(200).json({
        success : true,
        message : "Config removed."
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
  checkConfig, create_config, deleteConfig, showConfig, gstEnabler
}