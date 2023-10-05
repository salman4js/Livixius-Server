const RoomControllerImpl = require("../room.controller.implementation/room.controller.implementation");
const PrebookControllerImpl = require('../prebook.controller.implementation/prebook.controller.implementation');
const UserControllerImpl = require('../user.controller.implementation/user.controller.implementation');
const _ = require('lodash');

// Get widget tile preferences!
function getWidgetCollectionPref(){
  return {
    upcomingCheckout: true,
    upcomingPrebook: true,
    favorites: true
  }
};

// Get widget tile collection based on the preferences!
async function getWidgetTileCollection(data){
  // Response object!
  var response = {};
  // Do a check here to get the widget collection preference of the user!
  var collectionPref = getWidgetCollectionPref();
  // Check the preference and get data based on the preferences!
  if(collectionPref.upcomingCheckout){
    response.upcomingCheckout = await RoomControllerImpl.getUpcomingCheckout(data);
  }
  if(collectionPref.upcomingPrebook){
    response.upcomingPrebook = await PrebookControllerImpl.getUpcomingPrebook(data);
  }
  if(collectionPref.favorites){
    response.favCustomers = await UserControllerImpl.getFavCustomer(data);
  }
  return _.isEmpty(response) ? false : response;
  
};

module.exports = {getWidgetTileCollection}