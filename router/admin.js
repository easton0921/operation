const express = require('express');
const {  adminJwtMiddleware}= require('../middleware/jwt');
const {signinAdmin,
     verifySignin,
     loginProfile,
     update,
     getProfile,
     changePassword,
     forgetPassword,
     resetPassword,
    } = require('../controller/admin')
const router = express.Router();

//admin onboarding
router.post('/signin',signinAdmin)
router.post('/verify',verifySignin)
router.post('/login-profile',loginProfile)
router.get('/get-profile', adminJwtMiddleware,getProfile);
router.put('/update', adminJwtMiddleware,update)
router.put('/change-password',adminJwtMiddleware,changePassword)
router.post('/forget-password',forgetPassword)
router.post('/reset-password',resetPassword)

module.exports = router;

