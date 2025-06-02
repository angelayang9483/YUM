const mongoose = require('mongoose')

const Schema = mongoose.Schema

const foodItemSchema = new Schema({
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
    imageUrl: {
        type: String,
        default: ""
    },
    favoritesCount: {
        type: Number,
        default: 0
    }
});


const FoodItem = mongoose.model("FoodItem", foodItemSchema);
module.exports = FoodItem;
