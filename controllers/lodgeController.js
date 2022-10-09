const Lodge = require("../models/Lodges");
const jwt = require("jsonwebtoken");

const addLodge = (req,res,next) => {
    const lodge = new Lodge({
        username : req.body.username,
        password : req.body.password,
        emailId : req.body.emailId,
        area : req.body.area,
        branch : req.body.branch
    })
    lodge.save()
    .then(lodge => {
        console.log("Lodge added successfully")
        res.send("Lodge added succssfully")
    })
    .catch(err => {
        console.log(err)
        res.send("Check in the console")
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
    username = req.body.username,
    password = req.body.password

    Lodge.findOne({username : username})
    .then(lodge => {
        if(lodge){
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
            }
        } else {
            res.status(200).json({
                success : false,
                message : "No user has been found"
            })
        }
    })
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
    addLodge, loginLodge, allLodges, deleteLodge, findLodge
}
