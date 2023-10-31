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
      favorites: pref[0].favorites,
      datesBetween: pref[0].datesBetween,
      dashboardVersion: pref[0].dashboardVersion
    }
  } else {
    var newPref = new Preferences({
      accId: data.accId
    });
    await newPref.save();
  }
};

// Update preference collections!
async function updatePrefCollections(data){
  var pref = await Preferences.findOneAndUpdate({accId: data.accId}, {$set: {upcomingCheckout: data.upcomingCheckout,
  upcomingPrebook: data.upcomingPrebook, favorites: data.favorites, 
  datesBetween: data.datesBetweenCount, dashboardVersion: data.dashboardVersion}}, {new: true});
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
  // Add dashboard version in the response!
  response.dashboardVersion = collectionPref?.dashboardVersion;
  // Datesbetween number is configurable but its existence is not!
  response.datesBetweenCount = collectionPref?.datesBetween;
  // When we login for the first time, datesBetween array data will not be populated yet in the UI.
  // So rest gets the datesBetween array only when the UI is not passing it as the params!
  if(!data.datesBetween || data.datesBetween.length === 0){ // This means that UI has not send any data for datesBetween array
    var datesBetweenArr = brewDate.getBetween(brewDate.getFullDate('yyyy/mm/dd'), brewDate.addDates(brewDate.getFullDate('yyyy/mm/dd'), collectionPref?.datesBetween));
    data.datesBetween = datesBetweenArr;
  }
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