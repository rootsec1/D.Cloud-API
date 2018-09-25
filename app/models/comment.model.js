const mongoose = require('mongoose');
//LOCAL
const userModel = require('./user.model');

const commentSchema = mongoose.Schema(
    {
        user: userModel.schema,
        content: String,
        city: String,
        post_id: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('comment', commentSchema);