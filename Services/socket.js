const Auth = require("../middleware/jwt")
const Model = require("../models/index")

module. exports = io => {
    io.use(async (socket, next) => {
        let token = socket.handshake.query.token
        console.log('token: ', token);
        let userId = await Auth.verifySocketToken(token, socket)
        console.log('userId: ', userId);
          console.log(socket.user)
        next();
    })
        .on('connection', (socket) => {
             console.log("A User Connnected",socket.user)
            socket.join(socket.user._id)
            socket.on('connectToChat', async (data) => {
            
                let roomId = data.roomId
                let blockData = await Model.block.findOne({
                    $or: [
                        { userId: socket.user._id, blockId: roomId },
                        { userId: roomId, blockId: socket.user._id }
                    ]
                });
            
                if (blockData) {
                    io.to(socket.user._id).emit("error", { message: "you have blocked " })
                    return
                }

                let roomUser = await Model.room.findOne({ _id: roomId })
                
                if (!roomUser) {
                    io.to(socket.user._id).emit("error", { message: "invalid roomId" })
                    return
                }
                let existingRoomUser = await Model.room.findOne({
                    _id: roomId,
                    $or: [
                        { senderId: socket.user._id }, { receiverId: socket.user._id }
                    ]
                })
                
                if (!existingRoomUser) {
                    io.to(socket.user._id).emit("error", { message: "invalid sender" })
                    return
                }
                // console.log(data)
                socket.join(data.roomId)
                console.log(`User ${socket.id} joined room ${data} `);
                io.to(data.roomId).emit("connected_to _chat", { sender: data })
            });
            socket.on('sendMessage', async (data) => {
                // console.log(socket.user)
                // console.log(data);


                let blockData = await Model.block.findOne({
                    $or: [
                        { userId: socket.user._id, blockId: data.receiverId },
                        { userId: data.receiverId, blockId: socket.user._id }
                    ]
                });
                if (blockData) {
                    io.to(socket.user._id).emit("error", { message: "you have blocked " })
                    return
                }



                let checkRoomUser = await Model.room.findOne({
                    $or: [
                        {
                            senderId: socket.user._id, receiverId: data.receiverId
                        },
                        {
                            senderId: data.receiverId, receiverId: socket.user._id
                        }
                    ]
                })
                // console.log(checkRoomUser)
                if (!checkRoomUser) {
                    io.to(socket.user._id).emit("error", { message: "Room not found or invalid sender/receiver" });
                    return;
                }
                console.log(checkRoomUser._id)
                let obj = {

                    connectionId: checkRoomUser._id,
                    senderId: socket.user._id,
                    message: data.msg,
                    receiverId: data.receiverId
                }

                let newData = new Model.chatmessage(obj)
                let result = await newData.save()
                console.log(" message received ", data.msg)
                io.to(data.roomId).emit("received_msg", { sender: data.msg })
            });
            socket.on("disconnectToChat", (data) => {
                socket.leave(data.roomId)
                io.to(socket.user._id).emit("disconnectChat", { message: "disconnect the chat" })
            })
        })


}