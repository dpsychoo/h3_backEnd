const express = require("express");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.json({ mensaje: "API de autenticación funcionando 🚀" });
});

module.exports = router;
