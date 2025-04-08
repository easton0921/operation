const chatService = require("../models/chatmessage")

async function saveChat(data) {
    try {
        let obj = {
            connectionId: data.connectionId,
            senderId: data.senderId,
            message: data.message,
            type: data.type


        }
        const chatMessage = new Model.chatmessage(obj)
        const savedMessage = await chatMessage.save()
        return savedMessage
    } catch (error) {
        console.error("Error saving chat message:", error);
        throw error;
    }

}