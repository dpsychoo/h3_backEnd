const pool = require("../config/database");

const productController = {
  
  async getAllProducts(req, res) {
    try {
      const { categoria } = req.query;

      let query = "SELECT * FROM productos";
      let values = [];

      if (categoria) {
        query += " WHERE categoria = $1";
        values.push(categoria);
      }

      const { rows } = await pool.query(query, values);
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // Get P por ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const { rows } = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // Crear un producto (Solo vendedores)
  async createProduct(req, res) {
    try {
      const { titulo, descripcion, precio, imagen, categoria } = req.body;
      const usuario_id = req.user.id;
      const rol = req.user.rol;

      if (rol !== "vendedor") {
        return res.status(403).json({ message: "Solo los vendedores pueden agregar productos." });
      }

      const { rows } = await pool.query(
        "INSERT INTO productos (titulo, descripcion, precio, imagen, categoria, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [titulo, descripcion, precio, imagen, categoria, usuario_id]
      );

      res.status(201).json({ message: "Producto creado exitosamente", producto: rows[0] });
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // Editar un producto (Solo el vendedor que lo creó)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, precio, imagen, categoria } = req.body;
      const usuario_id = req.user.id;
      const rol = req.user.rol;

      // Verificar si el producto es de usuario o si es ADMIN
      const { rows } = await pool.query("SELECT usuario_id FROM productos WHERE id = $1", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      if (rows[0].usuario_id !== usuario_id && rol !== "admin") {
        return res.status(403).json({ message: "No puedes editar este producto." });
      }

      await pool.query(
        "UPDATE productos SET titulo=$1, descripcion=$2, precio=$3, imagen=$4, categoria=$5 WHERE id=$6",
        [titulo, descripcion, precio, imagen, categoria, id]
      );

      res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // Eliminar un producto (Solo el vendedor o admin)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;
      const rol = req.user.rol;

      // Verificar si el producto pertenece al usuario o si es admin
      const { rows } = await pool.query("SELECT usuario_id FROM productos WHERE id = $1", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      if (rows[0].usuario_id !== usuario_id && rol !== "admin") {
        return res.status(403).json({ message: "No puedes eliminar este producto." });
      }

      await pool.query("DELETE FROM productos WHERE id = $1", [id]);

      res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  }
};

module.exports = productController;
