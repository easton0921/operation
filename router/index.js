const express = require('express');
const userRouter = require("../router/user")
const adminRouter = require("../router/admin")
const merchantRouter = require("../router/merchant")
const addressRouter = require("../router/address")
const categoryRouter = require("../router/category")
const productRouter = require("../router/product")
const blockRouter = require("../router/block")
const roomRouter = require("../router/room")
const chatRouter = require("../router/chatmessage")
const app = express()

//Router call
app.use('/api/user',userRouter)//user router 
app.use('/api/admin',adminRouter)//admin router 
app.use('/api/merchant',merchantRouter)//merchant router 
app.use('/api/address',addressRouter)//address router 
app.use('/api',categoryRouter)//category and subCategory router 
app.use('/api/product',productRouter)//product router 
app.use('/api/block',blockRouter)//block router
app.use('/api/room',roomRouter)//room router
app.use('/api/chat',chatRouter)//chatMessage router

module.exports = app;