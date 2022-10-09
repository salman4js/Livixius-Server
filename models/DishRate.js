const mongoose = require("mongoose");

const dishRate = new mongoose.Schema({
  dishRate : String,
  room : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  }]
})

module.exports = mongoose.model("DishRate", dishRate);