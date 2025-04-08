const router = require("express").Router();
const controller = require("../controller/block")
const Auth = require("../middleware/jwt")


router.post("/blockedId", Auth.jwtMiddleware,controller.block)



module.exports=router