const mongoose = require('mongoose')
const constant = require('../utility/constants')
const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        unique: true,
    },
    countryCode: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
    },
    password: {
        type: String
    },
    emailVerify: {
        type: String,
        default: false,
    },
    phoneVerify: {
        type: String,
        default: false,
    },
    gender: {
        type: String,
        enum: Object.values(constant.gender)
    },
    jti: {
        type: String,
    },
    age: {
        type: String,
    },
    role: {
        type: Number,
        enum: Object.values(constant.role)
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })


const User = mongoose.model('user', userSchema)
module.exports = User