const mongoose = require("mongoose");

const transportUser = new mongoose.Schema({
  roomno : String,
  name : String,
  charge : String,
  room: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  },
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("TransportUser", transportUser);