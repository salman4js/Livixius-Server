const mongoose = require("mongoose");

const tVehicle = new mongoose.Schema({
  vehicle : String,
  charge : String,
  duty : {type : Boolean, default : false},
  mode : String,
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
});

module.exports = mongoose.model("tVehicle", tVehicle);