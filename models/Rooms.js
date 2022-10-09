const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomno : String,
    isOccupied : {type : String, default : "false"},
    bedCount: String,
    suiteName : String,
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "UserDishes"
    }],
    services : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Services"
    }],
    lodge : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Lodges"
    },
    callawaiter : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "CallAWaiter"
    },
    user : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Users"
    }],
    dishrate : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "DishRate"
    }
})


module.exports = mongoose.model("Rooms", roomSchema);
