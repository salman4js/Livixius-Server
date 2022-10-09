const mongoose = require("mongoose");


const serviceSchema = new mongoose.Schema({
    serviceType : String,
    lodge : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Lodges"
    }
})

module.exports = mongoose.model("Services", serviceSchema);