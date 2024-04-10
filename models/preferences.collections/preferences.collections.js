const mongoose = require('mongoose');

const preferenceCollections = new mongoose.Schema({
  dashboardPref: String,
  upcomingCheckout: {type: Boolean, default: false},
  upcomingPrebook: {type: Boolean, default: false},
  favorites: {type: Boolean, default: false},
  history: {type: Boolean, default: false},
  datesBetween: {type: Number, default: 3},
  voucherTracker: {type: Boolean, default: false},
  insights: {type: Boolean, default: false},
  administrativePageEnabled: {type: Boolean, default: false},
  accId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
});

module.exports = mongoose.model('PreferenceCollections', preferenceCollections);