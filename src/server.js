const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/compras", orderRoutes); 

app.get("/", (req, res) => {
  res.send("🚀 API de Marketfy funcionando correctamente!");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") { 
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
