const Address = require("../models/address");

//Add a new address
async function addAddress(req,res){
  try {
    const userId = req.user._id
    console.log('user id by token',userId)
    const { street, city, state, postalCode, country, isDefault } = req.body;
    if ( !userId || !street || !city || !state || !postalCode || !country) {
      return res.status(400).json({ status: " All fields are required." });
    }
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }
    const newAddress = new Address({ userId, street, city, state, postalCode, country, isDefault });
    await newAddress.save();
    return res.status(201).json({ status: " Address added successfully.", address: newAddress });
  } catch (error) {
    res.status(500).json({ status: "Internal server error." });
  }
};

//Get all addresses for a user
async function getAddresses(req, res){
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ status: " User ID is required." });
    }

    const addresses = await Address.aggregate([
      { $match: { userId } }, 
      { $sort: { isDefault: -1, createdAt: -1 } }, 
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          street: 1,
          city: 1,
          state: 1,
          postalCode: 1,
          isDefault: 1,
          createdAt: 1,
          userDetails: {
            _id: 1,
            username: 1,
            email: 1,
            role: 1,
          },
        },
      },
    ]);

    return res.status(200).json({ status: " Addresses recover successfully.", addresses });
  } catch (error) {
    console.error(" Error in getAddresses:", error);
    return res.status(500).json({ status: " Internal server error." });
  }
};


//Update an address
async function updateAddress(req,res){
  try {
    const { addressId } = req.params;
    const userId = req.user._id;
    const { street, city, state, postalCode, country, isDefault } = req.body;
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ status: " Address not found." });
    }
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { street, city, state, postalCode, country, isDefault },
      { new: true }
    );

    return res.status(200).json({ status: " Address updated successfully.", address: updatedAddress });
  } catch (error) {
    console.error(" Error in updateAddress:", error);
    res.status(500).json({ status: " Internal server error." });
  }
};

//Delete an address
async function deleteAddress(req,res){
  try {
    const { addressId } = req.params;
    const userId = req.user._id;
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ status: " Address not found." });
    }
    return res.status(200).json({ status: "Address deleted successfully." });
  } catch (error) {
    console.error(" Error in deleteAddress:", error);
    res.status(500).json({ status: " Internal server error." });
  }
};

//Set an address as default
async function setDefaultAddress(req,res){
  try {
    const { addressId } = req.params;
    const userId = req.user._id
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ status: " Address not found." });
    }
    await Address.updateMany({ userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    return res.status(200).json({ status: " Default address updated successfully.", address });
  } catch (error) {
    console.error(" Error in setDefaultAddress:", error);
    res.status(500).json({ status: " Internal server error." });
  }
};


module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}