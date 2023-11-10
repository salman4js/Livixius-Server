// Prebook controller implementation!
const Prebook = require('../../models/PreBookUser');
const Room = require('../../models/Rooms');

// Check for upcoming prebook in all the prebook entries!
async function checkUpcomingPrebook(data, date){
  var value = [];
  await data.map((options,key) => {
    if(options.prebookDateofCheckin !== undefined && date.includes(options.prebookDateofCheckin)){
      value.push(options);
    }
  });
  return value;
};

// Get upcoming prebook handler!
async function getUpcomingPrebook(data){
  const result = await Prebook.find({lodge: data.accId});
  const upcomingPrebook = await checkUpcomingPrebook(result, data.datesBetween);
  return upcomingPrebook;
};

// Remove prebook date of checkin and prebookuserid from the room's model when prebook is cancelled.
async function removePrebookCheckinNode(options){
  console.log('Delete prebook options', options);
  const result = await Room.findByIdAndUpdate({_id: options.roomId}, {$pull: {prebookDateofCheckin: options.checkinDate, prebookuser: options.prebookuserid}}, {new: true});
  return result;
};

module.exports = {
  getUpcomingPrebook, removePrebookCheckinNode
}