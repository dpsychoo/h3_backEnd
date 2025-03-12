const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

//Ruta para registrar una compra
router.post("/", orderController.createOrder);

//Ruta para obtener todas las compras (Solo Admin)
router.get("/", orderController.getAllOrders);

//Ruta para obtener compras de un usuario específico
router.get("/:usuario_id", orderController.getUserOrders);

//Ruta para actualizar el estado de una compra
router.put("/:compra_id", orderController.updateOrderStatus);

//Ruta para eliminar una compra (Solo Admin)
router.delete("/:compra_id", orderController.deleteOrder);

module.exports = router;
