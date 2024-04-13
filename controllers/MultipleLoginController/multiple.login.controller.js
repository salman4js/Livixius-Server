const MultipleLogins = require("../../models/MultipleLogins");
const Lodge = require("../../models/Lodges");
const MultipleLoginImpl = require('./multiple.login.implementation');
const ResponseHandler = require('../../ResponseHandler/ResponseHandler');

// Keys to differentiate between manager and receptionist - "receptionistLevel" && "managerLevel"

// Add multiple logins!
async function addLogins(req,res,next){
  MultipleLoginImpl.addLogins(req.body).then((result) => {
    ResponseHandler.staticParser(res, {statusCode: 201, result: result, success: true});
  }).catch((err) => {
    ResponseHandler.staticParser(res, {statusCode: 500, error: err});
  })
};

// Edit single login details!
function editLogins(req,res,next){
  req.body['selectedNodes'] = req.params.selectedNodes;
  MultipleLoginImpl.editLogins(req.body).then((result) => {
    ResponseHandler.staticParser(res, {statusCode: 200, result: result, success: true});
  }).catch((err) => {
    ResponseHandler.staticParser(res, {statusCode: 500});
  });
};

// Login Route for multiple login - receptionist!
async function loginAs(req,res,next){
  let username;
  let password;
  let accId;
  try {
    username = req.body.username
    password = req.body.password
    accId = req.body.lodge
    MultipleLogins.findOne({lodge: accId, username: username})
        .then(async data => {
          if (data) {
            if (data.password !== password) {
              res.status(200).json({
                success: false,
                message: "Please check your credentials!"
              })
            } else {
              // Update lodge entry!
              await Lodge.findByIdAndUpdate(accId, {
                loggedInAs: data.loginAs === "receptionistLevel" ? 'Receptionist' : 'Manager'
              });
              res.status(200).json({
                success: true,
                message: `Receptionist logged in as ${username}`,
                permissionLevel: data.loginAs,
                loggedInUser: data.username,
                loggedInAsRecep: data.loginAs === "receptionistLevel"
              })
            }
          } else {
            res.status(200).json({
              success: false,
              message: "No user has been found"
            })
          }
        })
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Some internal error occurred"
    })
  }
}

//  Get all the multiple login ID's!
function getLogins(req,res,next){
  MultipleLoginImpl.getLogins({accId: req.params.id}).then((result) => {
    const responseHandler = new ResponseHandler();
    responseHandler.parser(res, {statusCode: 200, result: result});
  }).catch((err) => {
    next(err);
  });
};

// Multiple delete login ID!
async function multipleDeleteLogin(req, res, next) {
  req.body['selectedNodes'] = req.params.selectedNodes;
  MultipleLoginImpl.deleteLogins(req.body).then(() => {
    ResponseHandler.staticParser(res, {statusCode: 204});
  }).catch((err) => {
    ResponseHandler.staticParser(res, {statusCode: 500});
  })
};

module.exports = {
  addLogins, getLogins, loginAs, multipleDeleteLogin, editLogins
}