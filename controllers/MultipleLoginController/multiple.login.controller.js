const MultipleLogins = require("../../models/MultipleLogins");
const Lodge = require("../../models/Lodges");

// Keys to differentiate between manager and receptionist - "receptionistLevel" && "managerLevel"

// Add multiple logins!
async function addLogins(req,res,next){
  try{
    const multipleLogins = new MultipleLogins(req.body);
    
    if(multipleLogins){
      await Lodge.findByIdAndUpdate({_id: req.body.lodge}, {$push: {multipleLogin: multipleLogins._id}})
    }
    
    await multipleLogins.save();
    res.status(200).json({
      success: true,
      message: `${multipleLogins.username} ID created successfully!`
    })
  } catch(err){
    res.status(200).json({
      error: err,
      success: false,
      message: "Couldn't create a login ID at the moment!"
    })
  }
}

// Login Route for multiple login - receptionist!
async function loginAs(req,res,next){
  try{
    username = req.body.username,
    password = req.body.password
    MultipleLogins.findOne({username: username})
      .then(data => {
        if(data){
          if(data.password !== password){
            res.status(200).json({
              success: false,
              message: "Please check your credentials!"
            })
          } else {
            res.status(200).json({
              success: true,
              message: `Receptionist logged in as ${username}`,
              loggedInUser: data.username,
              loggedInAsRecep: data.loginAs === "receptionistLevel" ? true : false
            })
          }
        } else {
          res.status(200).json({
            success: false,
            message: "No user has been found"
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

//  Get all the multiple login ID's!
function getLogins(req,res,next){
  MultipleLogins.find({lodge: req.params.id})
  .then(data => {
    res.status(200).json({
      success: true,
      message: data,
      tableHeaders: ['Username', 'Password', 'Permission Level']
    })
  }).catch(err => {
    res.status(200).json({
      success: false,
      message: "Internal server error occured!"
    })
  })
}

// Delete single login ID!
async function deleteLogin(req,res,next){
  
  // Delete multiple login reference from the lodge reference1
  await Lodge.findByIdAndUpdate({_id: req.body.lodgeid}, {$pull: {multipleLogin: req.body.loginId}});
  
  // Delete multiple login original reference!
  MultipleLogins.findByIdAndDelete({_id: req.body.loginId})
    .then(data => {
      res.status(200).json({
        success: true,
        message: "Login ID deleted successfully!"
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured!"
      })
    })
}


module.exports = {
  addLogins, getLogins, deleteLogin, loginAs
}