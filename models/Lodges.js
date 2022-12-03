const mongoose = require("mongoose");

const lodgeSchema = new mongoose.Schema({
    username : String,
    password : String,
    emailId : String,
    area : String,
    branch : String,
    token : String,
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
    }]
})

module.exports = mongoose.model("Lodges", lodgeSchema);
