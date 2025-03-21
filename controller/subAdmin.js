const express = require('express');
const User = require('../models/user');
const UserOtp = require('../models/otp');
const otpService = require('../utility/otp');
const bcrypt = require('../utility/password')
const jwt = require('../utility/jwt');
const jti = require('../utility/common')
const constants = require('../utility/constants')
const Mongoose = require('mongoose');
const constant = require('../utility/constants');


const app = express()
app.use(express.json())

//sign in sub_admin
async function signinSubAdmin(req, res) {
  try {
     const { username, phone, countryCode, email, password, role } = req.body;
          let obj = { username: username,role:role};
          let x = await jti.regex(email);//email check @gmail.com
          if (!x) {
            console.log('email check ', x)
            return res.status(400).json({ status: "❌ Eamil is not proper" })
          }
          if (email) {
            if (await User.findOne({ email, emailVerify: true ,isDeleted:false})) {
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
            if (await User.findOne({ phone, countryCode, phoneVerify: true ,isDeleted:false})) {
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
              { new: true }
            );
            if (!db) {
              return res.status(404).json({ status: "User not found" });
            }
            console.log('dbStore:', db);
            let role = db.role
            console.log('db in role for admin is ',role)
            const token = jwt.genToken({ id: db._id, jti: jtiString,role:role });
      
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
            let role = db.role
            const token = jwt.genToken({ id: db._id, jti: jtiString,role:role });
      
            return res.status(200).json({
              status: '✅ Account verified successfully.',
              token: token,
              user: db
            });
          } 
          else {
            return res.status(400).json({ status: "Required data missing" });
          }  } 
  catch (error) {
    console.log('error:', error)
    res.status(500).json({ error: "error" })
  }
};

//get profile
async function getProfile(req, res) {
  try {
    if( req.user.role==="admin"){

    const id = req.user._id
    console.log('id is ', id)
    const jti = id.jti
    console.log('id is', jti)
    const role = req.body.role

    const allDbUser = await User.findOne(id, jti,role)
    console.log('db', allDbUser)
    if (!allDbUser) {
      return res.status(404).json({ status: 'invalid token' })
    } else {
      return res.status(200).json({ status: allDbUser })
    }
  }
  else return res.status(404).json({status:"invalid token"})
  } catch (error) {
    console.log(error)
    res.status(404).json({ status: 'error...' })
  }
};

//login admin
async function loginProfile(req, res) {
    try {
      const { email, password } = req.body
      let obj = {};
      if (email && password) {
        const db = await User.findOne({ email, emailVerify: true,role:constants.role.ADMIN})
        if (!db) {
          return res.status(404).json({ status: 'email not exist' })
        }
  
        let hash = db.password;//get password for db
        const passwordMatch = await bcrypt.checkPassword(password, hash)//match password 
        console.log('password', passwordMatch)
        obj.password = passwordMatch;
        let newJti = await jti.generateRandomString();
        let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
        let token = await jwt.genToken({ id: db._id, jti: newJti,role:db.role})
        console.log('jti', dbSaveJti)
        // console.error('')
        if (passwordMatch === true && db.isDeleted===false) {
          res.status(200).json({ status: 'Logged in successfully.', token: token, jti: newJti ,role:db.role})
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
   
//update admin 
async function update(req, res) {
  try {
    const id = req.user._id
    let updateData = await User.findByIdAndUpdate(id, req.body, { new: true });
    const jti = req.user.jti
    console.log('jti', jti)
    res.status(200).json({ id, status: updateData, jti: jti })

  } catch (error) {
    console.log('error', error);
    res.status(500).json({ status: 'error' })
  }
};

//admin logout
async function logout(req, res) {
  try {
    const id = req.user._id;
    const jtiDel = req.user.jti;
    console.log('blank', jtiDel)
    let db = await User.findByIdAndUpdate(id, { jti: '' }, { new: true })
    res.status(200).json({ status: 'User logout success' })
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ status: 'error' })
  }
};

// -------------------------------------------------crud admin by yser----------------------------------------------
async function adminCreateUser(req,res){
  try {
    const { username, phone, countryCode, email, password,} = req.body;
    const obj = {username:username};
    if(email){
    const check = await User.findOne({email:email,emailVerify:true})
    if(check){
      console.log('check',check)
        return res.status(404).json({status:"email allready exist"})
    }
    let pass = await bcrypt.hashPassword(password)
    obj.email = email;
    obj.password = pass;
    obj.emailVerify = true;
    if(phone && countryCode){
        if (await User.findOne({ phone, countryCode, phoneVerify: true })) {
          return res.status(400).json({ status: "phone number already exist" })
        }
        
        let checkDataExist = await User.find({ phone, countryCode, phoneVerify: false }).deleteMany()
        
        let hash = await bcrypt.hashPassword(password)
        console.log('hash', hash)
        obj.phone = phone
        obj.countryCode = countryCode
        obj.password = hash
        obj.phoneVerify = true;
      }
  }
  else return res.status(404).json({status:"email or phone number required"})
  obj.role = constant.role.USER;
    const create = await User.create(obj)
    console.log('create admin by user', create);
    res.status(200).json({status:"Account created successfully.",user:create,})

  } catch (error) {
    console.log("error ha bhai admin user function ma ",error);
    res.status(500).json({status:"error"})
  }
};

//user update
async function userUpdate(req,res){
   try {
    const body = req.body;//request of body
    const user = await User.findByIdAndUpdate(req.params.id,
      { $set: {
        username:body.username,
        age:body.age,
        gender:body.gender
        }
    },{new:true}
    );
    return res.status(200).json({status:"Success",User:user})
   } catch (error) {
    console.log('error ha bhai user update',error)
    res.status(500).json({status:"error"})
   }
};

//get all db
async function userRead(req,res){
  try {

     const user = await User.find({isDeleted:false,role:"user"})
     const count = await User.countDocuments({isDeleted:false,role:"user"});
    return res.status(200).json({status:user,count:count})
  } catch (error) {
    console.log('error ha bhai userRead',error)
  }
};

//find by id
async function findByIdP(req,res){
  try {
    const user =await User.findById(req.params.id)
    if(!user) return res.status(404).json({error:"User not found"})
        return res.status(200).json({status:user})
} catch (error) {
    console.log('error',error)
    res.status(500).json({status:"error"})
  }
};


//user delete
async function userDeleteById(req,res){
  try {
    const del = await User.findByIdAndUpdate(req.params.id,{isDeleted:true},{new:true})
    if(!del)return res.status(404).json({status:"id not match"})
  return res.status(200).json({status:'Account deleted successfully.',delete : del.isDeleted})

  } catch (error) {
    console.log('error',error)
    res.status(500).json({status:"error"})
  }
  
};

//User blocked by admin 
async function userBlocked(req,res){
  try {
    
    const find = await User.findById(req.params.id)
    if(!find){
      return res.status(404).json({status:"invalid id"})
    }
    const userBlock = await User.findByIdAndUpdate(req.params.id,{jti:"",isBlocked:true},{new :true})
    res.status(200).json({status:userBlock._id,isBlocked:userBlock.isBlocked})
    
  } catch (error) {
    console.log('error ha bhai userBlocked function ma',error)
    res.status(500).json({status:"error"})
  }
}



  module.exports = {
    signinAdmin,
    verifySignin,
    loginProfile,
    getProfile,
    update,
    logout,
    adminCreateUser,
    userUpdate,
    userRead,
    findByIdP,
    userDeleteById,
    userBlocked,
  }