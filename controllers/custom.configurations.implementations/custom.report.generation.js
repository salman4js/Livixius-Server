const _ = require('lodash');
const CustomConfigReportModel = require('../../models/custom.configurations/custom.configuration.report');
const CustomConfigBaseImplementation = require("./custom.config.base.implementations/custom.config.base.implementation");
const CustomCalculationHandler = require('../../content.methods/custom.calculation/custom.calculation');
const CustomConfigControllerConstants = require('./custom.config.base.implementations/custom.config.controller.constants');
const UserControllerImpl = require('../user.controller.implementation/user.controller.implementation');

class CustomReportGeneration extends CustomConfigBaseImplementation {
    constructor(options) {
        super(options);
        this.options = options;
        this.formulaVariables = [];
        this.customFieldMap = [];
        this.customCalculationHandler = new CustomCalculationHandler();
    };

    checkForValidRequestData(options){
        this.action = options.action;
        return this._checkForMandatoryValues();
    };

    prepareFilterQuery(){
        const baseFilter = super.prepareFilterQuery();

        // Aggregation pipeline
        return [
            {$match: baseFilter},
            {$unwind: "$fields"},
            {$match: {"fields.isSelected": true}},
            {
                $group: {
                    _id: "$_id",
                    configName: {$first: "$configName"},
                    accId: {$first: "$accId"},
                    fields: {
                        $push: {
                            fieldName: "$fields.fieldName",
                            objectName: "$fields.objectName",
                            fieldCustomFormula: "$fields.fieldCustomFormula"
                        }
                    }
                }
            }
        ];
    };

    getHistoryValue(fieldOptions){
        const fieldsToRetrieve = [];
        fieldOptions.map((field) => {
            field.objectName && fieldsToRetrieve.push(field.objectName);
            if(field.fieldCustomFormula !== '' && !field.objectName){ // If this condition passes, Then its custom field.
                this.customFieldMap.push(field);
                const formulaVariables = field.fieldCustomFormula.match(/\b[a-zA-Z]+\b/g);
                formulaVariables.forEach((formulaVar) => {
                    if(!fieldsToRetrieve.includes(formulaVar)){
                        fieldsToRetrieve.push(formulaVar);
                        this.formulaVariables.push(formulaVar);
                    }
                });
            };
        });
        return UserControllerImpl.getBookingHistory({accId: this.options.accId,
            query: {
                dateofcheckout: {
                    $gte: this.options["fromDate"],
                    $lte: this.options["toDate"]
                }
            }, projection: fieldsToRetrieve
        }).then((historyValue) => {
            return historyValue.result;
        }).catch((err) => {
            return err;
        });
    };

    getCustomizedFields(){
        return new Promise((resolve, reject) => {
            const configOptions = {model: CustomConfigReportModel, aggregateQuery: () => this.prepareFilterQuery()}
            this.getCustomConfig(configOptions).then((result) => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
    };

    formValuesForCustomField(fieldValues){
        const fields = JSON.parse(JSON.stringify(fieldValues));
        fields.map((field) => {
            this.customFieldMap.map((customField) => {
                const customCalculationHandlerOptions = {};
                customCalculationHandlerOptions['customizedFormula'] = customField.fieldCustomFormula;
                this.formulaVariables.map((variables) => {
                    customCalculationHandlerOptions[variables] = field[variables];
                });
                field[customField.fieldName] = this.customCalculationHandler.generateCustomFormulaResult(customCalculationHandlerOptions);
            });
        });
        return fields;
    };

    cleanUpCustomFormulaResult(customFormulaResult){
        const formulaResult = JSON.parse(JSON.stringify(customFormulaResult));
        formulaResult.map((field) => {
           const formulaFields = _.keys(field);
           this.formulaVariables.map((variable) => {
                if(formulaFields.includes(variable)){
                    delete field[variable];
                }
           });
        });
        return formulaResult;
    };

    prepareFieldsNameHeader(customFields){
        const reportFieldsHeader = {};
        customFields.map((field) => {
            if(field.objectName){
                reportFieldsHeader[field.objectName] = field.fieldName;
            } else {
                reportFieldsHeader[field.fieldName] = field.fieldName;
            }
        });
        return reportFieldsHeader;
    };

    execute(){
        return new Promise((resolve, reject) => {
            let isValid = this.checkForValidRequestData({action: 'generation'});
            if(isValid){
                this.getCustomizedFields().then((customReportConfig) => {
                    this.getHistoryValue(customReportConfig[0].fields).then((fieldValues) => {
                        const customReportFields = this.cleanUpCustomFormulaResult(this.formValuesForCustomField(fieldValues));
                        const customReportHeader = this.prepareFieldsNameHeader(customReportConfig[0].fields);
                        resolve({customReportFields, customReportHeader});
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            } else {
                resolve({message: CustomConfigControllerConstants[this.options.widgetName].inValidArguments});
            }
        })
    };
}

module.exports = CustomReportGeneration;