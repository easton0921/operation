const Model = require("../models/index")
const Mongoose = require("mongoose")


async function createroom(req, res) {
    try {

        let blockData = await Model.block.findOne({
            $or: [{ userId: req.user._id, blockId: req.body.receiverId ,isBlocked:true},
            { userId: req.body.receiverId, blockId: req.user._id ,isBlocked:true}]
        });
        if (blockData) { return res.json("you have blocked") }

        let room = await Model.room.findOne({
            $or: [{ senderId: req.user._id, receiverId: req.body.receiverId },
            { senderId: req.body.receiverId, receiverId: req.user._id }],
            isDeleted: false
        })
        if (room) { return res.status(200).json({ message: "room found", data: room }) }
        const roomId = req.body._id
        room = new Model.room({
            _id: roomId,
            senderId: req.user._id,
            receiverId: req.body.receiverId
        })
        await room.save()
        return res.status(201).json({
            message: "New room created",
            data: room
        });
    }
    catch (error) {

        console.error("Error in matchroom:", error);
        return res.status(500).json({
            message: "Internal server error",

        });
    }

}

async function roomlisting(req, res) {

    let userId = req.user._id
    console.log('userId : ', userId);
    try {

        // lookup at chatmessage

        const user = await Model.room.aggregate([
            {
                $match: {
                    isDeleted: false,
                    $or: [
                        { receiverId: userId },
                        { senderId: userId }
                    ]
                }
            },

            {
                $lookup: {
                    from: "chatmessages",
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$connectionId", "$$id"]

                                }
                            }
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $limit: 1
                        },
                        // {
                        //     $lookup: {
                        //         from: "userdatas",
                        //         let: { senderId: "$senderId" },
                        //         pipeline: [
                        //             {
                        //                 $match: {
                        //                     $expr: {

                        //                         $eq: ["$_id", "$$senderId"]
                        //                     }
                        //                 }
                        //             },
                        //             {
                        //                 $project: {
                        //                     email: 1,
                        //                     userName: 1
                        //                 }
                        //             }
                        //         ],
                        //         as: "messageSenderDetails"
                        //     }
                        // }

                    ],


                    as: "chatDetails"
                }
            },


            // {
            //     $match: {
            //         isDeleted: false,
            //         $or: [
            //             // { receiverId: userId },
            //              { senderId: userId }
            //         ]
            //     }
            // },




            // {
            //     $addFields: {
            //         lastMessage: {
            //             $arrayElemAt: ["$chatDetails", -1]
            //         }
            //     }

            // },
            {
                $project: {
                    senderDetails: 1,
                    receiverDetails: 1,
                    chatDetails: 1
                    // lastMessage: 1
                }
            }

        ])
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: "No messages found for the user" });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error("Error fetching chat messages   :", error);
        res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }



}

module.exports = { createroom, roomlisting }