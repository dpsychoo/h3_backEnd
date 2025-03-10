const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Obtener todas las compras de un usuario
router.get("/:usuario_id", orderController.getUserOrders);

// Crear Nw Buy
router.post("/", orderController.createOrder);

// Act estado de Buy
router.put("/:id", orderController.updateOrderStatus);

module.exports = router;
