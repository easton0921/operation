const express = require('express');
const User = require('../models/user');
const UserOtp = require('../models/otp');
const otpService = require('../utility/otp');
const bcrypt = require('../utility/password')
const jwt = require('../utility/jwt');
const jti = require('../utility/common')
const constants = require('../utility/constants')



const app = express()
app.use(express.json())

//sign in MERCHANT
async function signinMerchant(req, res) {
  try {
    const { username, phone, countryCode, email, password, role } = req.body;
    if (role === constants.role.MERCHANT) {
      let obj = { username: username, role: role };
      let x = await jti.regex(email);//email check @gmail.com
      if (!x) {
        console.log('email check ', x)
        return res.status(400).json({ status: "❌ Eamil is not proper" })
      }
      if (email) {
        if (await User.findOne({ email, emailVerify: true, isDeleted: false })) {
          return res.status(400).json({ status: "Email Id already in use." })
        }

        let checkDataExist = await User.find({ email, emailVerify: false }).deleteMany()
        let otpEmail = await otpService.otpForEmail(email)
        console.log(otpEmail)
        let pass = await bcrypt.hashPassword(password)
        console.log('hash', pass)
        obj.email = email
        obj.password = pass
        obj.otp = otpEmail
      } else if (phone && countryCode) {
        if (await User.findOne({ phone, countryCode, phoneVerify: true, isDeleted: false })) {
          return res.status(400).json({ status: "phone number already exist" })
        }

        let checkDataExist = await User.find({ phone, countryCode, phoneVerify: false }).deleteMany()
        let phoneOtp = await otpService.otpForPhone(phone, countryCode)
        let hash = await bcrypt.hashPassword(password)
        console.log('hash', hash)
        obj.phone = phone
        obj.countryCode = countryCode
        obj.password = hash
        obj.otp = phoneOtp
      } else {
        res.status(400).json({ status: "required email or phone, countryCode..!" })
      }
      console.log('data in db', obj)

      const dbStore = await User.create(obj)//user store data

      const otpStoredb = await UserOtp.create(obj)//db store data 

      res.status(200).json({ status: "OTP sent successfully.", })
    } else return res.status(404).send({ status: "only merchant role 4 exist" })
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ status: 'error' });
  }
};

//verify check
async function verifySignin(req, res) {
  try {
    const { email, phone, countryCode, otp } = req.body;
    if (email && otp) {
      const emailAndOtp = await UserOtp.findOne({ email, otp });
      console.log('emailAndOtp:', emailAndOtp);
      if (!emailAndOtp) {
        return res.status(404).json({ status: 'Email or OTP not found' });
      }
      await UserOtp.deleteMany({ email });
      let jtiString = await jti.generateRandomString();
      const db = await User.findOneAndUpdate(
        { email: email },
        { $set: { jti: jtiString, emailVerify: true } },
        { new: true });
      if (!db) {
        return res.status(404).json({ status: "User not found" });
      }
      console.log('dbStore:', db);
      const token = jwt.genToken({ id: db._id, jti: jtiString, role: constants.role.MERCHANT });

      return res.status(200).json({
        status: '✅ Account verified successfully.',
        token: token,
        user: db
      });
    }
    else if (phone && countryCode && otp) {
      const phoneAndOtp = await UserOtp.findOne({ phone, countryCode, otp });
      console.log('phoneAndOtp:', phoneAndOtp);

      if (!phoneAndOtp) {
        return res.status(404).json({ status: 'Phone or OTP not found' });
      }

      await UserOtp.deleteMany({ phone, countryCode });

      let jtiString = await jti.generateRandomString();

      const db = await User.findOneAndUpdate(
        { phone: phone, countryCode: countryCode },
        { $set: { jti: jtiString, phoneVerify: true } },
        { new: true }
      );

      if (!db) {
        return res.status(404).json({ status: "User not found" });
      }

      console.log('dbStore:', db);
      const token = jwt.genToken({ id: db._id, jti: jtiString, role: constants.role.MERCHANT });

      return res.status(200).json({
        status: '✅ Account verified successfully.',
        token: token,
        user: db
      });
    }
    else {
      return res.status(400).json({ status: "Required data missing" });
    }
  }
  catch (error) {
    console.log('error:', error)
    res.status(500).json({ error: "error" })
  }
};


//login 
async function loginProfile(req, res) {
  try {
    const { email, password } = req.body
    let obj = {};
    if (email && password) {
      const db = await User.findOne({ email, emailVerify: true, role: constants.role.MERCHANT })
      if (!db) {
        return res.status(404).json({ status: 'email not exist' })
      }

      let hash = db.password;//get password for db
      const passwordMatch = await bcrypt.checkPassword(password, hash)//match password 
      console.log('password', passwordMatch)
      obj.password = passwordMatch;
      let newJti = await jti.generateRandomString();
      let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
      let token = await jwt.genToken({ id: db._id, jti: newJti, role: constants.role.MERCHANT })
      console.log('jti', dbSaveJti)
      // console.error('')
      if (passwordMatch === true && db.isDeleted === false) {
        res.status(200).json({ status: 'Logged in successfully.', token: token, jti: newJti, role: db.role })
      } else if (passwordMatch === false) {
        res.status(200).json({ status: 'Invalid password..' })
      } else {
        res.status(404).json({ status: 'password required..!' })
      }
    }
    else return res.status(404).json({ status: 'Please enter require data..!' });
  }
  catch (err) {
    console.error('error login function ', err)
    res.status(500).json({ status: 'error' })
  }
};

//get profile
async function getProfile(req, res) {
  try {
    if (req.user.role === constants.role.MERCHANT) {

      const id = req.user._id
      console.log('id is ', id)



      const allDbUser = await User.findOne({
        _id: id,

      });

      console.log('db', allDbUser)
      if (!allDbUser) {
        return res.status(404).json({ status: 'unothorized' })
      } else {
        return res.status(200).json({ status: allDbUser })
      }
    }
    else return res.status(404).json({ status: "invalid token" })
  } catch (error) {
    console.log(error)
    res.status(404).json({ status: 'error...' })
  }
};

//update 
async function update(req, res) {
  try {
    const id = req.user._id
    let updateData = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ status: updateData, })

  } catch (error) {
    console.log('error', error);
    res.status(500).json({ status: 'error' })
  }
};

//change password
async function changePassword(req, res) {
  try {
    const { newPassword, email, phone, countryCode } = req.body

    const db = req.user;
    const id = db._id;
    const hash = db.password;
    console.log('id for db', id)

    if (email && req.body.password) {
      const password = req.body.password
      const findId = await User.findOne({ _id: id, email: req.body.email, emailVerify: true })
      if (!findId) {
        return res.status(404).json({ status: 'User not found!' })
      }
      const checkPassword = await bcrypt.checkPassword(password, hash)//password match
      if (!checkPassword) {
        return res.status(404).json({ status: "Wrong password." })
      }
      let password1 = newPassword;
      console.log('new password', password)
      let bcrPass = await bcrypt.hashPassword(password1)
      const newPass = await User.findByIdAndUpdate(id, { password: bcrPass })
      return res.status(200).json({ status: '✅ Password change success' })
    }

    else if (phone && countryCode && req.body.password) {
      const password = req.body.password
      const findId = await User.findOne({ _id: id, phone: req.body.phone, countryCode: req.body.countryCode, phonelVerify: true })
      if (!findId) {
        return res.status(404).json({ status: 'invalid user..!' })
      }
      const checkPassword = await bcrypt.checkPassword(password, hash)//password match
      if (!checkPassword) {
        return res.status(404).json({ status: "Invalid password." })
      }
      let password1 = newPassword;
      console.log('new password', password)
      let bcrPass = await bcrypt.hashPassword(password1)
      const newPass = await User.findByIdAndUpdate(id, { password: bcrPass })
      return res.status(200).json({ status: '✅ Password change success' })
    }
    else {
      return res.status(404).json({ status: 'data required' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: '❌ error' })
  }
};

//forget password
async function forgetPassword(req, res) {
  try {
    const { email, phone, countryCode } = req.body;
    let obj = {}
    if (email) {
      let checkDataExist = await User.findOne({ email, emailVerify: false, }).deleteMany()
      const otpGen = await otpService.otpForEmail(email)
      obj.email = email
      obj.otp = otpGen
      console.log('opt', otpGen)
    }
    else if (phone && countryCode) {
      let checkDataExist = await User.find({ phone, countryCode, phoneVerify: false }).deleteMany()
      const otpGen = await otpService.otpForPhone(phone, countryCode)
      console.log('PHONE', otpGen)
      obj.phone = phone
      obj.countryCode = countryCode
      obj.otp = otpGen
    } else {
      return res.status(400).json({ status: 'Required data...' })
    }
    const otpSve = await UserOtp.create(obj)
    return res.status(200).json({ status: '✅ OTP sent successfully.' })

  } catch (error) {
    console.log('❌ error in forgetPassword function', error)
  }
};

// reset password 
async function resetPassword(req, res) {
  try {
    const { email, phone, countryCode, otp, newPassword } = req.body;
    if (email && otp) {
      const matchOtp = await UserOtp.findOne({ email, otp })
      if (!matchOtp) {
        console.log('❌ wrong otp ', matchOtp)
        res.status(400).json({ status: "❌ wrong otp..!" })
      }
      let data = await User.findOne({ email: email, emailVerify: true, role: constants.role.MERCHANT })
      console.log('data', data)
      let id = data._id;
      console.timeLog("this is the id of change password of db ", id)
      const pass = await bcrypt.hashPassword(newPassword)
      console.log('new hash ', pass)

      const updateHash = await User.findByIdAndUpdate(id, { password: pass }, { new: true })
      console.log("update hash", updateHash);
      const emailAndOtpDelete = await UserOtp.deleteMany({ email })//////////////////////////////////////////
      console.log('newPassword', newPassword)
      res.status(200).json({ status: "✅ password change success" })
    }
    else if (phone && countryCode && otp) {
      const matchOtp = await UserOtp.findOne({ phone, countryCode, otp })
      if (!matchOtp) {
        console.log('❌ wrong otp ', matchOtp)
        res.status(400).json({ status: "❌ wrong otp..!" })
      }
      let data = await User.findOne({ phone: phone, countryCode: countryCode, phoneVerify: true, role: constants.role.MERCHANT })
      console.log('data', data)
      let id = data._id;
      console.timeLog("this is the id of change password of db ", id)
      const pass = await bcrypt.hashPassword(newPassword)
      console.log('new hash ', pass)

      const updateHash = await User.findByIdAndUpdate(id, { password: pass }, { new: true })
      console.log("update hash", updateHash);
      const emailAndOtpDelete = await UserOtp.deleteMany({ phone })//////////////////////////////////////////
      console.log('newPassword', newPassword)
      res.status(200).json({ status: "✅ password change success" })

    }
    else {
      return res.status(400).json({ status: 'Required data...' })
    }
  } catch (error) {
    console.log('❌ error ha bhai resetPassword function me', error)
  }
}




module.exports = {
  signinMerchant,
  verifySignin,
  loginProfile,
  getProfile,
  update,
  changePassword,
  forgetPassword,
  resetPassword,
}
