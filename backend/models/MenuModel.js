const mongoose = require('mongoose')

const Schema = mongoose.Schema

const stationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    meals: [{
        type: Schema.Types.ObjectId,
        ref: "Meal",
        required: true
    }]
});

const mealPeriodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    stations: [stationSchema]
});

const menuSchema = new Schema({
    name: {
        type: String,
        required: true
    },
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
    mealPeriods: {
        type: Map,
        of: mealPeriodSchema,
        default: new Map()
    }
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
