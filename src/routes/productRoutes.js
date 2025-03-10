const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all pdct o filtrarlos por categoría
router.get("/", productController.getAllProducts);

// Get 1 pdct por ID
router.get("/:id", productController.getProductById);

// Crear pdct (solo vendedores autenticados)
router.post("/", authMiddleware, productController.createProduct);

// Editar pdct (solo vendedores o admins)
router.put("/:id", authMiddleware, productController.updateProduct);

// Eliminar pdct (solo vendedores o admins)
router.delete("/:id", authMiddleware, productController.deleteProduct);

module.exports = router;
