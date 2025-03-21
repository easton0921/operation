const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const path = require("path");
const fs = require("fs");

//  Create Category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new Category({ name, image });
    await newCategory.save();

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (image && category.image) {
      const oldImagePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    category.name = name || category.name;
    category.image = image || category.image;

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Delete Category 
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (category.image) {
      const imagePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await SubCategory.deleteMany({ category: id });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Category and its subcategories deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
   
//===================================================================================================================


//  Create Subcategory
const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const existingSubCategory = await SubCategory.findOne({ name, category: categoryId });
    if (existingSubCategory) {
      return res.status(400).json({ success: false, message: "Subcategory already exists" });
    }

    const newSubCategory = new SubCategory({ name, category: categoryId });
    await newSubCategory.save();

    res.status(201).json({ success: true, data: newSubCategory });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Update Subcategory
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ success: false, message: "New category not found" });
      }
      subCategory.category = categoryId;
    }

    subCategory.name = name || subCategory.name;

    await subCategory.save();
    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//  Delete Subcategory
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    await SubCategory.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Subcategory deleted" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
