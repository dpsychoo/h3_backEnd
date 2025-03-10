const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Get Perfil del Usuario Autenticado
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
