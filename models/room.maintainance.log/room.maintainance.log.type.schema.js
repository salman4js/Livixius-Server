const mongoose = require("mongoose");

// Room maintainance log design schema!
const roomMaintainanceLogType = new mongoose.Schema({
  value: String,
  accId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lodges'
  }
});

module.exports = mongoose.model("MaintainanceLogType", roomMaintainanceLogType);