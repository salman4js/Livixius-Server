const mongoose = require("mongoose");


const roomStatusSchema = new mongoose.Schema({
  statusName: String,
  accId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
});

module.exports = mongoose.model("RoomStatus", roomStatusSchema);