const Model = require('../models/index')
const Mongoose = require("mongoose")


async function block(req, res) {

    const userId = new Mongoose.Types.ObjectId(req.user._id)
     console.log(req.user._id)
    const blockId = new Mongoose.Types.ObjectId(req.body.blockId)
    console.log('blockId: ', blockId);
    try {
        if (!blockId) {
            return res.status(400).json({
                success: false,
                message: "Block ID is required.",
            });
        }
        if (userId.equals(blockId)) { return res.status(400).json({ success: false, message: "You cannot block yourself.", }); }

        let existingBlock = await Model.block.findOne({ userId: blockId, blockId: userId, isBlocked: true })

        if (existingBlock) { return res.json("you have blocked by user, you can't  block this user") }

        let unBlock = await Model.block.findOneAndUpdate(
            { userId: userId, blockId: blockId, isBlocked: true },
            { $set: { isBlocked: false } },
            { new: true } 
          );

        if (unBlock) { return res.status(200).json({ success: false, message: "User is unblocked.", data: unBlock }); }

        let obj = { userId: userId, blockId: blockId, isBlocked: true }
    
        let data = new Model.block(obj)
        let result = await data.save()
        res.status(201).json({ message: "you have blocked", data: result, });
    }
    catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while blocking the user.",
            error: error.message,
        });
    }

}

module.exports = { block }