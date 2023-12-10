const MaintainanceLog = require('../../models/room.maintainance.log/room.maintainance.log.schema');
const MaintainanceLogType = require('../../models/room.maintainance.log/room.maintainance.log.type.schema');
const MaintainanceLogConstants = require('./room.maintainance.constants');
const _ = require('lodash');

class MaintainanceLogImpl {
  constructor(){
    this.model = MaintainanceLog;
    this.type = MaintainanceLogType;

  };
  
  // Create a new entry!
  async addNewLog(options) {
    return new Promise((resolve, reject) => {
      // Before creating, make sure all the required fields are there!
      if (options.price && options.priceLog && options.userId) {
        var log = new this.model(options);
        log.save()
          .then(() => {
            this.prepareResponseJSON(MaintainanceLogConstants.creation.creationSuccess, 'data', log);
            resolve(this.responseJSON);
          })
          .catch(() => {
            reject(MaintainanceLogConstants.creation.creationFailure);
          });
      } else {
        resolve(MaintainanceLogConstants.creation.needRequiredFields);
      }
    });
  };
  
  // Get all the entry from the log!
  async getEntries(userId){
    var result = await this.model.find({userId: userId});
    if(result){
      this.prepareResponseJSON(MaintainanceLogConstants.read.success, 'data', result);
      return this.responseJSON;
    } else {
      return MaintainanceLogConstants.read.error;
    };
  };
  
  // Add maintainance log type!
  async addMaintainanceLogType(options){
    return new Promise((resolve, reject) => {
      var logType = new this.type(options);
      logType.save()
        .then(() => {
          resolve(MaintainanceLogConstants.creation.creationSuccess);
        }).catch(() => {
          reject(MaintainanceLogConstants.creation.creationFailure);
        });
    });
  };
  
  // Get all maintainance log types!
  async getMaintainanceLogType(options){
    var result = await this.type.find({accId: options.accId});
    if(result){
      // Add default value into the result!
      result.push({value: 'Others'}); // This value 'Others' is added in the model schema as default value.
      this.prepareResponseJSON(MaintainanceLogConstants.read.success, 'data', result);
      return this.responseJSON;
    } else {
      return MaintainanceLogConstants.read.error;
    }
  };
  
  // Handle creation of responseJSON!
  // This method adds data into the responseTxt.
  prepareResponseJSON(response, name, data){
    response[name] = data;
    this.responseJSON = response;
  };
  
};

module.exports = new MaintainanceLogImpl();