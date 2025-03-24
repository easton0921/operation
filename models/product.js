const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        images: [
            {
                type: String,
            },
        ],
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 1,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        isDeleted: {
            type:String,
            default:false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
