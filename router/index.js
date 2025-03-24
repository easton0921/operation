const express = require('express');
const userRouter = require("../router/user")
const adminRouter = require("../router/admin")
const merchantRouter = require("../router/merchant")
const addressRouter = require("../router/address")
const categoryRouter = require("../router/category")
const productRouter = require("../router/product")

const app = express()

//Router call
app.use('/api/user',userRouter)//user router 
app.use('/api/admin',adminRouter)//admin router 
app.use('/api/merchant',merchantRouter)//merchant router 
app.use('/api/address',addressRouter)//address router 
app.use('/api',categoryRouter)//category and subCategory router 
app.use('/api/product',productRouter)//product router 

module.exports = app;