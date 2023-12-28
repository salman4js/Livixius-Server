// Room controller implementation part taken care here!
const Room = require("../../models/Rooms");
const User = require("../../models/User");

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
  const upcomingCheckout = await checkUpcoming(result, data.datesBetween);
  return upcomingCheckout;
};

module.exports = {
  getRoomById, getUpcomingCheckout
}
