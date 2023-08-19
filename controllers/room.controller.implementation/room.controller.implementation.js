// Room controller implementation part taken care here!

const Room = require("../../models/Rooms");

// Get room instance based on the roomId!
async function getRoomById(roomId){
  const result = await Room.findById({_id: roomId});
  return result;
};

module.exports = {
  getRoomById
}
