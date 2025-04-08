const express = require('express')
const morgan = require('morgan')
const path = require('path')
const {connectMongoDb} = require('./mongodb/db')
const http = require("http")
const socket = require("./Services/socket")

const index = require('./router/index')

require('dotenv').config()

const app = express()
const port = process.env.port
const { Server } = require("socket.io");
const server = http.createServer(app)


app.use(morgan('tiny'))
app.use(express.json())

// console.log(os.uptime())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Connect Data Base
connectMongoDb("mongodb://localhost:27017/operation").then(()=>console.log('✅ MongoDb connected')).catch((error)=>console.log('Error on mongoDb connection ',error))


//middleware
app.use(express.raw({extended:false}))

//Router
app.use(index)

//handle for bad request
app.use((req,res,next)=>{
    console.log("👺check router")
    res.status(404).json({status:"bad request"})
})

//listen port
server.listen(port, () => {
    console.log(" server is started at Localhost", port)

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    socket(io);
})






