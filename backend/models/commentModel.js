const mongoose = require('mongoose');

const Schema = mongoose.Schema

const commentSchema = new Schema({
    content: {
        type: String,
        default: ""
    },
    likes: {
        type: Number,
        default: 0
    },
    diningHall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiningHall'
    }, 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;