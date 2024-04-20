const Mongoose = require('mongoose');

const CustomConfigurationCalc = new Mongoose.Schema({
    configName: {type: String},
    formName: {type: String},
    isSelectedConfig: {type: Boolean, default: false},
    fields: [{
        fieldName: {type: String},
        fieldCustomFormula: {type: String}
    }],
    accId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Lodges'
    }
});

module.exports = Mongoose.model('CustomConfigurationCalc', CustomConfigurationCalc);