const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  config : String,
  lodge : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Lodges"
  }
})

module.exports = mongoose.model("Config", configSchema);