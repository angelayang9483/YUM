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
        type: String,
        default: ""
    }
})

const mealSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    ingredients: {
        type: [String],
        default: []
    },
    nutritionalInfo: {
        type: String,
        default: ""
    },
    likes: {
        type: Number,
        default: 0
    },
})

const Comment = mongoose.model('Comment', commentSchema);
const Meal = mongoose.model('Meal', mealSchema);

module.exports = { Comment, Meal };