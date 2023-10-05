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
  const favCustomers = await checkFrequent(result);
  return favCustomers;
};

module.exports = {
  getFavCustomer
}