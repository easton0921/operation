const mongoose = require("mongoose");
const chatmessageSchema = new mongoose.Schema({

    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: "room" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    message: {
        type: String
    },
    type: {
        type: String,
        enum: ["IMAGE", "TEXT", "VIDEO", "AUDIO"],
        default: "TEXT"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },

},
    {
        timestamps: true
    })
module.exports = mongoose.model("chatmessage", chatmessageSchema)