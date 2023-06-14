const Voucher = require("../../models/Vouchers/voucher.model.js");
const Lodge = require("../../models/Lodges");

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

module.exports = {
  addVouchers, getVouchers
}