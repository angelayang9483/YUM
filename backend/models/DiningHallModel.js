const mongoose = require('mongoose')

const Schema = mongoose.Schema

const diningHallSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        building: {
            type: String,
            default: ""
        }
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
    }
});


const DiningHall = mongoose.model("DiningHall", diningHallSchema);
module.exports = DiningHall;
