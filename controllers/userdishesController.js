const Room = require("../models/Rooms");

const UserDish = require("../models/UserDishes");


// Lodge Routes

const allUserDishes = (req,res,next) => {
  UserDish.find({room : req.body.roomId})
  .then(data => {
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
    console.log(err)
    res.status(200).json({
      success : false,
      message : "Error occured, please check your server console!"
    })
  })
}

const Notifications = (req,res,next) => {
  UserDish.find({delivered : "Yes", lodge : req.params.id})
  .then(data => {
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
   res.status(200).json({
    success : false,
    message : "Some internal error occured.."
   })
  })
}

const deleteUserNotifications = (req,res,next) => {
  UserDish.deleteMany({room : req.body.roomid})
  .then(data => {
    res.status(200).json({
      success : true,
      message : "User Dish Notifications has been cleared successfully!"
    })
  })
}

const deleteUserDish = (req,res,next) => {
  UserDish.deleteMany({size : "large"})
  .then(data => {
    console.log(data)
    res.send("Dish data deleted successfully!")
  })
  .catch(err => {
    console.log(err)
    res.send("Some error occured, please check the console!")
  })
}

const deleteRoomDish = (req,res,next) => {
  UserDish.deleteMany({room : req.body.roomid})
  .then(data => {
    console.log(data)
    res.status(200).json({
      success : true,
      message : "Room data has been cleared successfully!"
    })
  })
  .catch(err => {
    console.log(err)
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  })
}

// User Routes

const editUserDish = (req,res,next) => {
  UserDish.findByIdAndUpdate(req.body.userDishId,{
    quantity : req.body.quantity
  })
  .then(data => {
    console.log(data)
    res.status(200).json({
      success : true,
      message : "Order has been modified"
    })
  })
  .catch(err => {
    console.log(err)
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  })
}

const sendDelivered = (req,res,next) => {
  UserDish.findByIdAndUpdate(req.body.userdishId,{
    delivered : "Yes"
  })
  .then(data => {
    console.log(data)
    res.status(200).json({
      success : true,
      message : "Dish moved to delivered state"
    })
  })
  .catch(err => {
    console.log(err)
    res.status(200).json({
      success : false,
      message : "Some internal error occured"
    })
  })
}

const checkDelivered = (req,res,next) => {
  UserDish.find({delivered : "No", lodge : req.params.id})
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

const checkDeliveredRoom = (req,res,next) => {
  UserDish.find({delivered : "No", room : req.params.id})
    .then(data => {
      console.log(data);
      res.status(200).json({
        success : true,
        message : data 
      })
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        success: false,
        message : "Some internal error occured!"
      })
    })
}

const deleteDish = (req,res,next) => {
  UserDish.findByIdAndDelete(req.body.userDishId)
  .then(data => {
    console.log(data)
    res.status(200).json({
      success : true,
      message : "Dish Order Got Cancelled"
    })
  })
  .catch(err => {
    console.log(err);
    res.status(200).json({
      success : false,
      message : "Some Internal Error Occured"
    })
  })
}

const dishUserRate = (req,res,next) => {
  UserDish.find({room : req.body.roomid})
  .then(data => {
    console.log(data);
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

const calculateDishUserRate = (req,res,next) => {
  var totalRate = 0;
  UserDish.find({room : req.body.roomid})
  .then(async data =>{
    const totalRate = await calculateFunction(data);
    res.status(200).json({
      success : true,
      message : totalRate
    })
  })
  .catch(err => {
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

const calculateFunction = async (data) => {
  var totalRate = 0;
  await data.map((item,key) => {
    totalRate += Number(item.dishRate) * Number(item.quantity);
  })
  return totalRate;
}

const dishUserRateLength = (req,res,next) => {
  UserDish.find({room : req.params.id})
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.send(err);
  })
}

// Object.entries(tutorials).forEach(([key, value]) => {  
//   console.log(`${key}: ${value}`)
// })

module.exports = {
  allUserDishes, deleteUserDish, editUserDish, deleteDish,
  deleteRoomDish, dishUserRate,
  Notifications, sendDelivered, checkDelivered, checkDeliveredRoom, deleteUserNotifications, dishUserRateLength,
  calculateDishUserRate
}

// Automation framework setup in eclipse was done, now going through existing regression report and will work
// on Dev setup based on developers availability!
