const express = require("express");
const router = express.Router();
const productController = require("../controller/product");

// Routes for product operations
router.post("/", productController.createProduct);
router.put("/update/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

router.get("/", productController.getAllProducts);
router.get("/single/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/subcategory/:subcategoryId", productController.getProductsBySubcategory);


module.exports = router;
