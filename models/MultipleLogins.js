const mongoose = require("mongoose");

// Keys to differentiate between manager and receptionist - "receptionistLevel" && "managerLevel"

const multipleLogins = new mongoose.Schema({
  username: String,
  password: String,
  loginAs: {type: String, default: "receptionistLevel"},
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
})

module.exports = mongoose.model("MultipleLogins", multipleLogins);