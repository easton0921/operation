const express = require("express");
const { addressMiddleware } = require('../middleware/jwt')
const { roleMiddleware } = require('../middleware/role')
const constants = require('../utility/constants')
const router = express.Router();
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controller/address");

router.post("/",
  addressMiddleware,
  roleMiddleware([1, 2, 4]),
  addAddress);
router.get("/get-address",
  addressMiddleware,
  roleMiddleware([
    constants.role.USER, constants.role.ADMIN, constants.role.MERCHANT]),
  getAddresses);
router.put("/:addressId",
  addressMiddleware,
  roleMiddleware([constants.role.ADMIN, constants.role.MERCHANT]),
  updateAddress);
router.delete("/:addressId",
  addressMiddleware,
  roleMiddleware([constants.role.ADMIN]),
  deleteAddress);
router.patch("/default/:addressId",
  addressMiddleware,
  roleMiddleware([constants.role.ADMIN, constants.role.MERCHANT]),
  setDefaultAddress);

module.exports = router;
