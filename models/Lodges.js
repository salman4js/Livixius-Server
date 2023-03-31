const mongoose = require("mongoose");

const lodgeSchema = new mongoose.Schema({
    username : String,
    password : String,
    emailId : String,
    area : String,
    branch : String,
    token : String,
    isLocked: {type: Boolean, default: 'true'},
    rooms : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    }],
    services : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Services"
    }],
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Dishes"
    }],
    types : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "RoomType"
    }],
    dishtype : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "DishType"
    }],
    tMode : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "tMode"
    }],
    tVehicle : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "tVehicle"
    }],
    config : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Config"
    }],
    isGst: {type: Boolean, default: false},
    isHourly: {type: Boolean, default: false},
    isChannel: {type: Boolean, default: false},
    updatePrice: {type: Boolean, default: false},
    isExtra: {type: Boolean, default: false},
})

module.exports = mongoose.model("Lodges", lodgeSchema);
