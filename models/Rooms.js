const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomno : String,
    isOccupied : {type : String, default : "false"},
    preBooked : {type : Boolean, default : false},
    preValid : {type : Boolean, default : true},
    bedCount: String,
    suiteName : String,
    price : String,
    advancePrebookPrice: String,
    transport : {type :Boolean, default: false},
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
    },
    prebookuser : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Prebooks"
    }]
})


module.exports = mongoose.model("Rooms", roomSchema);
