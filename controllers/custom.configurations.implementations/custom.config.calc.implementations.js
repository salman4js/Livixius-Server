const Mongoose = require("mongoose");
const _ = require('lodash');
const Lodge = require('../../models/Lodges');
const CustomConfigCalcModel = require('../../models/custom.configurations/custom.configurations.calc');
const CustomConfigControllerConstants = require('./custom.config.base.implementations/custom.config.controller.constants');
const CustomConfigBaseImplementation = require("./custom.config.base.implementations/custom.config.base.implementation");

class CustomConfigCalcImplementations extends CustomConfigBaseImplementation {
    constructor(options) {
        super(options);
        this.options = options;
    };

    getCustomConfig(){
        let filterQuery = () => {
            const filter = {accId: Mongoose.Types.ObjectId(this.options.accId)};
            if(this.options.selectedNodes){
                let selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));
                filter['_id'] = {$in: selectedNodes}
            } else if(this.options['selectedConfigOnly']){
                filter['isSelectedConfig'] = true;
            }
            return filter;
        };
        return new Promise((resolve, reject) => {
           super.getCustomConfig(CustomConfigCalcModel, () => filterQuery()).then((result) => {
               resolve(result);
           }).catch((err) => {
              reject(err);
           });
        });
    };

    editCustomConfig() {
        return new Promise((resolve, reject) => {
            const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));

            const updateSelectedConfig = () => {
                return new Promise((resolve, reject) => {
                    if(this.options.isSelectedConfig){
                        CustomConfigCalcModel.updateMany({accId: this.options.accId, isSelectedConfig: true}, {isSelectedConfig: false})
                            .then(() => resolve())
                            .catch((err) => reject(err));
                    } else {
                        resolve();
                    }
                });
            };

            const _updateModel = () => {
                updateSelectedConfig()
                    .then(() => {
                        super.editCustomConfig({selectedNodes: selectedNodes, model: CustomConfigCalcModel}).then((result) => {
                            resolve(result);
                        }).catch((err) => {
                           reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                });
            };

            if (this.options.fields) {
                this.updateFields({selectedNodes: selectedNodes, model: CustomConfigCalcModel, comparisonObj: 'fieldName'}).then(() => {
                   _updateModel();
                }).catch((err) => {
                    reject(err);
                })
            } else {
                _updateModel();
            }
        });
    };

    deleteCustomConfig(){
        return new Promise((resolve, reject) => {
            // Check if the custom calc config is selected!
            this.isCustomConfigSelected(CustomConfigCalcModel).then((isConfigSelected) => {
               if(!isConfigSelected){
                   const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id)),
                         updateQuery = {$pull: {customCalcConfigurations: selectedNodes}};
                   super.deleteCustomConfig({selectedNodes: selectedNodes, model: CustomConfigCalcModel, query: updateQuery}).then(() => {
                       resolve();
                   }).catch((err) => {
                       reject(err);
                   })
               } else {
                   resolve({notDeleted: true, message: CustomConfigControllerConstants.customCalc.customCalcConfigSelected});
               }
            }).catch((err) => {
                reject(err);
            });
        });
    };

    addNewCustomFormula(){
       return new Promise((resolve, reject) => {
           this.checkForValidRequestData({action: 'creation', model: CustomConfigCalcModel}).then((validationObj) => {
               if(validationObj.isValidRequestData){
                   this.saveCustomConfig({model: CustomConfigCalcModel}).then((result) => {
                       const updateQuery = {$push: {customCalcConfigurations: result.customConfigModel._id}};
                       if(result.customConfigModel.isSelectedConfig){
                           updateQuery['$set'] = {selectedCustomCalcConfig: result.customConfigModel._id};
                       }
                       this._updateLodgeModel({accId: result.customConfigModel.accId, query: updateQuery}).then(() => {
                           resolve(result.customConfigModel)
                       }).catch((err) => {
                           reject(err);
                       });
                   }).catch((err) => {
                       reject(err);
                   });
               } else {
                   resolve(validationObj);
               }
           }).catch((err) => {
               reject(err);
           })
       })
    };
}

module.exports = CustomConfigCalcImplementations;