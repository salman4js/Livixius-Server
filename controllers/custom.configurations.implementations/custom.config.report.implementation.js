const Mongoose = require('mongoose');
const CustomConfigReportModel = require('../../models/custom.configurations/custom.configuration.report');
const CustomConfigBaseImplementation = require("./custom.config.base.implementations/custom.config.base.implementation");

class CustomConfigReportImplementation extends CustomConfigBaseImplementation{
    constructor(options) {
        super(options);
        this.options = options;
    };

    getCustomConfig(){
        return new Promise((resolve, reject) => {
            const configOptions = {model: CustomConfigReportModel, filterQuery: () => this.prepareFilterQuery()}
            super.getCustomConfig(configOptions).then((result) => {
               resolve(result);
            }).catch((err) => {
               reject(err);
            });
        });
    };

    deleteCustomConfig(options) {
        return new Promise((resolve, reject) => {
            const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id)),
                updateQuery = {$pull: {customReportConfigurations: selectedNodes}};
            super.deleteCustomConfig({selectedNodes: selectedNodes, model: CustomConfigReportModel, query: updateQuery}).then(() => {
                resolve();
            }).catch((err) => {
               reject(err);
            });
        });
    };

    editCustomConfig(){
        return new Promise((resolve, reject) => {
           const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id)),
               updateOptions = {selectedNodes: selectedNodes, model: CustomConfigReportModel, comparisonObj: '_id'};

           const _updateModel = (options) => {
               super.editCustomConfig(options).then((result) => {
                   resolve(result);
               }).catch((err) => {
                   reject(err);
               })
           };

           if(this.options.fields){
               this.updateFields(updateOptions).then(() => {
                   _updateModel(updateOptions);
               }).catch((err) => {
                   reject(err);
               });
           } else {
              _updateModel(updateOptions);
           }
        });
    };

    addNewCustomReport(){
        return new Promise((resolve, reject) => {
           this.checkForValidRequestData({action: 'creation', model: CustomConfigReportModel}).then((validationObj) => {
              if(validationObj.isValidRequestData){
                  this.saveCustomConfig({model: CustomConfigReportModel}).then((result) => {
                      const updateQuery = {$push: {customReportConfigurations: result.customConfigModel._id}};
                      this._updateLodgeModel({accId: result.customConfigModel.accId, query: updateQuery}).then(() => {
                          resolve(result.customConfigModel)
                      }).catch((err) => {
                          reject(err);
                      });
                  }).catch((err) => {
                     reject(err);
                  });
              }  else {
                  resolve(validationObj);
              }
           }).catch((err) => {
              reject(err);
           });
        });
    };
}

module.exports = CustomConfigReportImplementation;