const RoomStatus = require("../../models/room.status/room.status.schema");
const Lodge = require("../../models/Lodges");
const Room = require("../../models/Rooms");

// Default room status order!
var roomStatusOrder = ['afterCheckedout', 'inCleaning', 'afterCleaned', 'afterCheckin'];

// Get the default predefined room status order!
function getRoomStatusOrder(){
  return roomStatusOrder;
}

// Get the next room status order based on the current room status order!
function getTheNextRoomStateOrder(currentStateOrder){
  var indexOfCurrentState = roomStatusOrder.indexOf(currentStateOrder);
  if(indexOfCurrentState !== -1){
    return roomStatusOrder[indexOfCurrentState + 1];
  }
}

// Add room status implementation!
async function setRoomStatus(data){
  var roomStatus = await new RoomStatus(data);
  if(roomStatus){
    // Create new room status!
    await Lodge.findByIdAndUpdate({_id: data.accId}, {$push: {roomStatus: roomStatus._id}});
    await roomStatus.save();
  }
  return roomStatus;
};

// Get all the room status!
async function getAllRoomStatus(data){
  var result = await RoomStatus.find({accId: data.accId});
  return result
}

// Delete all the room status!
async function deleteAllRoomStatus(data){
  var result = await RoomStatus.deleteMany({accId: data.accId});
  return result;
}

// Set initial room status and also Move the room status to the specified status!
async function roomStatusSetter(data){
  return await Room.findByIdAndUpdate({_id: data.roomId}, {$set: {roomStatus: data.roomStatus, 
    nextRoomStatus: data.nextStatus, nextOfNextRoomStatus: data.nextOfNextStatus, roomStatusConstant: data.roomStatusConstant}});
}

// Get room status as per the passed key!
async function getRoomStatusSeq(data){
  var result = await Lodge.findById({_id: data.accId});
  return result[data.key];
}

// Get the next room status!
async function getTheNextRoomState(data, key){
  var indexOfCurrentState = roomStatusOrder.indexOf(key);
  // Get the next state value from the lodge instance!
  var lodgeInstance = await Lodge.findById({_id: data.accId});
  if(indexOfCurrentState !== -1 && indexOfCurrentState + 1 < roomStatusOrder.length){
    var nextStatus = roomStatusOrder[indexOfCurrentState + 1];
    var nextOfNextStatus = roomStatusOrder[indexOfCurrentState + 2];
    var nextOfNextStatusValue = lodgeInstance[nextOfNextStatus];
    var currentRoomStatus = lodgeInstance[key]
    var nextStatusValue = lodgeInstance[nextStatus];
    return {currentRoomStatus: currentRoomStatus, nextRoomStatus : nextStatusValue, nextOfNextRoomStatus: nextOfNextStatusValue}
  } else {
    return lodgeInstance[key];
  }
}

module.exports = {
  setRoomStatus, getAllRoomStatus, deleteAllRoomStatus, 
  roomStatusSetter, getRoomStatusSeq, getTheNextRoomState,
  getRoomStatusOrder, getTheNextRoomStateOrder
}