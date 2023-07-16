const Voucher = require("../../models/Vouchers/voucher.model.js");
const VoucherModel = require("../../models/Vouchers/voucher.model.details");
const Lodge = require("../../models/Lodges");
const Queries = require("../../query.optimization/queryAnalyser");

// Add parent vouchers!
async function addVouchers(req,res,next){
  try{
    const vouchers = new Voucher(req.body);
    
    if(vouchers){
      await Lodge.findByIdAndUpdate({_id: req.body.lodge}, {$push: {vouchers: vouchers._id}})
    }
    
    await vouchers.save();
    res.status(200).json({
      success: true,
      message: `New voucher created ${vouchers.voucherName}`
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Couldn't create a new voucher!"
    })
  }
}

// Get previous data for edit vouvher model!
async function getPrevVoucherModel(req,res,next){
  VoucherModel.findById({_id: req.body.voucherId})
    .then(data => {
      res.status(200).json({
        success: true,
        message: data
      })
    }).catch(err => {
      console.log(err)
      res.status(200).json({
        success: false,
        message: "Error while fetching the previous data!"
      })
    })
}

// Edit vouchers models!
async function editVoucherModel(req,res,next){
  VoucherModel.findByIdAndUpdate(req.body.voucherId, {
    dateTime: req.body.dateTime,
    particulars: req.body.particulars,
    cashMode: req.body.cashMode,
    receipt: req.body.receipt,
    payment: req.body.payment
  }).then(data => {
    res.status(200).json({
      success: true,
      message: "Voucher model has been updated!",
      voucherId: data.voucherId
    })
  }).catch(err => {
    res.status(200).json({
      success: false,
      message: "Some internal error occured"
    })
  })
}

// Delete voucher models!
async function deleteVoucherModel(req,res,next){
  var voucherModelId = req.body.voucherId;
  // Get voucher id for the selections!
  var voucherDetails = await VoucherModel.find({_id: req.body.voucherId[0]}); // Since we are dealing
  // with same vouhcer, we can take one voucher model id and get the voucher ID!
  try{
    for(const id of voucherModelId){
      await Voucher.updateMany({voucherDetails: id}, {$pull: {voucherDetails: id}});
      await VoucherModel.findByIdAndDelete(id);
    }
    
    res.status(200).json({
      success: true,
      message: "Voucher models deleted successfully!",
      voucherId: voucherDetails[0].voucherId // We are dealing with same voucher, 
      // one value is enough to get the voucherId from the voucher model
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  }
}

// Send all vouchers!
function getVouchers(req,res,next){
  Voucher.find({lodge: req.params.id})
    .then(data => {
      res.status(200).json({
        success: true,
        message: data
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Internal error occured!"
      })
    })
}

// Add voucher model to the respective vouchers1
async function addVoucherModel(req,res,next){
  try{
    const voucherModel = new VoucherModel(req.body);
    
    if(voucherModel){
      await Voucher.findByIdAndUpdate({_id: req.body.voucherId}, {$push: {voucherDetails: voucherModel._id}})
    }
    
    await voucherModel.save();
    res.status(200).json({
      success: true,
      message: "New voucher model added"
    })
    
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Couldn't create a new voucher model!"
    })
  }
}

// Send voucher model to the client!
function getVoucherModel(req,res,next){
  VoucherModel.find({voucherId: req.body.voucherId})
    .then(data => {
      res.status(200).json({
        success: true,
        message: data,
        tableHeaders: ['Voucher No', 'Date', 'Particulars', 'Cash Mode', 'Receipt', 'Payment'],
        infoMessage: "No vouchers has been added in this list..."
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Internal error occured!"
      })
    })
}

// Function to filter the voucher model result through cheat code!
async function cheatCodeFiltering(req,res,next){
  const queryAction = Queries.analyseQuery(req.body);
  queryAction['voucherId'] = req.body.voucherId
  const result = await voucherModelFiltering(queryAction);
  res.send(result);
}


// Filtering of voucher model details!
function voucherModelFiltering(queryResult){
  
  // Forming filter query!
  const filterQuery = {
    voucherId: queryResult.voucherId,
  };
  
  if(!(queryResult.attribute === "All")){
    if(queryResult.attribute === "Particulars"){
      filterQuery.particulars = queryResult.retrieveValue
    }
    
    if(queryResult.attribute === "Receipt"){
      filterQuery.receipt = queryResult.retrieveValue
    }
    
    if(queryResult.attribute === "Date"){
      filterQuery.dateTime = { $gte: queryResult.retrieveValue[0], $lte: queryResult.retrieveValue[1] };
    }

    if (queryResult.attribute === "CashMode") {
      filterQuery.cashMode = queryResult.retrieveValue
    }
  }
  
  
  return VoucherModel.find(filterQuery)
    .then(data => {
      const result = {
        success: true,
        message: data,
        tableHeaders: ['Voucher No', 'Date', 'Particulars', 'Cash Mode', 'Receipt', 'Payment'],
        infoMessage: "No vouchers model at the selected filter!"
      }
      
      return result;
    })
}

module.exports = {
  addVouchers, getVouchers, getVoucherModel, addVoucherModel, 
  cheatCodeFiltering, editVoucherModel, deleteVoucherModel, getPrevVoucherModel
}