const Config = require("../../models/Config.js");
const Lodge = require('../../models/Lodges.js');
var data = ['Dish', 'Transport', 'PreBook'];

const checkConfig = async (req,res,next) => {
  
  Config.find({lodge : req.params.id})
    .then(data => {
      res.status(200).json({
        success : true,
        message : data,
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

const checkMatrix = async (req,res,next) => {
  
  // Check all the required config!
  const config = await Lodge.findById(req.params.id);
    
  try{
    res.status(200).json({
      success: true,
      isGstEnabled: config.isGst,
      isHourly: config.isHourly,
      isChannel: config.isChannel,
      updatePrice: config.updatePrice,
      isExtra: config.isExtra,
      isExclusive: config.isExclusive,
      isInsights: config.isInsights,
      isSpecific: config.isSpecific,
      extraPrice: config.extraPrice,
      address: config.area,
      emailId: config.emailId,
      canDelete: config.canDelete,
      extraCalc: config.extraCalc,
      grcPreview: config.grcPreview,
      redirectTo: config.redirectTo,
      multipleLogins: config.multipleLogins,
      validateInvoiceDetails: config.validateInvoiceDetails,
      printManager: config.printManager,
      removePan: config.removePan
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Config not allowing client side to enter!"
    })
  }
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
const updateMatrix = (req,res,next) => {
  Lodge.findByIdAndUpdate(req.params.id, {
    isGst: req.body.isGst,
    isHourly: req.body.isHourly,
    isChannel: req.body.isChannel,
    updatePrice: req.body.updatePrice,
    isExtra: req.body.isExtra,
    isExclusive: req.body.isExclusive,
    isInsights: req.body.isInsights,
    isSpecific: req.body.isSpecific,
    canDelete: req.body.canDeleteRooms,
    extraCalc: req.body.extraCalc,
    grcPreview: req.body.grcPreview,
    redirectTo: req.body.redirectTo,
    multipleLogins: req.body.multipleLogin,
    validateInvoiceDetails: req.body.validateInvoiceDetails,
    printManager: req.body.printManager,
    removePan: req.body.removePan
  })
  .then(data => {
    res.status(200).json({
      success: true,
      message: "Matrix has been updated!"
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
  checkConfig, create_config, deleteConfig, showConfig, checkMatrix, updateMatrix
}