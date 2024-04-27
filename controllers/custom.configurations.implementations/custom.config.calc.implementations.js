const Mongoose = require("mongoose");
const _ = require('lodash');
const Lodge = require('../../models/Lodges');
const CustomConfigCalcModel = require('../../models/custom.configurations/custom.configurations.calc');
const CommonUtils = require('../../common.functions/common.functions');
const CustomConfigControllerConstants = require('./custom.config.controller.constants');

class CustomConfigCalcImplementations {
    constructor(options) {
        this.options = options;
        this.mandatoryValues = ['configName', 'accId'];
        this.allowedFields = ['totalAmount', 'extraBedPrice', 'discount', 'advance'];
    };

    _checkForMandatoryValues(fields, compareToFields){
        return CommonUtils.verifyMandatoryFields(Object.keys(fields), compareToFields);
    };

    _checkForNotAllowedFields(fieldsObj){
        const fieldsToCompare = [];
        fieldsObj.forEach((obj) => {
            fieldsToCompare.push(obj.fieldName);
        });
        return CommonUtils.verifyMandatoryFields(this.allowedFields, fieldsToCompare);
    };

    async isConfigNameAlreadyTaken(){
        return CustomConfigCalcModel.findOne({accId: this.options.accId, configName: this.options.configName});
    };

    async isCustomConfigSelected(){
        const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));
        return CustomConfigCalcModel.findOne({
            accId: this.options.accId,
            _id: { $in: selectedNodes },
            isSelected: true
        });
    };

    getCustomConfig(){
        return new Promise((resolve, reject) => {
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
            let QuerySearch = CustomConfigCalcModel.find(filterQuery());
            if (this.options.fields) {
                QuerySearch = QuerySearch.select(this.options.fields);
            }
            QuerySearch.then((result) => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
    };

    editCustomConfig() {
        return new Promise((resolve, reject) => {
            const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));

            const checkForSelectedConfig = () => {
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

            const updateOptions = () => {
                checkForSelectedConfig()
                    .then(() => {
                        CustomConfigCalcModel.findByIdAndUpdate({_id: selectedNodes}, this.options, {new: true}).then((result) => {
                            resolve(result);
                        }).catch((err) => {
                            reject(err);
                        })
                    }).catch((err) => {
                        reject(err);
                });
            };

            if (this.options.fields) {
                CustomConfigCalcModel.findById(selectedNodes, 'fields')
                    .then((fieldCollection) => {
                        const fCollection = _.clone(fieldCollection.fields);
                        this.options.fields.forEach((field) => {
                            const indexToBeUpdated = _.findIndex(fCollection, (fieldModel) => {
                                return fieldModel.fieldName === field.fieldName;
                            });
                            if (indexToBeUpdated !== -1) {
                                fCollection[indexToBeUpdated] = field;
                            } else {
                                fCollection.push(field);
                            }
                        });
                        this.options.fields = fCollection;
                        updateOptions();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                updateOptions();
            }
        });
    };

    deleteCustomConfig(){
        return new Promise((resolve, reject) => {
            // Check if the custom calc config is selected!
            this.isCustomConfigSelected().then((isConfigSelected) => {
               if(!isConfigSelected){
                   const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));
                   CustomConfigCalcModel.deleteMany({_id: {$in: selectedNodes}}).then((result) => {
                       Lodge.findByIdAndUpdate({_id: this.options.accId}, {$pull: selectedNodes}).then(() => {
                           resolve();
                       }).catch((err) => {
                           reject(err);
                       });
                   }).catch((err) => {
                       reject(err);
                   });
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
           // Check if we have all the necessary value!
           const isValid = this._checkForMandatoryValues(this.options, this.mandatoryValues);
           if(isValid){
                this.isConfigNameAlreadyTaken().then((isAlreadyTaken) => {
                    if(!isAlreadyTaken){
                        const areAllowedFields = this.options.fields ? this._checkForNotAllowedFields(this.options.fields) : true;
                        if(areAllowedFields){
                            const customConfigModel = new CustomConfigCalcModel(this.options);
                            if(customConfigModel){
                                customConfigModel.save().then(() => {
                                    const updateQuery = {$push: {customCalcConfigurations: customConfigModel._id}};
                                    if(customConfigModel.isSelectedConfig){
                                        updateQuery['$set'] = {selectedCustomCalcConfig: customConfigModel._id};
                                    }
                                    Lodge.findByIdAndUpdate({_id: customConfigModel.accId}, updateQuery).then(() => {
                                        resolve(customConfigModel);
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                }).catch((err) => {
                                    reject(err);
                                });
                            }
                        } else {
                            resolve({notCreated: true, message: CustomConfigControllerConstants.customCalc.notAllowedFields})
                        }
                    } else {
                        resolve({notCreated: true, message: CustomConfigControllerConstants.customCalc.configNameAlreadyTaken});
                    }
                }).catch((err) => {
                    reject(err);
                });
           } else {
               resolve({notCreated: true, message: CustomConfigControllerConstants.customCalc.inValidArguments});
           }
       });
    };
}

module.exports = CustomConfigCalcImplementations;