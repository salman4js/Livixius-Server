// User controller implementation!
const User = require('../../models/User');
const UserDb = require('../../models/UserDb');
const PrebookUser = require('../../models/PreBookUser');
const _ = require('lodash');
const Mongoose = require("mongoose");

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
/**
  params @{skipCount} --> Indicates the skipCount.
  params @{limitCount} --> Indicated the limitCount.
  params @{nodes} --> Indicates specific history document id Ex: Export to excel operation.
  params @{filerBy} --> Indicates that the documents has to be filtered by based on the provided key
                        (Comes as a query params)
 **/
async function getBookingHistory(data) {
  var skipCount = parseInt(data.skipcount) || 0,
      limitCount = parseInt(data.limitcount) || 15; // 15 is the limit per page allowed by UI.
  // These values will change when UI requests for other page data.
  var query = {
    lodge: Mongoose.Types.ObjectId(data.accId) || Mongoose.Types.ObjectId(data.id)
  };
  if(!_.isEmpty(data.query)){
    Object.keys(data.query).forEach((filterKey) => {
      query[filterKey] = data.query[filterKey];
    });
  }
  // nodes will be having specific history document id in-case export to excel operation initiated.
  if (data.nodes !== undefined && data.nodes !== null && data.nodes !== '' && data.nodes.length > 0) {
    query._id = { $in: data.nodes };
  }
  var result = await UserDb.find(query).sort({ _id: -1 }).skip(skipCount).limit(limitCount);

  var totalCount = await UserDb.find({ lodge: data.accId || data.id }).countDocuments({});
  return { result, totalCount };
};

// Get insights data for requested dates.
async function getInsightsData(data){
  var todayArrival = await UserDb.find({lodge: data.accId, dateofcheckin: data.datesBetween[0]})
      .countDocuments({});
  var todayUpcomingArrival = await PrebookUser.find({lodge: data.accId, prebookDateofCheckin: data.datesBetween[0]})
      .countDocuments({});
  var todayCheckout = await UserDb.find({lodge: data.accId, dateofcheckout: data.datesBetween[0]})
      .countDocuments({});
  var currentCheckedIn = await User.find({lodge: data.accId})
      .countDocuments({});
  return {todayArrival, todayUpcomingArrival, todayCheckout, currentCheckedIn}
};


module.exports = {
  getFavCustomer, getBookingHistory, getInsightsData
}