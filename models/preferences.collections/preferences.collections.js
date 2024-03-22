const mongoose = require('mongoose');

const preferenceCollections = new mongoose.Schema({
  dashboardPref: String,
  upcomingCheckout: {type: Boolean, default: false},
  upcomingPrebook: {type: Boolean, default: false},
  favorites: {type: Boolean, default: false},
  history: {type: Boolean, default: false},
  datesBetween: {type: Number, default: 3},
  dashboardVersion: {type: Boolean, default: false}, // true indicates new dashboard.
  voucherTracker: {type: Boolean, default: false},
  insights: {type: Boolean, default: false},
  multipleLogin: {type: Boolean, default: false},
  accId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
});

module.exports = mongoose.model('PreferenceCollections', preferenceCollections);