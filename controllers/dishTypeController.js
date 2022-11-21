const Lodge = require("../models/Lodges.js");

const DishType = require("../models/DishType.js");


const dishType = async (req,res,next) => {
  if(req.body.dishtype == ""){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.dishtype == undefined){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else if(req.body.dishtype == null){
    res.status(200).json({
      success : false,
      message : "That's the bad input!"
    })
  } else {
    try{
      if(await checkDish(req.params.id, req.body.dishtype) === null){
        const dishType = new DishType({
          dishType : req.body.dishtype,
          lodge : req.params.id
        })
        if(dishType){
          await Lodge.findByIdAndUpdate({_id : dishType.lodge}, {$push : {dishtype : dishType._id}})
        }
        await dishType.save()
        res.status(200).json({
          success : true,
          message : "Dish Type added!"
        })
      } else {
        res.status(200).json({
          success : false,
          message : "Dish type already exists."
        })
      }
    } catch(err){
      res.status(200).json({
        success : false,
        message : "Some internal error occured!"
      })
    }
  }
}

const checkDish = async (lodgeID, dishname) => {
  const value = await DishType.findOne({lodge : lodgeID, dishType : dishname})
  return value;
}

const allDishType = (req,res,next) => {
  DishType.find({lodge : req.params.id})
  .then(data => {
    console.log(data);
    res.status(200).json({
      success : true,
      message : data
    })
  })
  .catch(err => {
    res.status(200).json({
      success : false,
      message : "Some internal error occured!"
    })
  })
}

module.exports = {
  dishType, allDishType
}