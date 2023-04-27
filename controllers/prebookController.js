const Prebook = require("../models/PreBookUser.js");
const Room = require("../models/Rooms.js");
const User = require('../models/User.js');
// Import brew-date package
const brewDate = require('brew-date');

const preBookUserRooms = async (req, res,next) => {
  const roomno = await roomById(req.body.roomid);
  if(req.body.prebookphonenumber === undefined){
    res.status(200).json({
      success: false,
      message: "Phone Number is mandatory!"
    })
  } else if(req.body.prebookphonenumber === null){
    res.status(200).json({
      success: false,
      message: "Phone Number is mandatory!"
    })
  } else if(req.body.prebookphonenumber === ""){
    res.status(200).json({
      success: false,
      message: "Phone Number is mandatory!"
    })
  } else {
    try{
      const preBooking = new Prebook({
        prebookAdvance : req.body.prebookadvance,
        prebookdiscount: req.body.prebookdiscount,
        prebookUsername : req.body.prebookusername,
        prebookPhoneNumber : req.body.prebookphonenumber,
        prebookSecondNumber : req.body.prebooksecondnumber,
        prebookAdults : req.body.prebookadults,
        prebookChildren : req.body.prebookchildren,
        prebookAadharCard : req.body.prebookaadhar,
        prebookDateofCheckin : req.body.prebookdateofcheckin,
        prebookDateofCheckout : req.body.prebookdateofcheckout,
        prebookprice : req.body.prebookprice,
        room : req.body.roomid,
        lodge : req.params.id,
        roomno : roomno,
        prebookcheckinTime: req.body.checkinTime,
        prebookcheckoutTime: req.body.checkoutTime
      })
      if(preBooking){
        await Room.findByIdAndUpdate({_id : preBooking.room}, {preBooked : true, $push : {prebookuser : preBooking._id}});
      }
      await preBooking.save();
      res.status(200).json({
        success : true,
        message : "Customer has been pre-booked successfully!"
      })
    } catch (err){
      console.log(err);
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    }
  }
}

const roomById = async (roomid) => {
  const value = await Room.findById({ _id: roomid});
  console.log("Room Number", value.roomno);
  return value.roomno;
}

// Exclude dates controller!
const excludeDates = async (req,res,next) => {
  const dates = [];
  const datesBetween = await Prebook.find({room: req.params.id});
  const dateofCheckin = datesBetween.map(obj => obj.prebookDateofCheckin);
  const dateofCheckout = datesBetween.map(obj => obj.prebookDateofCheckout);
  
  for(i=0; i <= dateofCheckin.length -1; i++){
    dates.push(brewDate.getBetween(dateofCheckin[i], dateofCheckout[i]));
  }
  console.log(dates);
  res.status(200).json({
    success : true,
    message : dates
  })
}

// Excludes date for checkin user dates!
const excludeDateCheckin = async (req,res,next) => {
  const dates = [];
  try{
    const datesBetween = await User.find({room : req.params.id});
    const checkin = datesBetween.map(obj => obj.dateofcheckin);
    const checkout = datesBetween.map(obj => obj.dateofcheckout);
    //await dates.push(brewDate.getBetween(checkin[0], checkout[0]));
    for(i=0; i <= checkin.length -1; i++){
      dates.push(brewDate.getBetween(checkin[i], checkout[i]));
    }
    res.status(200).json({
      success : true,
      message : dates
    })
  } catch(err){
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  }
}

const ShowAllPrebookedUser = (req,res,next) => {
  Prebook.find({room : req.params.id})
  .then(data => {
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
    console.log(err);
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

const ShowAllPrebookedRooms = (req,res,next) => {
  Prebook.find({lodge: req.params.id})
  .then(data => {
    console.log("Data retrieved");
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
    console.log(err);
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  })
}

const deletePrebookUserRooms = (req,res,next) => {
  Prebook.findByIdAndDelete({_id : req.body.prebookUserId})
  .then(data => {
    console.log("Pre book user got deleted");
    res.status(200).json({
      success : true,
      message : "Pre Book user got deleted!"
    })
  })
  .catch(err => {
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

// Prebook Cabinet for upcoming bookings!
const upcomingPrebook = async (req,res,next) => {
  Prebook.find({lodge: req.params.id})
  .then(async data => {
      const endResult = await checkValues(data, req.body.datesBetween);
      res.status(200).json({
        success: true,
        message: endResult
      })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: "Some internal error occured!"
    })
  })
}

// Prebook cabinet helper function 
async function checkValues(data, date){
  var value = [];
  await data.map((options,key) => {
    if(options.prebookDateofCheckin !== undefined && date.includes(options.prebookDateofCheckin)){
      value.push(options);
    }
  });
  return value;
}

module.exports = {
  preBookUserRooms, ShowAllPrebookedUser, ShowAllPrebookedRooms,
  deletePrebookUserRooms, excludeDates, excludeDateCheckin, upcomingPrebook
}