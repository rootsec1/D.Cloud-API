const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    uid: String,
    name: String,
    image: String
});

module.exports = mongoose.model('User', userSchema);