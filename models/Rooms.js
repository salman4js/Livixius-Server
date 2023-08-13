const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    floorNo: {type: String, default: 'GF'},
    roomno : String,
    isOccupied : {type : String, default : "false"},
    preBooked : {type : Boolean, default : false},
    preValid : {type : Boolean, default : true},
    bedCount: String,
    suiteName : String,
    price : String,
    extraCount: {type: String, default: 0},
    extraBedPrice: {type: String, default: 0},
    advancePrebookPrice: String,
    advanceDiscountPrice: String,
    transport : {type :Boolean, default: false},
    discount: {type: Boolean, default: false},
    discountPrice : String,
    advance: {type:  Boolean, default: false},
    advancePrice: String,
    totalAmount: String, // When channel manager enabled and if the user updates the price amount!
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
    }],
    paymentTracker: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTracker"
    }],
    roomStatus: String,
    prevRoomStatus: String,
    nextRoomStatus: String,
    nextOfNextRoomStatus: String,
    roomStatusConstant: {type: String, default: 'afterCleaned'}, // this is the default status when the room is being created...
    // Change the room status constant to custom state, and that should let the UI know that the room has been updated by the recep.
    // And will not change untill and unless the change has been revereted.
    prevRoomStatusConstant: {type: String, default: "afterCleaned"},
    channel : String
})


module.exports = mongoose.model("Rooms", roomSchema);
