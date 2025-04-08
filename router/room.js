const router = require("express").Router();
const controller = require("../controller/room")
const Auth = require("../middleware/jwt")



router.post("/createRoom", Auth.jwtMiddleware, controller.createroom)
router.get("/roomListing", Auth.jwtMiddleware, controller.roomlisting)


module.exports = router