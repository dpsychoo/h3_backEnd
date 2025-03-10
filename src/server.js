const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

// Loading variables de entorno
dotenv.config();

// Init app Express
const app = express();

// Confg middleware
app.use(cors());
app.use(express.json());

// Definir rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productRoutes);

// Ruta de prueba para verificar que el servidor está corriendo
app.get("/", (req, res) => {
  res.send("🚀 API de Marketfy funcionando correctamente!");
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

// Configurar puerto y arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
