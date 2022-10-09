const mongoose = require("mongoose");

const userDishes = new mongoose.Schema({
  roomno : String,
  dishName : String,
  dishRate : String,
  quantity : String,
  comments : String,
  delivered : {type : String, default : "No"},
  room : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  },
  time : String,
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("UserDishes", userDishes);
