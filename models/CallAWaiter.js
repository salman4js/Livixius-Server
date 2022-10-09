const mongoose = require("mongoose");

const callAWaiter = new mongoose.Schema({
  callAwaiter : String,
  Time : String,
  room : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Rooms"
  }
})

module.exports = mongoose.model("CallAWaiter", callAWaiter);
