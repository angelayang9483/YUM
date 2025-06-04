const mongoose = require('mongoose')

const Schema = mongoose.Schema

const mealSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: ""
    },
    dietaryTags: {
        type: [String],
        default: []
    },
    favoritesCount: {
        type: Number,
        default: 0
    },
    hereToday: {
        type: Boolean,
        default: false
    },
    diningHall: {
        type: String,
        default: ""
    }
});


const Meal = mongoose.model("Meal", mealSchema);
module.exports = Meal;
