const User = require("../models/User");
const Room = require("../models/Rooms.js");
const UserDish = require("../models/UserDishes");
const UserDb = require("../models/UserDb.js");
const RoomType = require("../models/RoomType.js");
const jwt = require("jsonwebtoken");

const addUser = (req, res, next) => {
    const user = new User({
        username: req.body.username,
        phonenumber: req.body.phonenumber,
        emailid: req.body.emailid,
        password: req.body.password
    })
    user.save()
        .then(data => {
            console.log(data)
            res.send(true)
        })
        .catch(err => {
            console.log(err)
            res.send(false)
        })
}

const addUserFromD2 = (req,res,next) => {
  const user = new User({
    phonenumber : req.body.phonenumber
  })
  user.save()
  .then(res => {
    console.log(res);
    res.status(200).json({
      success : true,
      message : "Added to the database!"
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    })
  })
}

const userdb = (req,res,next) => {
    UserDb.find({lodge : req.params.id})
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

const userdbRoom = (req,res,next) => {
  UserDb.find({lodge : req.params.id, room: req.body.roomid})
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

const checkUser = (req, res, next) => {
    phonenumber = req.body.phonenumber,
    secphonenumber = req.body.secondphonenumber,
    roomid = req.params.id

    User.findOne({$or : [{phonenumber : phonenumber}, {secondphonenumber : secphonenumber}], room : roomid})
        .then(user => {
            if (user) {
                let token = jwt.sign({name : phonenumber}, "secretValue", {expiresIn : '1h'})
                res.status(200).json({
                  success : true,
                  message : "User logged in",
                  token
                })
            } else {
                res.status(200).json({
                  success : false,
                  message : "User not found!"
                })
            }
        })
}


const loginUser = (req, res, next) => {
    phonenumber = req.body.phonenumber,
        password = req.body.password

    User.findOne({ phonenumber: phonenumber })
        .then(user => {
            if (user) {
                if (user.password !== password) {
                    res.send("0")
                } else {
                    res.send(true)
                }
            } else {
                res.send(false)
            }
        })
}


const allUser = (req, res, next) => {
    User.find({})
        .then(data => {
            console.log(data)
            res.send(data)
        })
        .catch(err => {
            console.log(err)
            res.send(err)
        })
}

const userRoom = (req, res, next) => {
    User.find({ room: req.body.roomid })
        .then(data => {
            res.status(200).json({
                success: true,
                message: data,
            })
        })
        .catch(err => {
            res.status(200).json({
                success: false,
                message: "Some Internal Error Occured, Please Try Again Later!"
            })
        })
}

const deleteUser = async (req, res, next) => {
    console.log(req.body.stayeddays);
    console.log(req.body.checkoutdate);
    console.log(req.body.prebook);
    try {
        const room = req.body.roomid
        // Reverting the changes caused by the discount and advance in the schema!
        await Room.updateOne({ _id: room }, { $set: { dishes: [], services: [], user : [], isOccupied : "false", 
        preBooked : false, preValid : true, advance: false, discount: false, discountPrice: String, advancePrice: String, advanceDiscountPrice: String, advancePrebookPrice: String } })
        await User.findByIdAndDelete({_id : req.body.userid})
        await UserDish.deleteMany({room : req.body.roomid})
        await UserDb.updateOne({userid : req.body.userid}, { $set : {stayedDays : req.body.stayeddays, dateofcheckout : req.body.checkoutdate, prebooked : req.body.prebook, bill: req.body.amount, dishbill: req.body.totalDishAmount}})
        const updateRate = await RoomType.findOne({lodge : req.params.id, suiteType : req.body.roomtype})
        //console.log("Room type", updateRate.price);
        await Room.findOneAndUpdate({_id : room}, {$set : {price : updateRate.price}});
        // Sending the response back to brew!
        res.status(200).json({
            success : true,
            message : "Customer has been checked out properly!"
        })
    } catch (err) {
        res.status(200).json({
            success : false,
            message : err
        })
    }
}

const generateBill = async (req,res,next) => {
  try{
    const noofstays = req.body.stayeddays.match(/\d+/);
    const test = await Room.findById({_id: req.body.roomid})
    const discountPrice = test.discountPrice;
    await Room.findById({lodge : req.body.lodgeid, _id : req.body.roomid})
    .then(data => {
      res.status(200).json({
        success : true,
        message : +data.price * noofstays[0],
        prebook : test.preBooked,
        advance: +test.advancePrebookPrice,
        advanceCheckin : +test.advancePrice,
        isAdvanced: test.advance,
        discountPrice : +discountPrice,
        advanceDiscountPrice: +test.advanceDiscountPrice,
        discount: test.discount
      })
    })
    
  } catch(err) {
    res.status(200).json({
      success : false,
      message : "Some internal error has occured"
    })
  }
}

module.exports = {
    allUser, addUser, loginUser, deleteUser, checkUser, userRoom, userdb, generateBill, addUserFromD2, userdbRoom
}
