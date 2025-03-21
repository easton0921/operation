const express = require('express')
const User = require('../models/user')
const UserOtp = require('../models/otp')
const otpService = require('../utility/otp')
const bcrypt = require('../utility/password')
const jwt = require('../utility/jwt')
const jti = require('../utility/common')
const constants = require('../utility/constants')
const moment = require('moment')

const app = express()
app.use(express.json())

//SIGNUP
async function userSignup(req, res) {
  try {
    const { username, phone, countryCode, email, password, role } = req.body;
    if (role === constants.role.USER) {
      let obj = { username: username, role: constants.role.USER };
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

    } else return res.status(404).send({ status: "only user role 1 exist" })
  } catch (err) {
    console.log('❌ Error:', err);
    res.status(500).json({ status: 'error' });
  }
};

//OTP VERIFY 
async function userOtpVerify(req, res) {
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
        { new: true }
      );
      if (!db) {
        return res.status(404).json({ status: "User not found" });
      }
      console.log('dbStore:', db);
      // let role = db.role

      const token = jwt.genToken({ id: db._id, jti: jtiString, role: constants.role.USER });

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
      // let role = db.role

      const token = jwt.genToken({ id: db._id, jti: jtiString, role: constants.role.USER });

      return res.status(200).json({
        status: '✅ Account verified successfully.',
        token: token,
        user: db
      });
    }
    else {
      return res.status(400).json({ status: "Required data missing" });
    }

  } catch (error) {
    console.log('Error:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


//logion-Profile
async function loginProfile(req, res) {
  try {
    const { email, phone, countryCode, password } = req.body
    let obj = {};
    if (email && password) {
      const db = await User.findOne({ email, emailVerify: true, isDeleted: false, role: constants.role.USER, })
      if (!db) {
        console.log('data', db)
        return res.status(404).json({ status: 'Email Id is missing.' })
      }

      let hash = db.password;//get password for db
      const passwordMatch = await bcrypt.checkPassword(password, hash)//match password
      console.log('password', passwordMatch)
      obj.password = passwordMatch;
      let newJti = await jti.generateRandomString();
      let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
      let token = await jwt.genToken({ id: db._id, jti: newJti, role: constants.role.USER })
      console.log('jti', dbSaveJti)

      if (passwordMatch === true && db.isDeleted === false) {
        res.status(200).json({ status: '✅ Logged in successfully.', token: token, jti: newJti, role: constants.role.USER })
      } else if (passwordMatch === false) {
        res.status(200).json({ status: ' Invalid password..' })
      }
      else if (db.isDeleted === true) {
        res.status(200).json({ status: '❌ Invalid Account' })
      } else {
        res.status(404).json({ status: ' password required..!' })
      }
    }
    else if (phone && countryCode && password) {
      const db = await User.findOne({ phone, countryCode, phoneVerify: true, isDeleted: false })
      if (!db) {
        return res.status(404).json({ status: 'Phone number and CountryCode is missing.' })
      }
      let hash = db.password;
      const passwordMatch = await bcrypt.checkPassword(password, hash)
      console.log('password', passwordMatch)
      console.log("hash", hash)
      obj.password = passwordMatch;
      const newJti = await jti.generateRandomString()//========jti=====
      console.log(newJti);
      let token = await jwt.genToken({ id: db._id, jti: newJti, role: constants.role.USER })//============token==

      let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
      console.log('dbjti', dbSaveJti)
      if (passwordMatch === true && db.isDeleted === false) {
        res.status(200).json({ status: '✅ Login Success', token: token, jti: newJti })
      }
      else if (db.isBlocked === true) {
        res.status(200).json({ status: '❌ blocked user not login' })
      } else if (passwordMatch === false) {
        res.status(200).json({ status: '❌ Invalid password..' })
      }
      else if (db.isDeleted === true) {
        res.status(200).json({ status: '❌ Invalid Account' })
      } else {
        res.status(404).json({ status: '❌ password required..!' })
      }
    }
    else return res.status(404).json({ status: 'Email Id is missing.' });
  }
  catch (err) {
    console.error('❌ error login function ', err)
    res.status(500).json({ status: 'error' })
  }
};

//Get profile
async function getUser(req, res) {
  try {
    const id = req.user._id
    console.log('id is .', id)
    const jti = req.user.jti
    console.log('id is', jti)

    const allDbUser = await User.findOne({ _id: req.user._id, jti: req.user.jti, role: req.user.role })
    console.log('db', allDbUser)
    if (!allDbUser || !allDbUser.jti) {
      return res.status(404).json({ status: 'invalid token' })
    } else {
      return res.status(200).json({ status: allDbUser })
    }
  } catch (error) {
    console.log("❌", error)
    res.status(404).json({ status: 'error...' })
  }
};


// get token and update
async function updateProfile(req, res) {
  const id = req.user._id
  console.log('id', id)
  const body = req.body;//request of body
  const user = await User.findByIdAndUpdate(id, {
    username: body.username,
    gender: body.gender,
    age: body.age,
  }, { new: true }
  );
  return res.json({ status: "Success", User: user })
}

//User change ppassword
async function changePassword(req, res) {
  try {
    const { newPassword, email, phone, countryCode } = req.body

    const obj = {};
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
      let checkDataExist = await User.findOne({ email, emailVerify: false }).deleteMany()
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

//reset password 
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const matchOtp = await UserOtp.findOne({ email, otp })
    if (!matchOtp) {
      console.log('❌ wrong otp ', matchOtp)
      res.status(400).json({ status: "❌ wrong otp..!" })
    }
    let data = await User.findOne({ email: email, emailVerify: true })
    console.log('data', data)
    let id = data._id;
    console.timeLog("this is the id of change password of db ", id)
    const pass = await bcrypt.hashPassword(newPassword)
    console.log('new hash ', pass)

    const updateHash = await User.findByIdAndUpdate(id, { $set: { password: pass } })
    console.log("update hash", updateHash);
    const emailAndOtpDelete = await UserOtp.deleteMany({ email })//////////////////////////////////////////
    console.log('newPassword', newPassword)
    return res.status(200).json({ status: "✅ password change success" })

  } catch (error) {
    console.log('❌ error ha bhai resetPassword function me', error)
  }
}

//============================================timing===========================================================

async function timingController(req, res) {
  try {
    let sumField = null;
    const now = moment();
    const type = req.query.type;
    const userData = {};

    let startDate, endDate, format, prevStartDate, prevEndDate;

    switch (type) {
      case "today":
        startDate = now.startOf("day").toDate();
        endDate = now.endOf("day").toDate();
        console.log('endDate',endDate)
        format = "%Y-%m-%d";
        break;
      case "daily":
        startDate = moment().subtract(6, "days").startOf("day").toDate();
        endDate = now.endOf("day").toDate();
        console.log('endDate',endDate)
        format = "%Y-%m-%d";
        break;
      case "weekly":
        startDate = now.startOf("week").toDate();
        endDate = now.endOf("week").toDate();
        console.log('endDate',endDate)
        format = "%Y-%m-%d";
        break;
      case "monthly":
        startDate = now.startOf("month").toDate();
        endDate = now.endOf("month").toDate();
        console.log('endDate',endDate)
        format = "%Y-%m";
        break;
      case "yearly":
        startDate = now.startOf("year").toDate();
        endDate = now.endOf("year").toDate();
        console.log('endDate',endDate)
        prevStartDate = moment().subtract(1, "year").startOf("year").toDate();
        prevEndDate = moment().subtract(1, "year").endOf("year").toDate();
        console.log('endDate',prevEndDate)
        format = "%Y";
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid type" });
    }

    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          count: sumField ? { $sum: `$${sumField}` } : { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const userCounts = await User.aggregate(pipeline);

    if (type === "yearly") {
      const prevPipeline = [
        { $match: { createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
        {
          $group: {
            _id: { $dateToString: { format: format, date: "$createdAt" } },
            count: sumField ? { $sum: `$${sumField}` } : { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ];

      const prevUserCounts = await User.aggregate(prevPipeline);

      userCounts.forEach(({ _id, count }) => {
        userData[_id] = { name: _id, currentYear: count, previousYear: 0 };
      });

      prevUserCounts.forEach(({ _id, count }) => {
        if (userData[_id]) {
          userData[_id].previousYear = count;
        } else {
          userData[_id] = { name: _id, currentYear: 0, previousYear: count };
        }
      });
    } else if (type === "weekly") {
      const totalWeeks = Math.ceil(moment(endDate).date() / 7);
      for (let i = 1; i <= totalWeeks; i++) {
        userData[i] = { name: `Week ${i}`, count: 0 };
      }
      userCounts.forEach(({ _id, count }) => {
        const weekNum = Math.ceil(moment(_id).date() / 7);
        if (userData[weekNum]) {
          userData[weekNum].count += count;
        }
      });
    } else if (type === "daily") {
      startDate = moment().startOf("week"); 
      endDate = moment().endOf("week"); 
  
      for (let i = 0; i < 7; i++) {
          const date = startDate.clone().add(i, "days");
          const formattedDate = date.format("YYYY-MM-DD");
          userData[formattedDate] = {
              name: date.format("dddd"), 
              count: 0,
          };
      }
      userCounts.forEach(({ _id, count }) => {
          if (userData[_id]) {
              userData[_id].count = count;
          }
      });
  } else {
      userCounts.forEach(({ _id, count }) => {
        userData[_id] = { name: _id, count };
      });
    }

    res.status(200).json({ success: true, data: Object.values(userData) });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}








module.exports = {
  userSignup,
  userOtpVerify,
  loginProfile,
  getUser,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
  timingController,
}