const mongoose = require('mongoose')
const bcrypt = require('react-native-bcrypt');
const SALT_WORK_FACTOR = 10;

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
    favoriteMeals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal'
    }],
    favoriteFoodTrucks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodTruck'
    }],
    karma: {
        type: Number,
        default: 0
    },
    likedComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.checkPassword = function(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, function (err, isMatch) {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};


const User = mongoose.model("User", userSchema);
module.exports = User;
