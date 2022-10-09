const Lodge = require("../models/Lodges");
const Dish = require("../models/Dishes");

const addDishLodge = async (req,res,next) => {
    if(req.body.dishname == "" && req.body.dishrate == "" && req.body.dishtype == ""){
        res.status(200).json({
            success : false,
            message : "Check your input, Please"
        })
    } else {
        try{
            const dish = new Dish({
                dishName : req.body.dishname,
                dishRate : req.body.dishrate,
                dishType : req.body.dishtype,
                lodge : req.params.id
            })
            if(dish){
                await Lodge.findByIdAndUpdate({_id : dish.lodge}, {$push : {dishes : dish._id}})
            }
            res.status(200).json({
                success : true,
                message : "Dish data added"
            })
            await dish.save()
        } catch(err){
            res.status(200).json({
                success : false,
                message : "Some internal error, please try again later"
            })
        }
    }
}

const dishUpdater = (req,res,next) => {
    Dish.findByIdAndUpdate(req.body.dishId,{
        dishRate : req.body.dishrate,
        dishName : req.body.dishname,
        dishType : req.body.dishtype,
        available : req.body.available
    })
    .then(data => {
        console.log(data)
        res.status(200).json({
            success : true,
            message : "Dish Updated"
        })
    })
    .catch(err => {
        console.log(err)
        res.status(200).json({
            success : false,
            message : "Some Internal Error Occured!"
        })
    })
}

const allDishLodge = (req,res,next) => {
    Dish.find({lodge : req.params.id})
    .then(data => {
        console.log(data)
        res.status(200).json({
          success : true,
          message : data
        })
    })
    .catch(err => {
        console.log(err)
        res.send(200).json({
          success : false,
          message : err
        })
    })
}

const dishVaries = (req,res,next) => {
  Dish.find({lodge : req.params.id, dishType : req.body.type})
  .then(data => {
    console.log(data)
    res.send(data)
  })
  .catch(err => {
    console.log(err)
    res.send("Error occured, please check in the console")
  })
}

const deleteDish = (req,res,next) => {
    Dish.findByIdAndDelete(req.body.dishId)
    .then(data => {
        console.log(data)
        res.send("Dish Deleted")
    })
    .catch(err => {
        console.log(err)
        res.send("Check the console")
    })
}



module.exports = {
    addDishLodge, allDishLodge, deleteDish, dishUpdater, dishVaries
}
