const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
    dishName : String,
    dishRate : String,
    dishType : String,
    available : {type : String, default : "In Stock"},
    extraAddings : String,
    lodge : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Lodges"
    }
})

module.exports = mongoose.model("Dishes", dishSchema);
