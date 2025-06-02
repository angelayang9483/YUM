const mongoose = require('mongoose')

const Schema = mongoose.Schema

const menuSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    diningHallId: {
        type: Schema.Types.ObjectId,
        ref: "DiningHall",
        default: null
    },
    foodTruckId: {
        type: Schema.Types.ObjectId,
        ref: "FoodTruck",
        default: null
    },
    items: {
        type: [
            {
                foodItemId: {
                    type: Schema.Types.ObjectId,
                    ref: "FoodItem",
                    required: true
                },
                station: {
                    type: String,
                    default: ""
                }
            }
        ],
        default: []
    }
});


const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
