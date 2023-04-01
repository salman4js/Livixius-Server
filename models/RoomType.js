const mongoose = require("mongoose");

const roomType = new mongoose.Schema({
    suiteType : String,
    price : {type: String, default: 0},
    extraBedPrice: {type: String, default: 0},
    lodge : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Lodges"
    }
})


module.exports = mongoose.model("RoomType", roomType);
