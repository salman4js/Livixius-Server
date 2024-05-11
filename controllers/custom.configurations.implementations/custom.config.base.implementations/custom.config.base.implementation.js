const Mongoose = require("mongoose");
const _ = require("lodash");
const Lodge = require('../../../models/Lodges');
const CommonUtils = require("../../../common.functions/common.functions");
const CustomBaseImplConstants = require('./custom.config.base.constants');
const CustomConfigControllerConstants = require("./custom.config.controller.constants");

class CustomConfigBaseImplementation {
    constructor(options) {
        this.options = options;
        this.customBaseImplConstants = CustomBaseImplConstants;
    };

    _checkForMandatoryValues(){
        return CommonUtils.verifyMandatoryFields(Object.keys(this.options), this.customBaseImplConstants[this.options.widgetName][this.action].mandatoryValues);
    };

    _checkForNotAllowedFields(){
        const fieldsToCompare = [];
        this.options.fields.forEach((obj) => {
            fieldsToCompare.push(obj.fieldName);
        });
        return CommonUtils.verifyMandatoryFields(this.customBaseImplConstants[this.options.widgetName][this.action].allowedFields, fieldsToCompare);
    };

    async isConfigNameAlreadyTaken(CustomConfigModel){
        return CustomConfigModel.findOne({accId: this.options.accId, configName: this.options.configName});
    };

    async isCustomConfigSelected(CustomConfigModel){
        const selectedNodes = JSON.parse(this.options.selectedNodes).map(id => Mongoose.Types.ObjectId(id));
        return CustomConfigModel.findOne({
            accId: this.options.accId,
            _id: { $in: selectedNodes },
            isSelected: true
        });
    };

    checkForValidRequestData(options){
       return new Promise((resolve, reject) => {
           // Check for mandatory values!
           this.action = options.action;
           const isValid = this._checkForMandatoryValues();
           if(isValid){
               this.isConfigNameAlreadyTaken(options.model).then((isAlreadyTaken) => {
                   if(!isAlreadyTaken){
                       const areAllowedFields = this.options.fields ? this._checkForNotAllowedFields() : true;
                       if(areAllowedFields){
                           resolve({isValidRequestData: true});
                       } else {
                           resolve({notCreated: true, message: CustomConfigControllerConstants.customCalc.notAllowedFields});
                       }
                   } else {
                       resolve({notCreated: true, message: CustomConfigControllerConstants.customCalc.configNameAlreadyTaken});
                   }
               })
           } else {
               resolve({notCreated: true, message: CustomConfigControllerConstants[this.options.widgetName].inValidArguments});
           }
       })
    };

    updateFields(options){
        return new Promise((resolve, reject) => {
            if(this.options.fields){
                options.model.findById(options.selectedNodes, 'fields')
                    .then((fieldCollection) => {
                        const fCollection = _.clone(fieldCollection.fields);
                        this.options.fields.forEach((field) => {
                            const indexToBeUpdated = _.findIndex(fCollection, (fieldModel) => {
                                return (options.comparisonObj === '_id' ? fieldModel[options.comparisonObj].toString()
                                    : fieldModel[options.comparisonObj]) === field[options.comparisonObj];
                            });
                            if (indexToBeUpdated !== -1) {
                                fCollection[indexToBeUpdated] = field;
                            } else {
                                fCollection.push(field);
                            }
                        });
                        this.options.fields = fCollection;
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                resolve();
            }
        });
    };

    getCustomConfig(CustomConfigModel, filterQuery){
        return new Promise((resolve, reject) => {
            let QuerySearch = CustomConfigModel.find(filterQuery());
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

    editCustomConfig(options){
        return new Promise((resolve, reject) => {
             options.model.findByIdAndUpdate({_id: options.selectedNodes}, this.options, {new: true}).then((result) => {
                 resolve(result);
             }).catch((err) => {
                reject(err);
             });
        });
    };

    saveCustomConfig(options){
        return new Promise((resolve, reject) => {
            const configModel = new options.model(this.options);
            configModel.save().then(() => {
                resolve({customConfigModel: configModel});
            }).catch((err) => {
                reject(err);
            });
        });
    };

    deleteCustomConfig(options){
        return new Promise((resolve, reject) => {
            options.model.deleteMany({_id: {$in: options.selectedNodes}}).then(() => {
                this._updateLodgeModel({accId: this.options.accId, query: options.query}).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    };

    _updateLodgeModel(options){
        return new Promise((resolve, reject) => {
            Lodge.findByIdAndUpdate({_id: options.accId}, options.query).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    };
}

module.exports = CustomConfigBaseImplementation;