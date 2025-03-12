const express = require("express");
const compraController = require("../controllers/compraController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//Registrar una compra (cliente autenticado)
router.post("/", authMiddleware, compraController.createCompra);

//Obtener buy del user autenticado
router.get("/", authMiddleware, compraController.getComprasUsuario);

//Obtener buy de un vendedor
router.get("/vendedor", authMiddleware, compraController.getComprasVendedor);

//Actualizar estado de compra (solo vendedor o admin)
router.put("/:id", authMiddleware, compraController.updateEstadoCompra);

//Deletear buy (solo admin)
router.delete("/:id", authMiddleware, compraController.deleteCompra);

module.exports = router;
