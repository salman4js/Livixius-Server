// Prebook controller implementation!
const Prebook = require('../../models/PreBookUser');

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

module.exports = {
  getUpcomingPrebook
}