const nodeMailer = require('nodemailer')
const transporter = nodeMailer.createTransport(
    {
        secure : true,
        host : 'smtp.gmail.com',
        port : 465,
        auth : {
            user : "rishavsingh0921@gmail.com",
            pass : "evanaeormimhpaqq",
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