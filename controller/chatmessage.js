const chatmessage = require('../models/chatmessage')
const room = require('../models/room')
const Mongoose = require("mongoose")


async function chathistory(req, res) {
    let roomId = req.params.id
    console.log(roomId)

    try {
        const user = await chatmessage.aggregate([
            {
                $match: {
                    connectionId: new Mongoose.Types.ObjectId(roomId), isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { senderId: "$senderId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$senderId"]

                                }
                            }
                        },
                        {
                            $project: {
                                email: 1,
                                isDeleted: 1,
                                username: 1
                            }

                        }
                    ],
                    as: "senderDetails"
                }
            },
            { $unwind: "$senderDetails" },
            {
                $lookup: {
                    from: "users",
                    let: { receiverId: "$receiverId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$receiverId"]

                                }
                            }
                        },
                        {
                            $project: {
                                email: 1,
                                isDeleted: 1,
                                username: 1
                            }

                        }
                    ],
                    as: "receiverDetails"
                }
            },
            { $unwind: "$receiverDetails" },
            {
                $project: {
                    _id: 1,
                    connectionId: 1,
                    senderId: 1,
                    receiverId: 1,
                    message: 1,
                    type: 1,
                    senderDetails: 1,
                    receiverDetails: 1,
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: "No messages found for the user" });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }
}

async function chatlist(req, res) {
    const userId = new Mongoose.Types.ObjectId(req.user._id)
    console.log('userId: ', userId);
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let pipeline = [];
    pipeline.push(
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
                let: { connectionId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$connectionId", "$$connectionId"]

                            }

                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            sentByMe: {
                                $cond: {
                                    if: { $eq: ["$senderId", userId] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            message: 1,
                            senderId: 1,
                            receiverId: 1,
                            createdAt: 1,
                            type: 1,
                            sentByMe: 1,

                        }
                    },
                ],
                as: "lastMessage"
            }
        },
        {
            $unwind: { path: "$lastMessage" }
        },
        {
            $addFields: {
                userId: {
                    $cond: {
                        if: {
                            $eq: ["$lastMessage.senderId", userId]
                        },
                        then: "$lastMessage.receiverId",
                        else: "$lastMessage.senderId"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "blockdatas",
                let: { senderId: "$senderId", receiverId: "$receiverId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [{
                                    $and: [{ $eq: ["$$senderId", "$userId"] },
                                    { $eq: ["$$receiverId", "$blockId"] },
                                    ]
                                },
                                {
                                    $and: [
                                        { $eq: ["$$receiverId", "$userId"] },
                                        { $eq: ["$$senderId", "$blockId"] },
                                    ]
                                },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            isBlocked: 1
                        }
                    }
                ],

                as: "blockDetails"
            }
        },
        {
            $unwind: { path: "$blockDetails", preserveNullAndEmptyArrays: true }
        },

        {
            $lookup: {
                from: "users",
                let: { userId: "$userId" },
                pipeline: [{
                    $match: {
                        $expr: { $eq: ["$_id", "$$userId"] }, isDeleted: false, isBlocked: false,
                        ...(searchTerm && { userName: { $regex: searchTerm, $options: "i" } })
                    }
                },
                {
                    $project: {
                        email: 1,
                        userName: 1
                    }
                }],
                as: "user"
            }
        },
        {
            $unwind: { path: "$user", }
        },
        {
            $project: {
                _id: 1,
                lastMessage: 1,
                user: 1,
                blockDetails: 1
            }
        },
        { $skip: skip },
        { $limit: limit },





    )
    let chatlist = await room.aggregate(pipeline);
    res.json(chatlist)
}



module.exports = { chathistory, chatlist }                             