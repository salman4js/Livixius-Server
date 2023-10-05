const RoomControllerImpl = require("../room.controller.implementation/room.controller.implementation");

// Get widget tile preferences!
function getWidgetCollectionPref(){
  return {
    checkout: true,
    prebook: true,
    favorites: true
  }
};

// Get widget tile collection based on the preferences!
async function getWidgetTileCollection(){
  // Response object!
  var response = {};
  // Do a check here to get the widget collection preference of the user!
  var collectionPref = getWidgetCollectionPref();
  
};

module.exports = {getWidgetTileCollection}