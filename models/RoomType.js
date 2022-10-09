const mongoose = require("mongoose");

const roomType = new mongoose.Schema({
    suiteType : String,
    price : String,
    lodge : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Lodges"
    }
})


module.exports = mongoose.model("RoomType", roomType);
