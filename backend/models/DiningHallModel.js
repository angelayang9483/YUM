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
                time: {
                    type: String,
                    default: ""
                },
                isOpen: {
                    type: Boolean,
                    default: true
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
    comments: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }]
}, {
    timestamps: true,  // Add automatic createdAt/updatedAt
    versionKey: false  // Remove __v field
});

// Ensure no caching issues
diningHallSchema.set('toJSON', { virtuals: true });
diningHallSchema.set('toObject', { virtuals: true });

const DiningHall = mongoose.model("DiningHall", diningHallSchema);
module.exports = DiningHall;
