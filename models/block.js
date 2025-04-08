const mongoose = require("mongoose");
const blockSchema = new mongoose.Schema({
    description: {
        type: String
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isBlocked: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model("blockData", blockSchema)