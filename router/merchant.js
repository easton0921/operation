const express = require('express');
const { merchantJwtMiddleware } = require('../middleware/jwt');

const { signinMerchant,verifySignin,loginProfile,getProfile,update,changePassword,forgetPassword,resetPassword,
} = require('../controller/merchant')
const router = express.Router();

//admin onboarding
router.post('/signin', signinMerchant)
router.post('/verify', verifySignin)
router.post('/login-profile', loginProfile)
router.get('/get-profile', merchantJwtMiddleware, getProfile);
router.put('/update', merchantJwtMiddleware, update)
router.put('/change-password', merchantJwtMiddleware, changePassword)
router.post('/forget-password', forgetPassword)
router.post('/reset-password', resetPassword)

module.exports = router;

