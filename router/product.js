const express = require("express");
const router = express.Router();
const {jwtMiddleware} = require('../middleware/jwt')
const productController = require("../controller/product");

// Routes for product operations
router.post("/", jwtMiddleware,productController.createProduct);
router.put("/update/:id",jwtMiddleware, productController.updateProduct);
router.delete("/delete/:id",jwtMiddleware, productController.deleteProduct);

router.get("/", productController.getAllProducts);
router.get("/single/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/subcategory/:subcategoryId", productController.getProductsBySubcategory);


module.exports = router;
