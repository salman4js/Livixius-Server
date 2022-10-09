const mongoose = require("mongoose");

const userServices = new mongoose.Schema({
  serviceType : String,
  room : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  },
  time : String
})

module.exports = mongoose.model("UserServices", userServices)
