const RoomStatus = require("../../models/room.status/room.status.schema");
const Room = require("../../models/Rooms");
const RoomStatusImpl = require("./room.status.implementation");
const ResponseHandler = require("../../ResponseHandler/ResponseHandler")

// Add new room status for the particular lodges!
async function addRoomStatus(req,res,next){
  const roomStatus = await RoomStatusImpl.setRoomStatus(req.body);
  if(roomStatus){
    ResponseHandler.success(res, roomStatus);
  } else {
    ResponseHandler.error(res)
  }
}

// Get all room status!
async function getAllRoomStatus(req,res,next){
  var roomStatus = await RoomStatusImpl.getAllRoomStatus(req.body);
  if(roomStatus){
    ResponseHandler.success(res, roomStatus)
  } else {
    ResponseHandler.error(res)
  }
}

// Delete all the room status!
async function deleteAllRoomStatus(req,res,next){
  var result = await RoomStatusImpl.deleteAllRoomStatus(req.body);
  var infoMessage = "Room Status deleted successfully"
  if(result){
    ResponseHandler.success(res, infoMessage)
  } else {
    ResponseHandler.error(res)
  }
}

// Move current room status to next status!
async function moveCurrentToNextStatus(req,res,next){
  var infoMessage = "Room state has been moved to the next state!";
  var roomInstance = await Room.findById({_id: req.body.roomId});
  var roomStatusConstant = roomInstance.roomStatusConstant;
  const currentRoomStatus = await RoomStatusImpl.getTheNextRoomState(req.body, roomStatusConstant);
  // Check if the room is in afterCleaned state!
  const afterCleanedState = (roomStatusConstant === 'inCleaning');
  // Append the room status value into the request body!
  req.body['roomStatus'] = afterCleanedState ? "" : currentRoomStatus.nextRoomStatus;
  req.body['nextStatus'] = afterCleanedState ? "" : currentRoomStatus.nextOfNextRoomStatus; // If next status is in empty string, that will let the UI know
  // that the room is ready to be checked in...
  req.body['roomStatusConstant'] = afterCleanedState ? roomStatusConstant : RoomStatusImpl.getTheNextRoomStateOrder(roomStatusConstant);

  RoomStatusImpl.roomStatusSetter(req.body)
    .then(data => {
      ResponseHandler.success(res, infoMessage);
    }).catch(err => {
      console.log(err)
      ResponseHandler.error(res);
    })
}


module.exports = {
  addRoomStatus, getAllRoomStatus, deleteAllRoomStatus, moveCurrentToNextStatus
}