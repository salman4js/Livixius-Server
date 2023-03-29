const User = require("../models/User");
const Room = require("../models/Rooms.js");
const UserDish = require("../models/UserDishes");
const UserDb = require("../models/UserDb.js");
const RoomType = require("../models/RoomType.js");
const jwt = require("jsonwebtoken");

// Importing brew date package to do the date handling!
const bwt = require('brew-date');

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
            message : data,
        })
    })
    .catch(err => {
        res.status(200).json({
            success : false,
            message : "Some internal error occured!"
        })
    })
}

// Weekly Estimate

async function weeklyEstimate(req,res,next){
  const datesBetween = req.body.dates;
  UserDb.find({lodge: req.params.id})
  .then(data => {
    const valueDatesBetween = data.filter((option) => {
      return datesBetween.includes(option.dateofcheckout);
    })
    const totalRate = weekEstimate(valueDatesBetween, datesBetween); 
      res.status(200).json({
      success: true,
      message: totalRate,
      dates: datesBetween
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err} `
    })
  })
}

// Helper Function for the above implementation!
function weekEstimate(data, datesBetween){
  const result = [];
  let dayResult = 0;
  for(i = 0; i <= datesBetween.length -1; i++){
    data.map((option,key) => {
      if(option.bill !== undefined && option.dateofcheckout !== undefined){
        if(option.dateofcheckout === datesBetween[i]){
          dayResult += Number(option.bill);
        }
      }
    })
    result.push(dayResult);
    dayResult = 0;
  }
  return result;
}

const totalDailyCalculator = (req,res,next) => {
  const result = [];
  UserDb.find({lodge: req.params.id})
    .then(async data => {
      for (i = 0; i <= req.body.datesBetween.length -1; i++){
        const totalRate = await totalDailyAmount(data, req.body.datesBetween[i]);
        result.push(totalRate);
      }
      res.status(200).json({
        success: true,
        dailyCollection: result,
        label: req.body.datesBetween
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Total amount calculator for the Line monthly chart!
async function totalDailyAmount(data, date){
  let rate = 0;
  await data.map((options,key) => {
    if(options.bill !== undefined && date === options.dateofcheckout){
      rate += Number(options.bill)
    }
  })
  return rate;
}


const totalDateCalculator = (req,res,next) => {
  
  const datesBetween = bwt.getBetween(req.body.date1, req.body.date2);
  UserDb.find({lodge: req.params.id})
    .then(async data => {
      const filteredData = data.filter((item) => {
        return datesBetween.includes(item.dateofcheckout);
      })
      const totalRate = totalAmount(data, datesBetween);
      res.status(200).json({
        success: true,
        message: filteredData,
        totalAmount: totalRate,
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}

// Generating total revenue for the brew-mobile!
const totalAmount =  (data, datesBetween) => {
  var totalRate = 0;
   data.map((item,key) => {
    if(item.bill !== undefined && datesBetween.includes(item.dateofcheckout)){
      totalRate += Number(item.bill);
      
    } 
  });
  return totalRate;
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
    try {
        const room = req.body.roomid
        // Reverting the changes caused by the discount and advance in the schema!
        await Room.updateOne({ _id: room }, { $set: { dishes: [], services: [], user : [], isOccupied : "false", channel : undefined,
        preBooked : false, preValid : true, advance: false, discount: false, discountPrice: String, advancePrice: String, advanceDiscountPrice: String, advancePrebookPrice: String } })
        await User.findByIdAndDelete({_id : req.body.userid})
        await UserDish.deleteMany({room : req.body.roomid})
        await UserDb.updateOne({userid : req.body.userid}, { $set : {stayedDays : req.body.stayeddays, dateofcheckout : req.body.checkoutdate, prebooked : req.body.prebook, bill: req.body.amount, dishbill: req.body.totalDishAmount, foodGst: req.body.foodGst, stayGst: req.body.stayGst, totalAmount: req.body.amount + req.body.stayGst + req.body.foodGst, isGst: req.body.isGst}})
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
      const price = calculatePrice(+data.price, noofstays[0], req.body.isHourly);
      res.status(200).json({
        success : true,
        message : price,
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

// Calculate price based on the config for hourly or daily!
function calculatePrice(price, days, isHourly){
  if(isHourly){
    const pricePerHour = price / 24; // 24 being the number of hours per day!
    return Math.round(pricePerHour * days); // Days being the hours in the context!
  } else {
    return price * days;
  }
}

// Favourite customer handler
async function favCustomer(req, res, next){
  try{
    await UserDb.find({lodge: req.params.id})
      .then(async data => {
        const endResult = await checkFrequent(data);
        if(endResult !== undefined){
          res.status(200).json({
            success: true,
            message: endResult
          })
        } else {
          res.status(200).json({
            success: true,
            message: []
          })
        }
      }) 
  } catch(err){
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err}`,
    })
  }
}

async function checkFrequent(users){
  
  const phoneNumbers = users.map(user => user.phonenumber);
  const count = phoneNumbers.reduce((acc, phoneNumber) => {
    acc[phoneNumber] = (acc[phoneNumber] || 0) + 1;
    return acc;
  }, {});

  const frequentUsers = users.filter(user => count[user.phonenumber] >= 2 && user.dateofcheckout !== '');
  
  // Filter the user to remove duplicates as we take this data from the userdb which tends to have duplicates!
  const filteredUsers = frequentUsers.reduce((acc, user) => {
    const key = user.username + user.phonenumber;
    if (!acc.has(key)) {
      acc.set(key, user);
    }
    return acc;
  }, new Map());
  return [...filteredUsers.values()];
}

// Chart Dashboard Calculation Controllers!
async function datesEstimate(req,res,next){
  const dateArr = req.body.dates;
  UserDb.find({lodge: req.params.id})
    .then(data => {
      const weeklyTotal = weeklyHelperEstimate(data, dateArr);
      res.status(200).json({
        success: true,
        message: weeklyTotal
      }) 
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured."
      })
    })
}

function datesHelperEstimate(data, dates){
  // Performs filtering out for the specific dates!
  var weeklyTotal = 0;
  data.map((options,key) => {
    if(dates.includes(options.dateofcheckout)){
      weeklyTotal += Number(options.bill);
    }
  });
  return weeklyTotal;
}

// Room type revenue estimator!
async function roomTypeRev(req,res,next){
  UserDb.find({lodge: req.params.id})
  .then(async data => {
    // Get Room Type by roomid and lodgeid!
    const roomType = await getType(req.params.id, data, req.body.date);
    res.status(200).json({
      success: true,
      roomTypeRev: roomType.result,
      total: roomType.total
    })
  })
  .catch(err => {
    res.status(200).json({
      success: false,
      message: `Some internal error occured!, ${err}`
    })
  })
}

// Room Type Helper Function!
async function getType(lodgeid, data, date){
  const resultObj = {};
  let total = 0;
  await Promise.all(data.map(async (options) => {
    if(date === undefined){
      if(options.bill !== undefined){
        const room = await Room.findById(options.room);
        if (resultObj[room.suiteName] !== undefined) {
          resultObj[room.suiteName] += Number(options.bill);
          total += Number(options.bill);
        } else {
          resultObj[room.suiteName] = Number(options.bill);
          total += Number(options.bill);
        }
      }
    } else {
      if(options.bill !== undefined && options.dateofcheckout === date){
        const room = await Room.findById(options.room);
        if (resultObj[room.suiteName] !== undefined) {
          resultObj[room.suiteName] += Number(options.bill);
          total += Number(options.bill);
        } else {
          resultObj[room.suiteName] = Number(options.bill);
          total += Number(options.bill);
        }
      }
    }
  }));
  return {result : resultObj, total: total};
}


module.exports = {
    allUser, addUser, loginUser, deleteUser, checkUser, userRoom, userdb, generateBill, addUserFromD2, userdbRoom, totalDateCalculator, 
    favCustomer, datesEstimate, weeklyEstimate, totalDailyCalculator, roomTypeRev
}
