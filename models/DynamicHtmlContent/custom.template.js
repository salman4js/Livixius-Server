const mongoose = require('mongoose');

const customTemplate = new mongoose.Schema({
    customTemplate: {type: String, default: ''}, // Multi-line can be added here.
    templateName: String,
    accId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lodges"
    }
});

module.exports = mongoose.model('DynamicTemplate', customTemplate);