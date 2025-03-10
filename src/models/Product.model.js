const pool = require("../config/database");

const Product = {
  
  async getAll() {
    const { rows } = await pool.query("SELECT * FROM productos");
    return rows;
  },

  
  async getById(id) {
    const { rows } = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);
    return rows[0];
  },

  
  async create({ titulo, descripcion, precio, imagen, categoria, stock, usuario_id }) {
    const { rows } = await pool.query(
      "INSERT INTO productos (titulo, descripcion, precio, imagen, categoria, stock, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [titulo, descripcion, Math.floor(precio), imagen, categoria, stock, usuario_id]
    );
    return rows[0];
  },

  
  async update(id, { titulo, descripcion, precio, imagen, categoria, stock }) {
    const { rows } = await pool.query(
      "UPDATE productos SET titulo=$1, descripcion=$2, precio=$3, imagen=$4, categoria=$5, stock=$6 WHERE id=$7 RETURNING *",
      [titulo, descripcion, Math.floor(precio), imagen, categoria, stock, id]
    );
    return rows[0];
  },

  
  async delete(id) {
    await pool.query("DELETE FROM productos WHERE id = $1", [id]);
    return { message: "Producto eliminado correctamente" };
  },
};

module.exports = Product;
