const PreferenceImpl = require("./preference.collection.impl");
const ResponseHandler = require("../../ResponseHandler/ResponseHandler")

// Get widget tile collection based on the preferences!
async function getWidgetTileCollections(req,res){
    const result = await PreferenceImpl.getWidgetTileCollection(req.body);
    var infoMessage;
    if(result){
        // Delete the server side keys from the result and send it to the UI!
        delete result.accId;
        delete result._id;
        delete result.__v;
        infoMessage = 'Widget collection fetched successfully!'
        ResponseHandler.success(res, infoMessage, result);
    } else {
        ResponseHandler.error(res);
    }
};

// Update the preference collections!
async function updatePreferences(req, res, next){
  const result = await PreferenceImpl.updatePrefCollections(req.body);
  var infoMessage;
  if(result){
    
    infoMessage = 'Preferences updated successfully!';
    ResponseHandler.success(res, infoMessage, result);
  } else {
    ResponseHandler.error(res);
  }
};

module.exports = {
    getWidgetTileCollections, updatePreferences
}