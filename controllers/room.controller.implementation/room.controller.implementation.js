// Room controller implementation part taken care here!
const Room = require("../../models/Rooms");
const RoomType = require('../../models/RoomType');
const User = require("../../models/User");
const RoomControllerConstants = require('./room.controller.constants');
const mongoose = require("mongoose");

// Get room instance based on the roomId!
async function getRoomById(roomId){
  const result = await Room.findById({_id: roomId});
  return result;
};

// Get upcoming checkout helper function!
async function checkUpcoming(data, date){
  var endResult = [];
  for (const options of data) {
    if (options.dateofcheckout !== undefined && date.includes(options.dateofcheckout)){
      endResult.push(options);
    }
  }
  return endResult;
};

// Get upcoming checkout implementation!
async function getUpcomingCheckout(data){
  const result = await User.find({lodge: data.accId}).sort({ _id: -1 });
  return await checkUpcoming(result, data.datesBetween);
};

// Check if the room already has been occupied!
async function checkIfRoomOccupied(node){
  const value = await Room.findOne({ _id : {$in: node}});
  return value['isOccupied'] === 'true';
}

// Modify room data implementation!
async function _editRoomData(options){
  return new Promise(async (resolve, reject) => {
    // First check if the room is allowed to be modified.
    checkIfRoomOccupied((options.selectedNodes)).then((isOccupied) => {
      if(!isOccupied){
        // When we manually set the room status, we have to keep track of old status
        // So that when releasing it from the custom state, it will go back to what state it is already in.
        // get the current room status constant and room status and store it in the prev states of those!
        Room.findById({_id: options.selectedNodes}).then((roomInstance) => {
          var currentRoomStatusConstant = roomInstance["prevRoomStatusConstant"];
          var currentRoomStatus = roomInstance["prevRoomStatus"];
          RoomType.findOne({lodge: options.accId, suiteType: options.suiteName}).then((roomTypeInstance) => {
            Room.findByIdAndUpdate(options.selectedNodes, {
              floorNo: options.floorNo,
              roomno: options.roomno,
              suiteName: options.suiteName,
              roomStatusConstant: options.roomStatus !== undefined && options.roomStatus !== 'Release' ? options.roomStatusConstant : currentRoomStatusConstant,
              roomStatus: options.roomStatus !== undefined && options.roomStatus !== 'Release' ? options.roomStatus : currentRoomStatus,
              prevRoomStatus: options.roomStatus !== undefined ? currentRoomStatus : undefined,
              prevRoomStatusConstant: options.roomStatus !== undefined ? currentRoomStatusConstant : undefined,
              bedCount: options.bedCount,
              price: roomTypeInstance.price
            }, {new: true}).then(data => {
              resolve(data);
            }).catch(err => {
              reject(err);
            })
          });
        });
      } else {
        resolve({notUpdated: true, message: RoomControllerConstants.alreadyOccupied});
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

// Delete room data implementation!
async function _deleteRoomModel(options){
  return new Promise(async (resolve, reject) => {
    var selectedNodes = JSON.parse(options.selectedNodes).map(id => mongoose.Types.ObjectId(id));
    if(!await checkIfRoomOccupied(selectedNodes)){
      Room.deleteMany({_id: {$in: selectedNodes}}).then(data => {
        resolve();
      }).catch(err => {
        reject(err);
      })
    } else {
      resolve({notDeleted: true, message: RoomControllerConstants.alreadyOccupied});
    }
  });
}

module.exports = {
  getRoomById, getUpcomingCheckout, _editRoomData, _deleteRoomModel
}
