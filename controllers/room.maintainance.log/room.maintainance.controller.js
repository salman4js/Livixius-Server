const MaintainanceLogImpl = require("./room.maintainance.implementation");
const ResponseHandler = require("../../ResponseHandler/ResponseHandler");

/* 
    Maintainance Log is user specific, not on room specific.
    userId is mandatory to add new entry.
    userId is mandatory to retrieve entries from the log.
*/

class MaintainanceLogController {
  constructor(){
    this.prepareInitialValues();
  };
  
  // Prepare the mandatory values before proceeding!
  prepareInitialValues(){
    this.logImpl = MaintainanceLogImpl;
    this.responseHandler = new ResponseHandler();
  };
  
  // Add new entry to the log!
  async addNewEntry(req,res,next){
    var result = await this.logImpl.addNewLog(req.body);
    this.responseHandler.parser(res, result);
  };
  
  // Get all entry from the log!
  async getAllEntry(req,res,next){
    var result = await this.logImpl.getEntries(req.params.userId);
    this.responseHandler.parser(res, result);
  };

  // Get selected node entries!
  async getSelectedNodeEntries(req, res, next){
    // Selected nodes id will be in the query params.
    var selectedNodes = JSON.parse(req.params.selectedNodes),
      options = {nodes: selectedNodes, userId: req.params.userId},
      result = await this.logImpl.getSelectedNodeEntries(options);
    this.responseHandler.parser(res, result);
  };
  
  // Add new log type!
  async addMaintainanceLogType(req,res,next){
    var result = await this.logImpl.addMaintainanceLogType(req.body);
    this.responseHandler.parser(res, result);
  };
  
  // Get maintainance log type!
  async getMaintainanceLogType(req,res,next){
    var result = await this.logImpl.getMaintainanceLogType(req.body);
    this.responseHandler.parser(res, result);
  };
};

module.exports = new MaintainanceLogController();