const mongoose = require("mongoose");

const dishType = new mongoose.Schema({
  dishType : String,
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("DishType", dishType);