const mongoose = require("mongoose");

const tMode = new mongoose.Schema({
  tMode : String,
  tVehicle : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "tVehicle"
  }],
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
});

module.exports = mongoose.model("tMode", tMode);