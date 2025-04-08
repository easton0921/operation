const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({

    senderId: { type: mongoose.Schema.Types.ObjectId,ref:"user" },

    receiverId: { type: mongoose.Schema.Types.ObjectId,ref:"user" },

    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
},{ timestamps: true }
)
module.exports = mongoose.model("room", roomSchema)