const mongoose = require('mongoose');

const preferenceCollections = new mongoose.Schema({
  dashboardPref: String,
  upcomingCheckout: {type: Boolean, default: false},
  upcomingPrebook: {type: Boolean, default: false},
  favorites: {type: Boolean, default: false},
  accId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lodges"
  }
});

module.exports = mongoose.model('PreferenceCollections', preferenceCollections);