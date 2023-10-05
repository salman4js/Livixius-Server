const WidgetTileColImpl = require("./widget.tile.collection.impl");
const ResponseHandler = require("../../ResponseHandler/ResponseHandler")


// Get widget tile collection based on the preferences!
async function getWidgetTileCollections(req,res){
    const result = await WidgetTileColImpl.getWidgetTileCollection(req.body);
    var infoMessage;
    if(result){
        infoMessage = 'Widget collection fetched successfully!'
        ResponseHandler.success(res, infoMessage, result);
    } else {
        ResponseHandler.error(res);
    }
};

module.exports = {
    getWidgetTileCollections
}