const Preferences = require('../../models/preferences.collections/preferences.collections');
const Lodges = require('../../models/Lodges');
const RoomControllerImpl = require("../room.controller.implementation/room.controller.implementation");
const VoucherControllerImpl = require('../voucherController/voucher.implementation');
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
      history: pref[0].history,
      datesBetween: pref[0].datesBetween,
      voucherTracker: pref[0].voucherTracker,
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
  upcomingPrebook: data.upcomingPrebook, favorites: data.favorites, history: data.history, voucherTracker: data.voucherTracker,
  datesBetween: data.datesBetweenCount, dashboardVersion: data.dashboardVersion}}, {new: true});
  // After the preference has been updated, get the widget tile collections!
  return await getWidgetTileCollection(data);
};

// Get widget tile collection based on the preferences!
async function getWidgetTileCollection(data){
  // Response object!
  var response = {};
  // check if the voucher is linked with livixius!
  var isVouchersLinkedWithLivixius = Lodges.findById(data.accId).select('linkVouchersWithLivixius').exec()
  .then((result) => {
     return result.linkVouchersWithLivixius;
  }).catch(() => {
     return false;
  });
  // Do a check here to get the widget collection preference of the user!
  var collectionPref = await getWidgetCollectionPref(data);
  // Add dashboard version in the response!
  response.dashboardVersion = collectionPref?.dashboardVersion;
  // Dates between number is configurable but its existence is not!
  response.datesBetweenCount = collectionPref?.datesBetween;
  // Widget tile model count.
  response.widgetTileModelCount = {};
  // When we log in for the first time, datesBetween array data will not be populated yet in the UI.
  // So rest gets the datesBetween array only when the UI is not passing it as the params!
  if(!data.datesBetween || data.datesBetween.length === 0){ // This means that UI has not send any data for datesBetween array
    data.datesBetween = brewDate.getBetween(brewDate.getFullDate('yyyy/mm/dd'), brewDate.addDates(brewDate.getFullDate('yyyy/mm/dd'), collectionPref?.datesBetween));
  }
  // Check the preference and get data based on the preferences!
  if(collectionPref?.upcomingCheckout){
    response.upcomingCheckout = await RoomControllerImpl.getUpcomingCheckout(data);
    response.widgetTileModelCount.upcomingCheckout = response.upcomingCheckout.length;
  }
  if(collectionPref?.upcomingPrebook){
    response.upcomingPrebook = await PrebookControllerImpl.getUpcomingPrebook(data);
    response.widgetTileModelCount.upcomingPrebook = response.upcomingPrebook.length;
  }
  if(collectionPref?.favorites){
    response.favorites = await UserControllerImpl.getFavCustomer(data);
    response.widgetTileModelCount.favorites = response.favorites.length;
  }
  if(collectionPref?.history){
    var historyData = await UserControllerImpl.getBookingHistory(data);
    response.history = historyData.result;
    response.widgetTileModelCount.history = historyData.totalCount;
  }
  if(collectionPref?.voucherTracker && isVouchersLinkedWithLivixius){
    response.voucherTracker = [];
    response.voucherModelList = await VoucherControllerImpl.getVouchersModel(data);
    response.widgetTileModelCount.voucherTracker = response.voucherModelList.length;
  }
  return collectionPref && response;
  
};

module.exports = {getWidgetTileCollection, updatePrefCollections}