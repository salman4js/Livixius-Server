const mongoose = require('mongoose');

const livixiusMessages = new mongoose.Schema({
    name: String,
    mobile: Number,
    email: String,
    message: String
});

module.exports = mongoose.model('LivixiusMessages', livixiusMessages);