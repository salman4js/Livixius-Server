const livixiusMessageModel = require('../../models/livixius-messages/livixius.message.model');
const commonUtils = require("../../common.functions/common.functions");
const LivixiusMessageConstants = require("./livixius.message.constants")
class LivixiusMessageImplementation {

    constructor() {
        this.model = livixiusMessageModel;
        this.constant = LivixiusMessageConstants;
    };

    isValidData(model){
        const mandatoryFields = ['name', 'mobile', 'email', 'message'];
        this.isDataValid = commonUtils.verifyMandatoryFields(Object.keys(model), mandatoryFields);
    };

    async addNewMessage(model){
      // Check for the mandatory data.
      this.isValidData(model);
      return new Promise((resolve, reject) => {
          if(this.isDataValid){
              const entry = new this.model(model);
              entry.save().then(() => {
                  resolve(this.constant.creation.creationSuccess);
              }).catch(() => {
                  reject(this.constant.creation.creationError);
              })
          } else {
              // Bad Request.
              resolve(this.constant.creation.badRequest);
          }
      });
    };

    async getAllMessages(){
        const result = await this.model.find({});
        if(result){
            return ({constants: this.constant.read.readSuccess, name: 'messages', result: result});
        } else {
            // Throw read error.
            return this.constant.read.readError;
        }
    };
}

module.exports = new LivixiusMessageImplementation();