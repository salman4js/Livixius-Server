const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : String,
    phonenumber : String,
    secondphonenumber : String,
    adults : String,
    childrens : String,
    emailid : String,
    password : String,
    aadharcard : String,
    dateofcheckin : String,
    dateofcheckout : String,
    prebookroomprice : String,
    discount:  String,
    advance: String,
    room : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    }
})

module.exports = mongoose.model("Users", userSchema);
