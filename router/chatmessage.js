const router = require("express").Router();
const controller = require("../controller/chatmessage")
const Auth = require("../middleware/jwt")


router.get("/chatHistory/:id",Auth.jwtMiddleware,controller.chathistory)
router.get("/chatlist",Auth.jwtMiddleware,controller.chatlist)



module.exports=router