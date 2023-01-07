const Lodge = require("../models/Lodges");
const jwt = require("jsonwebtoken");

const addLodge = async (req,res,next) => {
    const lodge = new Lodge({
        username : req.body.username,
        password : req.body.password,
        emailId : req.body.emailId,
        area : req.body.area,
        branch : req.body.branch
    })
    await lodge.save()
    .then(lodge => {
        res.status(200).json({
          success : true,
          message : "Lodge has been added!"
        })
    })
    .catch(err => {
        res.status(200).json({
          succss : false,
          message : err
        })
    })
}

const findLodge = (req,res,next) => {
  Lodge.findById({_id : req.params.id})
  .then(data => {
    console.log(data)
    res.send(data)
  })
  .catch(err => {
    console.log(err)
    res.send("Error occured, please check the console")
  })
}

const loginLodge = (req,res,next) => {
    try{
      username = req.body.username,
      password = req.body.password
      Lodge.findOne({username : username})
      .then(lodge => {
          if (lodge){
              if(lodge.password !== password){
                  res.status(200).json({
                      success : false,
                      message : "Please check your credentials"
                  })
              } else {
                  let token = jwt.sign({name : lodge.username}, "secretValue", {expiresIn : '1h'})
                  res.json({
                    success : true,
                    message : "User Logged In",
                    hostId : lodge._id,
                    lodgename : lodge.username,
                    token
                  })
                  updateAuth(username, token);
              }
          } else {
              res.status(200).json({
                  success : false,
                  message : "No user has been found"
              })
          }
      })
    } catch(err){
      res.status(200).json({
        success : false,
        message : "Some internal error occured"
      })
    }
}

const updateAuth = async(username, token) => {
  console.log("Function getting called!")
  await Lodge.updateOne({username : username}, {$set : {token : token}})
}

const allLodges = (req,res,next) => {
    Lodge.find({})
    .then(data => {
        console.log(data)
        res.send(data)
    })
    .catch(err => {
        console.log(err)
        res.send("Check the console!")
    })
}

const deleteLodge = (req,res,next) => {
    Lodge.findByIdAndDelete(req.params.id)
    .then(data => {
        console.log("Lodge deleted")
        res.send("Lodge deleted")
    })
    .catch(err => {
        console.log(err)
        res.send("Check the console")
    })
}




module.exports = {
    addLodge,loginLodge, allLodges, deleteLodge, findLodge
}
