// const Category = require("../models/category");
// const path = require("path");
// const fs = require("fs");

// const createCategory = async (req, res) => {
//   try {
//     console.log('ffg',req.body)
//     const { name } = req.body;
//     const image = req.body.image 

//     const existingCategory = await Category.findOne({ name });
//     if (existingCategory) {
//       return res.status(400).json({ success: false, message: "Category already exists" });
//     }

//     const newCategory = new Category({ name, image });
//     await newCategory.save();

//     res.status(201).json({ success: true, data: newCategory });
//   } catch (error) {
//     console.error("Error creating category:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// // Function to update category including image
// const updateCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;
//     const image = req.body.image 

//     const category = await Category.findById(id);
//     if (!category) {
//       return res.status(404).json({ success: false, message: "Category not found" });
//     }

//     if (image && category.image) {
//       fs.unlinkSync(category.image); // Delete old image
//     }

//     category.name = name || category.name;
//     category.image = image || category.image;

//     await category.save();
//     res.status(200).json({ success: true, data: category });
//   } catch (error) {
//     console.error("Error updating category:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// // Function to delete a category and its image
// const deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const category = await Category.findById(id);

//     if (!category) {
//       return res.status(404).json({ success: false, message: "Category not found" });
//     }

//     if (category.image) {
//       fs.unlinkSync(category.image); 
//     }

//     await Category.findByIdAndDelete(id);
//     res.status(200).json({ success: true, message: "Category deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting category:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


// // multer
//  async function multer(req, res) {
//   if (!req.file) {
//       return res.status(400).json({ success: false, message: "Please upload an image" });
//   }

//   res.json({
//       success: true,
//       message: "File uploaded successfully",
//       filePath: `/uploads/${req.file.filename}`,
//   });
// };

// module.exports = {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   multer,
// };



const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const path = require("path");
const fs = require("fs");

//  Create Category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if category already exists
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

    // Delete old image if new one is uploaded
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

    // Delete image file if exists
    if (category.image) {
      const imagePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete all subcategories linked to this category
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

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if subcategory already exists under the same category
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
