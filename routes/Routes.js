const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Lodge = require("../models/Lodges.js");
const User = require("../models/User.js");

// Auth JWT verification
const authVerify = require("../controllers/Verifier/authVerifier.js");
const userController = require("../controllers/userController");
const lodgeController = require("../controllers/lodgeController");
const dishController = require("../controllers/dishController");
const serviceController = require("../controllers/serviceController");
const roomController = require("../controllers/roomController");
const prebookController = require("../controllers/prebookController");
const userDishController = require("../controllers/userdishesController");
const userServiceController = require("../controllers/userserviceController");
const roomTypeController = require("../controllers/roomTypeController.js");
const qrcodegenerator = require("../controllers/qrcode_generator.js");
const dishTypeController = require("../controllers/dishTypeController.js");
const tModeController = require("../controllers/tModeController.js");
const tVehicleController = require("../controllers/tVehicleController.js");
const clientController = require("../controllers/Config/clientController.js");
const invoiceController = require("../controllers/Invoice.controller/Invoice.controller.js");
const voucherController = require("../controllers/voucherController/voucher.controller");
const multipleLoginController = require("../controllers/MultipleLoginController/multiple.login.controller");
const paymentTrackerController = require("../controllers/payment.tracker/payment.tracker.controller");
const refundTrackerController = require("../controllers/refund.tracker/refund.tracker.controller")
const roomStatusController = require("../controllers/room.status/room.status.controller");
const preferenceColController = require('../controllers/preference.collection/preference.collection.controller');
const maintainanceLogController = require('../controllers/room.maintainance.log/room.maintainance.controller');

// JWT token verification
const verifyJWT = async (req, res, next) => {
    console.log("accessing token verification");
    const token = req.body.headers["x-access-token"];    
    if (!token) {
        res.status(200).json({
          success : false,
          message : "Please provide token!"
        })
    } else {
        jwt.verify(token, "secretValue", async (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(200).json({
                  success : false,
                  message : "Token has expired!"
                })
            } else {
              console.log(req.params.id);
                // JWT Payload contains username from the database!
                const authVerification = await checkUsername(req.params.id);
                req.userId = decoded.id;
                console.log(decoded.name);
                console.log(authVerification);
                if(decoded.name === authVerification){
                  console.log("Token verification done!");
                  next();
                } else {
                  console.log("Invalid auth access!");
                  res.status(200).json({
                    success : false,
                    message : "You are not authorized to access this data!"
                  })
                }
            }
        });
    }
  };
  
  const verifyJWTClassic = async (req, res, next) => {
      console.log("accessing token verification");
      const token = req.body.headers    
      if (!token) {
          res.status(200).json({
            success : false,
            message : "Please provide token!"
          })
      } else {
          jwt.verify(token, "secretValue", async (err, decoded) => {
              if (err) {
                  console.log(err);
                  res.status(200).json({
                    success : false,
                    message : "Token has expired!"
                  })
              } else {
                  // JWT Payload contains username from the database!
                  const authVerification = await checkUserName(req.params.id);
                  req.userId = decoded.id;
                  console.log("decoded_Name" ,decoded.name);
                  console.log("Name" ,authVerification);
                  if(decoded.name === authVerification){
                    console.log("Token verification done!");
                    next();
                  } else {
                    console.log("Invalid auth access!");
                    res.status(200).json({
                      success : false,
                      message : "You are not authorized to access this data!"
                    })
                  }
              }
          });
      }
    };
  

// Check the username with JWT payload value
const checkUsername = async (req_userId) => {
  const username = await Lodge.findOne({_id : req_userId}).exec();
  return username.username;
}

// Check username for classic!
const checkUserName = async (req_userId) => {
  const username = await User.findOne({room : req_userId}).exec();
  return username.phonenumber;
}

// All GET Methods

router.get("/:id/allusers", userController.allUser);

router.get("/alllodge", lodgeController.allLodges)


// All POST Methods

router.post("/addusers", userController.addUser)

router.post("/login", userController.loginUser);

router.post("/:id/findlodge", lodgeController.findLodge);

router.post("/:id/updatelodge", lodgeController.updateLodge);

router.post("/:id/checkuser", userController.checkUser);

router.post("/adduserfromd2", userController.addUserFromD2);

router.post("/:id/userroom", userController.userRoom);

router.post("/:id/deleteuser", userController.deleteUser)

router.post("/addlodge", lodgeController.addLodge)

router.post("/loginlodge", lodgeController.loginLodge)

router.post("/alllodges", lodgeController.allLodges);

router.post("/:id/deletelodge", lodgeController.deleteLodge)

router.post("/:id/adddish", dishController.addDishLodge)

router.post("/:id/dishlodge", verifyJWT, dishController.allDishLodge)

router.post("/:id/dishLodge-1", dishController.allDishLodge);

router.post("/:id/dishvaries", dishController.dishVaries)

router.post("/:id/dishupdater", dishController.dishUpdater)

router.post("/deletedish", dishController.deleteDish);

router.post("/:id/addservice", serviceController.createService);

router.post("/:id/servicelodge", serviceController.allServiceLodge);

router.post("/serviceupdater", serviceController.serviceUpdater);

router.post("/deleteservice", serviceController.deleteService);

router.post("/:id/createroom", roomController.createRoom);

router.post("/:id/:state/roomlodge", verifyJWT, roomController.allRooms);

router.post("/:id/:state/roomlodge-duplicate", roomController.allRooms);

router.post("/:id/availability", roomController.availability);

router.post("/:id/occupied", roomController.occupiedRooms);

router.post('/:id/upcomingcheckout', roomController.upcomingCheckOut);

router.post("/:id/roomone", roomController.roomOne);

router.post("/:id/dishbyroom", roomController.dishByRoom);

router.post("/:id/roombyid", verifyJWTClassic, roomController.roomById);

router.post("/:id/roomupdater", roomController.roomsUpdater);

router.post("/:id/deleteroom", roomController.deleteRoom);

router.post("/:id/adddishroom", roomController.addDishRooms);

router.post("/:id/getroomid", roomController.getRoomId);

router.post("/:id/adduserrooms", roomController.addUserRooms);

router.post("/:id/getroomno", roomController.getRoomNo)

router.post("/:id/update-room-price", roomController.updateRoomPrice);

// Prebook routes!

router.post("/:id/getnonprebook", prebookController.getPrebook);

router.post("/:id/editprebookedrooms", prebookController.editPrebookedRooms);

router.post("/:id/getavailableprebook", prebookController.getAvailablePrebook);

router.post("/:id/addprebookuserrooms", prebookController.preBookUserRooms);

router.post("/:id/showallprebookuser", prebookController.ShowAllPrebookedUser);

router.post("/:id/deleteprebookuserrooms", prebookController.deletePrebookUserRooms);

router.post("/:id/showallprebookedrooms", prebookController.ShowAllPrebookedRooms);

router.get('/:id/excludedates', prebookController.excludeDates);

router.post('/:id/prebookupcoming', prebookController.upcomingPrebook);

router.post("/updateroomdata", roomController.updateRoomData);

router.post("/:id/userdishes", userDishController.allUserDishes);

router.post("/:id/deleteuserdish", userDishController.deleteUserDish)

router.post("/:id/addserviceroom",roomController.addServiceRooms);

router.post("/:id/allserviceroom", userServiceController.allUserService);

router.post("/:id/callawaiter", roomController.callAWaiter)

router.post("/:id/edituserdish", userDishController.editUserDish)

router.post("/:id/deletedish", userDishController.deleteDish);

router.post("/:id/notifications", userDishController.Notifications);

router.post("/:id/senddelivered", userDishController.sendDelivered);

router.post("/:id/checkdelivered", userDishController.checkDelivered);

router.post("/:id/checkdeliveredroom", userDishController.checkDeliveredRoom);

router.post("/:id/deleteroomdish", userDishController.deleteRoomDish);

router.post("/:id/userdb", verifyJWT, userController.userdb);

router.post("/:id/userdbroom", userController.userdbRoom);

router.post("/:id/userdb1", userController.userdb);

router.post("/:id/favcustomer", userController.favCustomer);

router.post("/:id/updateoccupieddata", userController.updateOccupiedData);

router.post("/:id/totalratecalculator", userController.totalDateCalculator);

router.post("/:id/totaldailycalculator", userController.totalDailyCalculator);

router.post("/:id/datesestimate", userController.datesEstimate);

router.post("/:id/weeklyestimate", userController.weeklyEstimate);

router.post("/:id/roomtyperev", userController.roomTypeRev);

router.post("/:id/roomtypeanalysis", userController.roomTypeAnalysis);

router.post("/:id/addroomtype", roomTypeController.createSuite);

router.post("/:id/allroomtype", roomTypeController.allRoomType);

router.post("/:id/getprice", roomTypeController.getPrice);

router.post("/:id/edittypedata", roomTypeController.editTypeData);

router.post("/:id/deleteroomtype", roomTypeController.deleteRoomType);

router.post("/:id/generatebill", userController.generateBill);

router.post("/:id/dishuserrate", userDishController.dishUserRate);

router.post("/:id/calcdishuserrate", userDishController.calculateDishUserRate);

router.post("/:id/dishuserratelength", userDishController.dishUserRateLength);

router.post("/:id/alldishtype", dishTypeController.allDishType);

router.post("/:id/createdishtype", dishTypeController.dishType);

// Qr code generator

router.post("/:id/generator",qrcodegenerator.generator);

// Exclude dates

router.get("/:id/excludeDatescheckin", prebookController.excludeDateCheckin);

// Transport Mode

router.post("/:id/add-tMode", tModeController.create_tMode);

router.get("/:id/tMode", tModeController.all_t_Mode);

router.post("/:id/delete_tMode", tModeController.delete_tMode);

router.post("/:id/add_tvehicle", tVehicleController.create_transport);

router.get("/:id/getAllVehicle", tVehicleController.getAllVehicle);

router.put("/:id/ontoggle", tVehicleController.onToggle);

router.post("/:id/deleteentry", tVehicleController.deleteEntry);

// Config

router.get("/:id/config-checking", clientController.checkConfig);

router.get("/:id/check-matrix", clientController.checkMatrix);

router.get("/:id/config-get", clientController.showConfig);

router.post("/:id/config-update-matrix", clientController.updateMatrix);

router.post("/:id/create-config", clientController.create_config);

router.post("/:id/delete-config", clientController.deleteConfig);

// Invoice Memory!

router.get("/:id/getinvoicememory", invoiceController.getAllInvoiceMemory);

router.post("/:id/addinvoice", invoiceController.addInvoice);

router.post("/:id/deleteinvoicememory", invoiceController.deleteInvoiceMemory);

router.post("/:id/initialstateofinvoicecount", invoiceController.getInitialStateOfInvoiceCount);

// Vouchers Routes!
router.post("/:id/addvouchers", voucherController.addVouchers);

router.post("/:id/editvouchermodel", voucherController.editVoucherModel);

router.post("/:id/getprevvouchermodel", voucherController.getPrevVoucherModel);

router.post("/:id/deletevouchermodel", voucherController.deleteVoucherModel);

router.get("/:id/getvouchers", voucherController.getVouchers);

router.post('/:id/getvouchermodel', voucherController.getVoucherModel);

router.post("/:id/addvouchermodel", voucherController.addVoucherModel);

router.post("/:id/cheatcodefilter", voucherController.cheatCodeFiltering);

router.post("/:id/getallvouchermodelsum", voucherController.getAllVouchersModelSum);

router.post("/:id/getnetprofitpreview", voucherController.getNetProfitPreview);

router.post("/:id/getttotalamountofallvouchermodel", voucherController.getTotalAmountOfAllVoucherModel);

// Multiple Login Routes!
router.post("/:id/addmultiplelogin", multipleLoginController.addLogins);

router.get("/:id/getlogins", multipleLoginController.getLogins);

router.post("/:id/deletelogin", multipleLoginController.deleteLogin);

router.post("/:id/loginas", multipleLoginController.loginAs);

router.post("/:id/multiplelogindelete", multipleLoginController.multipleDeleteLogin);

router.post("/:id/editlogins", multipleLoginController.editLogins);

// Payment tracker routes!
router.post("/:id/getpaymenttracker", paymentTrackerController.getPayment);

router.post("/:id/addpaymenttracker", paymentTrackerController.addPaymentTracker);

router.post("/:id/deletesinglepayment", paymentTrackerController.deleteSinglePaymentTracker);

router.post("/:id/getpaymentdetails", paymentTrackerController.getPaymentDetails);

router.post("/:id/deleteallpaymenttracker", paymentTrackerController.deleteAllPaymentTracker);

router.post("/:id/getallpaymenttracker", paymentTrackerController.getAllPaymentTracker);

router.post("/:id/getallpaymenttrackersum", paymentTrackerController.getAllPaymentTrackerAmountSum);

// Refund tracker routes!
router.post("/:id/addrefundtracker", refundTrackerController.addRefund);

router.post("/:id/getrefundtracker", refundTrackerController.getRefund);

router.delete("/:id/deleterefundtracker", refundTrackerController.deleteRefund);

router.post("/:id/deletespecificrefund", refundTrackerController.deleteSpecificRefund);

// Universal message routes!
router.post("/:id/setuniversalmessage", lodgeController.setUniversalMessage);

router.get("/:id/getuniversalmessage", lodgeController.getUniversalMessage);

router.post("/:id/killuniversalmessage", lodgeController.shutdownUniversalMessage);

// Refund Percentage
router.post("/:id/updaterefundpercentage", lodgeController.putRefundPercentage);

// Room Status!
router.post("/:id/addroomstatus", roomStatusController.addRoomStatus);

router.get("/:id/getallroomstatus", roomStatusController.getAllRoomStatus);

router.post("/:id/deleteallroomstatus", roomStatusController.deleteAllRoomStatus);

router.post("/:id/movetonextstate", roomStatusController.moveCurrentToNextStatus);

// Widget tile collection controller!
router.post('/:id/getwidgettilecol', preferenceColController.getWidgetTileCollections);

router.post('/:id/updatepref', preferenceColController.updatePreferences);

// Maintainance Log!
router.get('/:id/getallentries', maintainanceLogController.getAllEntry.bind(maintainanceLogController));

router.post('/:id/addnewentry', maintainanceLogController.addNewEntry.bind(maintainanceLogController));

router.get('/:id/getmaintainancelogtype', maintainanceLogController.getMaintainanceLogType.bind(maintainanceLogController));

router.post('/:id/addmaintainancelogtype', maintainanceLogController.addMaintainanceLogType.bind(maintainanceLogController));

module.exports = router;
