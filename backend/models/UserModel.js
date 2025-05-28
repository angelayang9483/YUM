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
})

const User = mongoose.model("User", userSchema);
module.exports = User;
