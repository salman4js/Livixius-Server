// User controller implementation!
const UserDb = require('../../models/UserDb');

// Check frequent to find the favorites customers!
async function checkFrequent(users){
  const phoneNumbers = users.map(user => user.phonenumber);
  const count = phoneNumbers.reduce((acc, phoneNumber) => {
    acc[phoneNumber] = (acc[phoneNumber] || 0) + 1;
    return acc;
  }, {});

  const frequentUsers = users.filter(user => count[user.phonenumber] >= 2 && user.dateofcheckout !== '');
  
  // Filter the user to remove duplicates as we take this data from the userdb which tends to have duplicates!
  const filteredUsers = frequentUsers.reduce((acc, user) => {
    const key = user.username + user.phonenumber;
    if (!acc.has(key)) {
      acc.set(key, user);
    }
    return acc;
  }, new Map());
  return [...filteredUsers.values()];
};

// Get favorites customers!
async function getFavCustomer(data){
  const result = await UserDb.find({lodge: data.accId});
  return await checkFrequent(result);
};

// Get booking history based on the limit and skip params for pagination purpose.
async function getBookingHistory(data) {
  var skipCount = data.skipcount || 0,
      limitCount = data.limitcount || 15; // 15 is the limit per page allowed by UI.
  // These values will change when UI requests for other page data.
  var query = {
    lodge: data.accId || data.id,
  };
  if (data.nodes !== undefined && data.nodes !== null && data.nodes !== '' && data.nodes.length > 0) {
    query._id = { $in: data.nodes };
  }
  var result = await UserDb.find(query).sort({ _id: -1 }).skip(skipCount).limit(limitCount);

  var totalCount = await UserDb.find({ lodge: data.accId || data.id }).countDocuments({});
  return { result, totalCount };
}


module.exports = {
  getFavCustomer, getBookingHistory
}