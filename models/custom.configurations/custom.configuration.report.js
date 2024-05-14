const Mongoose = require('mongoose');

const CustomConfigurationReport = new Mongoose.Schema({
    configName: {type: String},
    fields: [{
        fieldName: {type: String},
        isSelected: {type: Boolean},
        isCustomField: {type: Boolean},
        fieldCustomFormula: {type: String},
        createdBy: {type: String, default: 'Manager'}, // By setting these fields default value as Manager,
        // We can handle when any client doesn't pass these two parameter, and when multiple login is not enabled
        // We can assume it's been created by managerial permission.
        enabledBy: {type: String, default: 'Manager'},
        comments: {type: String}
    }],
    accId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Lodges'
    }
});

module.exports = Mongoose.model('CustomConfigurationReport', CustomConfigurationReport);