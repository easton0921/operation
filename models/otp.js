const mongoose = require('mongoose')
const otpSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    countryCode: {
        type: String
    },
    otp: {
        type: Number,
        required: true,
    },
}, { timestamps: true })

const Otp = mongoose.model('otp', otpSchema)
module.exports = Otp