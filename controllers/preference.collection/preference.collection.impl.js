const _ = require('lodash');
const Preferences = require('../../models/preferences.collections/preferences.collections');
const Lodges = require('../../models/Lodges');
const RoomControllerImpl = require("../room.controller.implementation/room.controller.implementation");
const VoucherControllerImpl = require('../voucherController/voucher.implementation');
const PrebookControllerImpl = require('../prebook.controller.implementation/prebook.controller.implementation');
const UserControllerImpl = require('../user.controller.implementation/user.controller.implementation');
const MultipleLoginImpl = require('../MultipleLoginController/multiple.login.implementation');
const preferenceCollectionLang = require('./preference.collection.lang');
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
      insights: pref[0].insights,
      administrativePageEnabled: pref[0].administrativePageEnabled
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
  insights: data.insights, datesBetween: data.datesBetweenCount,
  administrativePageEnabled: data.administrativePageEnabled}}, {new: true});
  // After the preference has been updated, get the widget tile collections!
  return await getWidgetTileCollection(data);
};

// Get lodge config preferences!
async function _getLodgeConfigPreferences(data){
  var lodgeConfigPref = await Lodges.findById(data.accId);
  if(!_.isEmpty(lodgeConfigPref)){
    return lodgeConfigPref;
  }
};

// Get widget tile collection based on the preferences!
async function getWidgetTileCollection(data){
  // Response object!
  var response = {};
  // check if the voucher is linked with livixius!
  var lodgeConfigPreference = await _getLodgeConfigPreferences(data);
  // Do a check here to get the widget collection preference of the user!
  var collectionPref = await getWidgetCollectionPref(data);
  // Administrative page enabled!
  response.administrativePageEnabled = (lodgeConfigPreference.loggedInAs === preferenceCollectionLang.ManagerEntry)
      &&  collectionPref?.administrativePageEnabled;
  // Dates between number is configurable but its existence is not!
  response.datesBetweenCount = collectionPref?.datesBetween;
  // Widget tile model count.
  response.widgetTileModelCount = {};
  // When we log in for the first time, datesBetween array data will not be populated yet in the UI.
  // So rest gets the datesBetween array only when the UI is not passing it as the params!
  if(!response?.administrativePageEnabled && !data.datesBetween || data.datesBetween.length === 0){ // This means that UI has not sent any data for datesBetween array
    data.datesBetween = brewDate.getBetween(brewDate.getFullDate('yyyy/mm/dd'), brewDate.addDates(brewDate.getFullDate('yyyy/mm/dd'), collectionPref?.datesBetween));
  }
  // Check the preference and get data based on the preferences!
  if(!response?.administrativePageEnabled && collectionPref?.upcomingCheckout){
    response.upcomingCheckout = await RoomControllerImpl.getUpcomingCheckout(data);
    response.widgetTileModelCount.upcomingCheckout = response.upcomingCheckout.length;
  }
  if(!response?.administrativePageEnabled && collectionPref?.upcomingPrebook){
    response.upcomingPrebook = await PrebookControllerImpl.getUpcomingPrebook(data);
    response.widgetTileModelCount.upcomingPrebook = response.upcomingPrebook.length;
  }
  if(!response?.administrativePageEnabled && collectionPref?.favorites){
    response.favorites = await UserControllerImpl.getFavCustomer(data);
    response.widgetTileModelCount.favorites = response.favorites.length;
  }
  if(!response?.administrativePageEnabled && collectionPref?.history){
    var historyData = await UserControllerImpl.getBookingHistory(data);
    response.history = historyData.result;
    response.widgetTileModelCount.history = historyData.totalCount;
  }
  if(!response?.administrativePageEnabled && collectionPref?.voucherTracker && lodgeConfigPreference.linkVouchersWithLivixius){
    response.voucherTracker = [];
    response.voucherModelList = await VoucherControllerImpl.getVouchersModel(data);
    response.widgetTileModelCount.voucherTracker = response.voucherModelList.length;
  }
  if(response?.administrativePageEnabled && lodgeConfigPreference.multipleLogins){
    response.multipleLogin = await MultipleLoginImpl.getLogins(data);
    response.widgetTileModelCount.multipleLogin = {
      noCountWidget: true
    }
  }
  if(response?.administrativePageEnabled && lodgeConfigPreference.customAdminConfig?.customReport?.isEnabled){
    response.customReport = [];
    response.widgetTileModelCount.customReport = {
      noCountWidget: true
    }
  }
  if(!response?.administrativePageEnabled && collectionPref?.insights && lodgeConfigPreference.isInsights){
    // Insights data will be fetched for requested date.
    var insightsData = await UserControllerImpl.getInsightsData(data);
    response.insights = [];
    response.widgetTileModelCount.insights = {
      noCountWidget: true,
      value: {
        todayArrival: {
          label: preferenceCollectionLang.insights.todayArrival,
          count: insightsData.todayArrival
        },
        todayUpcomingArrival: {
          label: preferenceCollectionLang.insights.todayUpcomingArrival,
          count: insightsData.todayUpcomingArrival
        },
        todayCheckout: {
          label: preferenceCollectionLang.insights.todayCheckout,
          count: insightsData.todayCheckout
        },
        currentCheckedIn: {
          label: preferenceCollectionLang.insights.currentCheckedIn,
          count: insightsData.currentCheckedIn
        }
      }
    };
  }
  return collectionPref && response;
  
};

module.exports = {getWidgetTileCollection, updatePrefCollections}