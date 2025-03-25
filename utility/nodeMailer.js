const nodeMailer = require('nodemailer')
require('dotenv').config()

const transporter = nodeMailer.createTransport(
    {
        secure : true,
        host : 'smtp.gmail.com',
        port : 465,
        auth : {
            user : process.env.EMAIL,
            pass : process.env.NODE_MAILLER_PASSWORD
        }
    }
)

function sendMail( to,otp){
    transporter.sendMail({
        to : to,
        Subject : `Signin OTP`,
        html : `your otp code is ${otp}`,
        })
        console.log('email send ')
}

module.exports = {
    sendMail,
}