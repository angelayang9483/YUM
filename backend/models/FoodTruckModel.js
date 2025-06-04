const mongoose = require('mongoose')

const Schema = mongoose.Schema

const foodTruckSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dailyLocation: {
        type: String,
        default: ""
    },
    hours: {
        type: [
            {
                label: {
                    type: String,
                    default: ""
                },
                open: {
                    type: String,
                    default: ""
                },
                close: {
                    type: String,
                    default: ""
                }
            }
        ],
        default: []
    },
    hereToday: {
        type: Boolean,
        default: false
    },
    favoriteCount: {
        type: Number,
        default: 0
    }
});


const FoodTruck = mongoose.model("FoodTruck", foodTruckSchema);
module.exports = FoodTruck;
