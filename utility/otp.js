const express = require('express')
const common = require('./common')
const UserOtp = require('../models/otp')
const nodeMailere=require("../utility/nodeMailer")
express.json()

//EMAIL OTP     
async function otpForEmail(email){
    try {
        const deltedResult = await UserOtp.deleteMany({email})
        console.log("Deleted email otps :",deltedResult)
        let otpIs = common.otpCreate()
        console.log("Generated otp for email:",otpIs)
         console.log("hii-----------pinku ")
        const nodemailers = await nodeMailere.sendMail(email,otpIs)
        console.log("byy")
        return otpIs;
    } catch (error) {
        console.log("Error is email otp generate function",error)
        throw error;
    }
}

//PHONE OTP
async function otpForPhone(phone,countryCode){
    try {
        const deleteResult = await UserOtp.deleteMany({phone,countryCode})
        console.log('Deleted otp for phone',deleteResult)
        let otpIs = common.otpCreate()
        console.log("Generated otp fot phone",otpIs);
        return otpIs
    } catch (error) {
        console.log("Error is phone otp generate function",error)
        throw error;
    }
}

module.exports = {
    otpForEmail,
    otpForPhone,
};