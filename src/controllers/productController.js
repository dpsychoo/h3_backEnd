const pool = require("../config/database");

const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Get 1 pdct por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//Crear un nuevo producto (solo vendedores)
const createProduct = async (req, res) => {
  try {
    const { titulo, descripcion, precio, imagen, categoria } = req.body;
    const usuario_id = req.user.id; // ID del vendedor autenticado

    if (!titulo || !descripcion || !precio || !imagen || !categoria) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const result = await pool.query(
      "INSERT INTO productos (titulo, descripcion, precio, imagen, categoria, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [titulo, descripcion, precio, imagen, categoria, usuario_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//Act un producto (solo el vendedor o admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagen, categoria } = req.body;
    const usuario_id = req.user.id; // ID del usuario autenticado

    const product = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar si es el dueño del producto o admin
    if (product.rows[0].usuario_id !== usuario_id && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para modificar este producto" });
    }

    const result = await pool.query(
      "UPDATE productos SET titulo = $1, descripcion = $2, precio = $3, imagen = $4, categoria = $5 WHERE id = $6 RETURNING *",
      [titulo, descripcion, precio, imagen, categoria, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//Deletear un producto (solo el vendedor o admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id; // ID del usuario autenticado

    const product = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    //Verificar si es el dueño del producto o admin
    if (product.rows[0].usuario_id !== usuario_id && req.user.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para eliminar este producto" });
    }

    await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
