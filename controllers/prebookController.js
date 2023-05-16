const Prebook = require("../models/PreBookUser.js");
const Room = require("../models/Rooms.js");
const User = require('../models/User.js');
// Import brew-date package
const brewDate = require('brew-date');
const commonFunction = require("../common.functions/common.functions");

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
        await Room.findByIdAndUpdate({_id : preBooking.room}, {$push : {prebookuser : preBooking._id}});
      }
      await preBooking.save();
      res.status(200).json({
        success : true,
        message : "Customer has been pre-booked successfully!"
      })
    } catch (err){
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    }
  }
}

const roomById = async (roomid) => {
  const value = await Room.findById({ _id: roomid});
  return value.roomno;
}

// Exclude dates controller!
const excludeDates = async (req,res,next) => {
  const dates = [];
  const datesBetween = await Prebook.find({room: req.params.id});
  const dateofCheckin = datesBetween.map(obj => obj.prebookDateofCheckin);
  const dateofCheckout = datesBetween.map(obj => obj.prebookDateofCheckout);
  
  for(i=0; i <= dateofCheckin.length -1; i++){
    const result = brewDate.getBetween(dateofCheckin[i], dateofCheckout[i])
    for ( j = 0; j <= result.length - 1; j ++){
      dates.push(new Date(result[j]))
    }
  }
  
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
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

const ShowAllPrebookedRooms = (req,res,next) => {
  Prebook.find({lodge: req.params.id})
  .then(data => {
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  })
}

const deletePrebookUserRooms = (req,res,next) => {
  Prebook.findByIdAndDelete({_id : req.body.prebookUserId})
  .then(data => {
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

// Get available prebook rooms!
async function availablePrebook(datesBetween, prebookedData, userCheckedIn){
    
  var nonAvailableRoomIds = [];
  
  prebookedData.map((options,key) => {
      options.dates.forEach(( k, i ) => {
        if(datesBetween.includes(k)){
          nonAvailableRoomIds.push(options.roomno);
        }
      })
  })
  
  userCheckedIn.map((options,key) => {
    options.dates.forEach((k, i) => {
      if(datesBetween.includes(k)){
        nonAvailableRoomIds.push(options.roomno)
      }
    })
  })
    
  return [...new Set(nonAvailableRoomIds)]; // Removing duplicate room id's

}

// Get available rooms based on date, time and room type!
async function getPrebook(req, res, next){
  try{
    var betweenDate = [];
    
    // Put together date and time to get time between by brew-date!
    const checkin = req.body.dateofCheckin + " " + req.body.checkinTime;
    const checkout = req.body.dateofCheckout + " " + req.body.checkoutTime;
    
    const dateTime = [checkin, checkout];
              
    const prebookRooms = await Prebook.find({lodge: req.params.id});
    const datesBetween = brewDate.getBetween(req.body.dateofCheckin, req.body.dateofCheckout);
    
    const getDateTime = commonFunction.getTimeBetweenWithDate(datesBetween, dateTime);
    
    const userCheckedIn = await getBookedRooms(req.params.id);
        
    const findBookedRooms = findNonPrebooked(userCheckedIn, "checkin");
                
    const findPrebook = findNonPrebooked(prebookRooms, "prebook");
        
    const getNonAvailableRoom = await availablePrebook(getDateTime, findPrebook, findBookedRooms);
    
    res.status(200).json({
      success: true,
      nonAvailableRoomId: getNonAvailableRoom,
      checkinDate: req.body.dateofCheckin,
      checkoutDate: req.body.dateofCheckout,
      checkinTime: req.body.checkinTime,
      checkoutTime: req.body.checkoutTime   
    })
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Unable to fetch available room at this moment!"
    })
  }
}

// Get Booked Rooms user data!
async function getBookedRooms(lodgeId){
  const userCheckedIn = await User.find({lodge: lodgeId, dateofcheckout: { $ne: undefined }});
  return userCheckedIn;
}

// Helper Function - getPrebook
function findNonPrebooked(rooms, constants){
  
  var prebookedDetails = [];
    
  rooms.map((options, key) => {
    var getBetween = {};
    var dates = [];
    var time = [];
    getBetween['roomno'] = options.roomno;
    
    if(constants === "prebook"){
      // Put together date and time to get time between by brew-date!
      var checkin = options.prebookDateofCheckin + " " + options.prebookcheckinTime;
      var checkout = options.prebookDateofCheckout + " " + options.prebookcheckoutTime;
      var betweenDates = brewDate.getBetween(options.prebookDateofCheckin, options.prebookDateofCheckout);
    } else {
      // Put together date and time to get time between by brew-date!
      const checkinTime = brewDate.roundTime(brewDate.timeFormat(options.checkinTime));
      const checkoutTime = brewDate.roundTime(brewDate.timeFormat(options.checkoutTime));
      var checkin = options.dateofcheckin + " " + checkinTime;
      var checkout = options.dateofcheckout + " " + checkoutTime;
      var betweenDates = brewDate.getBetween(options.dateofcheckin, options.dateofcheckout);
    }
    
    const dateTime = [checkin, checkout];
    
    const getDateTime = commonFunction.getTimeBetweenWithDate(betweenDates, dateTime);
    
    getBetween['dates'] = [...new Set(getDateTime)];
    
    prebookedDetails.push(getBetween);
    
  })

  return prebookedDetails;
}

// Helper function -- getPrebook!
function convert12to24(time){
  return brewDate.convert12to24(time);
}

// Get only rooms which are available for prebooking based on search data!
function getAvailablePrebook(req,res,next){
  
  const checkinDate = req.body.checkinDate;
  const checkinTime = req.body.checkinTime;
  const checkoutDate = req.body.checkoutDate;
  const checkoutTime = req.body.checkoutTime;
  
  const checkin = checkinDate + " " + checkinTime;
  const checkout = checkoutDate + " " + checkoutTime;
  
  // Form a date
  
  
}

module.exports = {
  preBookUserRooms, ShowAllPrebookedUser, ShowAllPrebookedRooms,
  deletePrebookUserRooms, excludeDates, excludeDateCheckin, upcomingPrebook,
  getPrebook, getAvailablePrebook
}