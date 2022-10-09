const Room = require("../models/Rooms");

const UserService = require("../models/UserServices");

const allUserService = (req,res,next) => {
  UserService.find({room : req.body.roomId})
  .then(data => {
    console.log(data)
    res.send(data)
  })
  .catch(err => {
    console.log(err)
    res.send("Error occured, please check the console")
  })
}

module.exports = {
  allUserService
}
