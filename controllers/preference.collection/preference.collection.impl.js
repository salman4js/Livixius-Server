const Preferences = require('../../models/preferences.collections/preferences.collections');
const RoomControllerImpl = require("../room.controller.implementation/room.controller.implementation");
const PrebookControllerImpl = require('../prebook.controller.implementation/prebook.controller.implementation');
const UserControllerImpl = require('../user.controller.implementation/user.controller.implementation');
const brewDate = require('brew-date');

// Get widget tile preferences!
async function getWidgetCollectionPref(data){
  var pref = await Preferences.find({accId: data.accId});
  if(pref.length > 0){
    return {
      upcomingCheckout: pref[0].upcomingCheckout,
      upcomingPrebook: pref[0].upcomingPrebook,
      favorites: pref[0].favorites
    }
  } else {
    var newPref = new Preferences({
      accId: data.accId
    });
    prev.save();
  }
};

// Update preference collections!
async function updatePrefCollections(data){
  var pref = await Preferences.findOneAndUpdate({accId: data.accId}, {$set: {upcomingCheckout: data.upcomingCheckout,
  upcomingPrebook: data.upcomingPrebook, favorites: data.favorites}}, {new: true});
  // After the preference has been updated, get the widget tile collections!
  var collection = await getWidgetTileCollection(data);
  return collection;
};

// Get widget tile collection based on the preferences!
async function getWidgetTileCollection(data){
  // Response object!
  var response = {};
  // Do a check here to get the widget collection preference of the user!
  var collectionPref = await getWidgetCollectionPref(data);

  // Check the preference and get data based on the preferences!
  if(collectionPref?.upcomingCheckout){
    response.upcomingCheckout = await RoomControllerImpl.getUpcomingCheckout(data);
  }
  if(collectionPref?.upcomingPrebook){
    response.upcomingPrebook = await PrebookControllerImpl.getUpcomingPrebook(data);
  }
  if(collectionPref?.favorites){
    response.favorites = await UserControllerImpl.getFavCustomer(data);
  }
  return collectionPref && response;
  
};

module.exports = {getWidgetTileCollection, updatePrefCollections}