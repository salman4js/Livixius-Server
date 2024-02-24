const commonUtils = require('../../common.functions/common.functions');
const CustomTemplateConstant = require('./custom.template.constants');
const customTemplateSchema = require('../../models/DynamicHtmlContent/custom.template');
const LodgeSchema = require("../../models/Lodges");
class CustomTemplateImplementation {
    constructor() {
        this.model = customTemplateSchema;
        this.lodgeModel = LodgeSchema;
        this.constant = CustomTemplateConstant;
    };

    isValidData(model){
      var mandatoryFields = ['templateName', 'customTemplate', 'accId'];
      this.isDataValid = commonUtils.verifyMandatoryFields(model, mandatoryFields);
    };

    async _updateParentSchema(entry, action){
        if(action === 'ADD') {
            await this.lodgeModel.findByIdAndUpdate({_id: entry.accId}, {$push: {customTemplate: entry._id}});
        }
        if(action === 'REMOVE') {
            await this.lodgeModel.findByIdAndUpdate({_id: entry.accId}, {$pull: {customTemplate: entry._id}});
        }
        return;
    };

    async isWidgetEntryAdded(model){
        var widgetEntry = await this.model.find({accId: model.accId, templateName: model.templateName});
        this.widgetEntry = widgetEntry.length > 0;
    };

    async addNewEntry(model) {
        // Check for the mandatory data.
        this.isValidData(model);
        // Check if there is already an entry for history widget, If yes, reject the second entry!
        await this.isWidgetEntryAdded(model);
        return new Promise((resolve, reject) => {
            if (this.isDataValid) {
                if(!this.widgetEntry){
                    var entry = new this.model(model);
                    entry.save()
                        .then(() => {
                            this._updateParentSchema(entry, 'ADD');
                            resolve(this.constant.creation.creationSuccess);
                        })
                        .catch(() => {
                            reject(this.constant.creation.creationError);
                        });
                } else {
                    this._updateAddedEntry(model).then((result) => {
                        resolve(this.constant.update.updateSuccess)
                    }).catch(() => {
                        reject(this.constant.creation.creationError);
                    })
                }
            } else {
                // Reject it by throwing a status code 400.
                resolve(this.constant.creation.badRequest);
            }
        });
    };

    _updateAddedEntry(model){
        return this.model.findOneAndUpdate({templateName: model.templateName}, {templateName: model.templateName, customTemplate: model.customTemplate})
            .then((result) => {
            return result;
        }).catch(() => {
            console.warn("Error occurred while updating the added entry!");
        })
    };

    async getAllEntry(options){
        var result = await this.model.find({accId: options.accid, templateName: options.templatename});
        if(result){
            return ({constants: this.constant.read.readSuccess, name: 'data', result: result});
        } else {
            return this.constant.read.readError;
        }
    };

    async deleteEntry(options){
        var query = {accId: options.accid, templateName: options.templatename, _id: options.templateid};
        return this.model.findOneAndDelete(query).then(() => {
            this._updateParentSchema(query, 'REMOVE');
            return this.constant.deletion.deleteSuccess;
        }).catch(() => {
            return this.constant.deletion.deleteError;
        })
    };
}

module.exports = new CustomTemplateImplementation();