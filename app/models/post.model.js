const mongoose = require('mongoose');
//LOCAL
const userModel = require('./user.model');
const commentModel = require('./comment.model');

const postModel = mongoose.Schema(
    {
        user: userModel.schema,
        content: String,
        comments: [ commentModel.schema ],
        image: String,
        video: String,
        audio: String,
        city: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('post', postModel);