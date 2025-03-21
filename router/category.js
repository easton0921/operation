
const path = require('path')
const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const multer = require("multer");

// Multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Category Routes
router.post("/category/create", upload.single("image"), categoryController.createCategory);
router.get('/category',categoryController.getCategory)
router.get('/category/id/:id',categoryController.byIdGetCategory)
router.put("/category/update/:id", upload.single("image"), categoryController.updateCategory);
router.delete("/category/delete/:id", categoryController.deleteCategory);

// Subcategory Routes
router.post("/subcategory/create", categoryController.createSubCategory);
router.get('/subcategory',categoryController.getSubcategoriesWithCategory)
router.get('/subcategory/id/:id',categoryController.byIdGetSubcategory)
router.put("/subcategory/update/:id", categoryController.updateSubCategory);
router.delete("/subcategory/delete/:id", categoryController.deleteSubCategory);

module.exports = router;
