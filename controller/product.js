const Product = require("../models/product");
const User = require('../controller/user')
//  Create a new product
const createProduct = async (req, res) => {
    try {
      const userId = req.user._id

      const { name, description, price, images, stock, category, subcategory } = req.body;
  
      if (!name || !price || !category || !subcategory) {
        return res.status(400).json({ status: false, message: "Missing required fields" });
      }
  
      const new̥Product = new Product({
        name,
        description,
        price,
        images,
        stock,
        category,
        subcategory,
        createdBy:userId,
      });
  
      await newProduct.save();
      res.status(201).json({ status: true, message: "Product created successfully", product: newProduct });
    } catch (error) {
      console.log('error ha  bhai create Product function ma ',error)
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  };
  
  // Update a product
  const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ status: false, message: "Product not found" });
      }
  
      res.status(200).json({ status: true, message: "Product updated", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  };
  
  // Delete a product
  const deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProduct = await Product.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true } 
      );
  
      if (!deletedProduct) {
        return res.status(404).json({ status: false, message: "Product not found" });
      }
  
      res.status(200).json({ status: true, message: "Product  deleted" });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  };
  

//Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false}).populate("category subcategory createdBy");
    res.status(200).json({ status: true, products });
  } catch (error) {
    console.log('error ha bhai getAll product functuin ma ',error )
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate("category subcategory createdBy");

    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found or has been deleted" });
    }

    res.status(200).json({ status: true, product });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Get products by Category ID
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId, isDeleted: false, }).populate("subcategory createdBy");

    res.status(200).json({ status: true, products });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Get products by Subcategory ID
const getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const products = await Product.find({ subcategory: subcategoryId , isDeleted: false,});

    res.status(200).json({ status: true, products });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};



module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsBySubcategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
