const Lodge = require("../models/Lodges");
const jwt = require("jsonwebtoken");
const PreferenceImpl = require('./preference.collection/preference.collection.impl');

const addLodge = async (req,res,next) => {
    const lodge = new Lodge({
        username : req.body.username,
        password : req.body.password,
        emailId : req.body.emailId,
        area : req.body.area,
        branch : req.body.branch,
        gstin : req.body.gstin,
        pan: req.body.pan,
        name: req.body.name,
        number: req.body.number
    })
    await lodge.save()
    .then(lodge => {
        res.status(200).json({
          success : true,
          message : "Lodge has been added!"
        })
    })
    .catch(err => {
        res.status(200).json({
          succss : false,
          message : err
        })
    })
}

const findLodge = (req,res,next) => {
  Lodge.findById({_id : req.params.id})
  .then(data => {
    console.log(data)
    res.send(data)
  })
  .catch(err => {
    console.log(err)
    res.send("Error occured, please check the console")
  })
}

const loginLodge = (req,res,next) => {
    try{
      username = req.body.username,
      password = req.body.password
      Lodge.findOne({username : username})
      .then(async lodge => {
          if (lodge){
              if(lodge.password !== password){
                  res.status(200).json({
                      success : false,
                      message : "Please check your credentials"
                  })
              } else {
                  var prefData = {accId: lodge._id}
                  let token = jwt.sign({name : lodge.username}, "secretValue", {expiresIn : '1h'});
                  var userPreferences = await PreferenceImpl.getWidgetTileCollection(prefData);
                  res.json({
                    success : true,
                    message : "User Logged In",
                    hostId : lodge._id,
                    lodgename : lodge.username,
                    isLocked: lodge.isLocked,
                    isLockedMessage: "Your account has been locked, Please contact the Help Desk!",
                    gstin: lodge.gstin,
                    pan: lodge.pan,
                    name: lodge.name,
                    number: lodge.number,
                    redirect: lodge.redirectTo,
                    multipleLogins: lodge.multipleLogins,
                    loginId: lodge._id + "-" + lodge.username,
                    hasMultipleLogins: lodge.multipleLogin.length > 0,
                    preferences: userPreferences,
                    token
                  })
                  updateAuth(username, token);
              }
          } else {
              res.status(200).json({
                  success : false,
                  message : "No user has been found"
              })
          }
      })
    } catch(err){
      res.status(200).json({
        success : false,
        message : "Some internal error occured"
      })
    }
}

const updateAuth = async(username, token) => {
  await Lodge.updateOne({username : username}, {$set : {token : token}})
}

const allLodges = (req,res,next) => {
    Lodge.find({})
    .then(data => {
        console.log(data)
        res.send(data)
    })
    .catch(err => {
        console.log(err)
        res.send("Check the console!")
    })
}

const deleteLodge = (req,res,next) => {
    Lodge.findByIdAndDelete(req.params.id)
    .then(data => {
        console.log("Lodge deleted")
        res.send("Lodge deleted")
    })
    .catch(err => {
        console.log(err)
        res.send("Check the console")
    })
}

const updateLodge = (req,res,next) => {
  Lodge.findByIdAndUpdate(req.params.id, {
    username : req.body.username,
    password : req.body.password,
    emailId : req.body.emailId,
    area : req.body.area,
    branch : req.body.branch,
    isLocked: req.body.isLocked,
    gstin: req.body.gstin,
    pan: req.body.pan,
    name: req.body.name,
    number: req.body.number
  })
    .then(data => {
      res.status(200).json({
        success:  true,
        message: "Lodge has been updated!"
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Function to fetch the universal message!
async function fetchUniversalMessage(lodgeId){
  const lodgeInstance = await Lodge.findById({_id: lodgeId});
  return lodgeInstance.universalMessage;
}

// Controller to fetch universal message!
async function getUniversalMessage(req,res,next){
  try{
    const result = await fetchUniversalMessage(req.params.id);
    res.status(200).json({
      success: true,
      message: result,
      state: result.show
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
}

// Function to patch universal message!
async function patchUniversalMessage(lodgeId, universalMessage){
  const lodgeInstance = await Lodge.findByIdAndUpdate({_id: lodgeId}, {$set: {universalMessage: universalMessage}}, {new: true})
  return lodgeInstance;
}

// Controller to set universal message!
async function setUniversalMessage(req,res,next){
  try{
    const result = patchUniversalMessage(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Universal message updated!"
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
}

// Function to kill the universal message untill the admin trigger it again!
async function killUniversalMessage(lodgeId){
  var killMessage = {
    show: false,
    message: undefined
  }
  const lodgeInstance = await Lodge.findByIdAndUpdate({_id: lodgeId}, {$set: {universalMessage: killMessage}}, {new: true});
  return lodgeInstance;
}

// Controller to kill the universal message!
async function shutdownUniversalMessage(req,res,next){
  try{
    const result = await killUniversalMessage(req.params.id);
    res.status(200).json({
      success: true,
      message: {
        show: false,
        message: "No message at this time"
      }
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured, cannot kill universal message at the moment!"
    })
  }
}

// Function to update refund percentage!
async function updateRefundPercentage(lodgeId, refundPercentage){
  const result = await Lodge.findByIdAndUpdate({_id: lodgeId}, {$set: {refundPercentage: refundPercentage}}, {new: true});
  return result;
}

// Controller to update the refund percentage!
async function putRefundPercentage(req,res,next){
  try{
    const updateRefundInstance = await updateRefundPercentage(req.params.id, req.body.refundPercentage);
    if(updateRefundInstance){
      res.status(200).json({
        success: true,
        message: "Refund Percentage has been updated",
        refundPercentage: updateRefundInstance.refundPercentage
      })
    }
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
}

module.exports = {
    addLodge,loginLodge, allLodges, deleteLodge, findLodge, updateLodge, 
    getUniversalMessage, setUniversalMessage, shutdownUniversalMessage, putRefundPercentage
}
