// Room controller implementation part taken care here!
const mongoose = require("mongoose");
const Lodge = require('../../models/Lodges');
const Room = require("../../models/Rooms");
const RoomType = require('../../models/RoomType');
const User = require("../../models/User");
const RoomStatusImplementation = require('../room.status/room.status.implementation');
const RoomControllerConstants = require('./room.controller.constants');

// Get room instance based on the roomId!
async function getRoomById(roomId){
  return Room.findById({_id: roomId});
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

// Check if the room number already exists!
async function checkForDuplicateRoomNum(options){
  return Room.findOne({lodge: options.accId, roomno: options.roomno});
}

// Check if the suiteName is already taken!
async function checkIfSuiteNameIsAlreadyTaken(options){
  return RoomType.findOne({lodge: options.accId, suiteType: options.suiteType});
}

// Modify room data implementation!
function _editRoomData(options){
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
              extraBedPrice: options.extraBedPrice,
              price: roomTypeInstance.price
            }, {new: true}).then(data => {
              resolve(data);
            }).catch(err => {
              reject(err);
            })
          });
        });
      } else {
        resolve({notUpdated: true, message: RoomControllerConstants.alreadyOccupied.roomNo});
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

// Delete room data implementation!
function _deleteRoomModel(options){
  return new Promise(async (resolve, reject) => {
    var selectedNodes = JSON.parse(options.selectedNodes).map(id => mongoose.Types.ObjectId(id));
    if(!await checkIfRoomOccupied(selectedNodes)){
      Room.deleteMany({_id: {$in: selectedNodes}}).then(data => {
        resolve();
      }).catch(err => {
        reject(err);
      })
    } else {
      resolve({notDeleted: true, message: RoomControllerConstants.alreadyOccupied.roomNo});
    }
  });
}

function _createRoomModel(options){
  return new Promise((resolve, reject) => {
    checkForDuplicateRoomNum(options).then((isAlreadyCreated) => {
      if(!isAlreadyCreated){
        const room = new Room({
          floorNo: options.floorNo,
          roomno: options.roomno,
          bedCount: options.bedCount,
          suiteName: options.suiteName,
          price : options.price,
          extraBedPrice: options.extraBedPrice,
          lodge: options.accId
        });
        if(room){
          room.save().then(() => {
            Lodge.findByIdAndUpdate({_id: room.lodge}, {$push: {rooms: room._id}}).then(() => {
              // Now set the room status for the newly created rooms!
              // After the room has been saved, set the initial room status to ['afterCleaned'] state!
              RoomStatusImplementation.getTheNextRoomState(options, 'afterCleaned').then((roomStatus) => {
                options['roomStatus'] = roomStatus.currentRoomStatus
                options['nextRoomStatus'] = roomStatus.nextRoomStatus
                options['nextOfNextRoomStatus'] = roomStatus.nextOfNextRoomStatus
                options['roomStatusConstant'] = "afterCleaned";
                options['roomId'] = room._id;
                RoomStatusImplementation.roomStatusSetter(options).then(() => {
                  resolve(room);
                }).catch((err) => {
                  reject(err);
                })
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            });
          }).catch((err) => {
            reject(err);
          })
        }
      } else {
        resolve({notCreated: true, message: RoomControllerConstants.alreadyCreated.roomNo});
      }
    });
  });
}

function _createRoomTypeModel(options){
  return new Promise((resolve, reject) => {
    checkIfSuiteNameIsAlreadyTaken(options.accId, options.suiteType).then((isAlreadyTaken) => {
      if(isAlreadyTaken === null){
        const roomType = new RoomType({
          suiteType : options.suiteType.toUpperCase(),
          price : options.price,
          extraBedPrice: options.extraBedPrice,
          lodge : options.accId
        })
        if(roomType){
          roomType.save().then(() => {
            Lodge.findByIdAndUpdate({_id: roomType.lodge}, {$push: {types: roomType._id}}).then(() => {
              resolve(roomType);
            }).catch((err) => {
              reject(err);
            })
          }).catch((err) => {
            reject(err);
          })
        }
      } else {
        resolve({notCreated: true, message: RoomControllerConstants.alreadyCreated.roomType});
      }
    }).catch((err) => {
      reject(err);
    })
  });
}

function _editRoomTypeModel(options){
  return new Promise((resolve, reject) => {
    checkIfSuiteNameIsAlreadyTaken(options).then((isAlreadyExists) => {
      if(isAlreadyExists === null){
        RoomType.findOneAndUpdate({_id: options.selectedNodes, lodge : options.accId},{
          suiteType : options.suiteType,
          extraBedPrice: options.extraBedPrice,
          price : options.price
        }, {new: true}).then((data) => {
          resolve(data);
        }).catch((err) => {
          reject(err);
        })
      } else {
        resolve({notUpdated: true, message: RoomControllerConstants.alreadyOccupied.roomType});
      }
    }).catch((err) => {
      reject(err);
    })
  });
}

module.exports = {
  getRoomById, getUpcomingCheckout, _editRoomData,
  _deleteRoomModel, _createRoomModel, _createRoomTypeModel, _editRoomTypeModel
}
