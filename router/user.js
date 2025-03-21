const express = require('express')
const { jwtMiddleware } = require('../middleware/jwt')
const { userSignup,
    userOtpVerify,
    loginProfile,
    getUser,
    updateProfile,
    changePassword,
    forgetPassword,
    resetPassword,
    timingController,
} = require('../controller/user')
const router = express.Router()

router.post('/signup', userSignup);
router.post('/otp-verify', userOtpVerify)
router.post('/login', loginProfile)
router.get('/profile', jwtMiddleware, getUser)
router.put('/update', jwtMiddleware, updateProfile)
router.put('/change-password', jwtMiddleware, changePassword)
router.post('/forget-password', forgetPassword)
router.post('/reset-password', resetPassword)



router.get('/timing',timingController)

module.exports = router
