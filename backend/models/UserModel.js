const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    favorites: {
        type: [String],
        default: []
    }, 
    karma: {
        type: Number,
        default: 0
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;
