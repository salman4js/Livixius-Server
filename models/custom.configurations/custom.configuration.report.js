const Mongoose = require('mongoose');

const CustomConfigurationReport = new Mongoose.Schema({
    configName: {type: String},
    fields: [{
        fieldName: {type: String},
        isSelected: {type: Boolean},
        isCustomField: {type: Boolean},
        fieldCustomFormula: {type: String}
    }],
    accId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Lodges'
    }
});

module.exports = Mongoose.model('CustomConfigurationReport', CustomConfigurationReport);