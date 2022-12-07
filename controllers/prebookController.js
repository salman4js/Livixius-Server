const Prebook = require("../models/PreBookUser.js");
const Room = require("../models/Rooms.js");

const preBookUserRooms = async (req, res,next) => {
  const roomno = await roomById(req.body.roomid);
  console.log("Roomno",roomno);
  try{
    const preBooking = new Prebook({
      prebookAdvance : req.body.prebookadvance,
      prebookUsername : req.body.prebookusername,
      prebookPhoneNumber : req.body.prebookphonenumber,
      prebookSecondNumber : req.body.prebooksecondnumber,
      prebookAdults : req.body.prebookadults,
      prebookChildren : req.body.prebookchildren,
      prebookAadharCard : req.body.prebookaadhar,
      prebookDateofCheckin : req.body.prebookdateofcheckin,
      prebookDateofCheckout : req.body.prebookdateofcheckout,
      room : req.body.roomid,
      lodge : req.params.id,
      roomno : roomno
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

const roomById = async (roomid) => {
  const value = await Room.findById({ _id: roomid});
  console.log("Room Number", value.roomno);
  return value.roomno;
}

const ShowAllPrebookedUser = (req,res,next) => {
  Prebook.find({room : req.params.id})
  .then(data => {
    console.log(data)
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

module.exports = {
  preBookUserRooms, ShowAllPrebookedUser, ShowAllPrebookedRooms,
  deletePrebookUserRooms
}