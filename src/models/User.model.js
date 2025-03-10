const pool = require("../config/database");

const User = {
  
  async getById(id) {
    const { rows } = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = $1", [id]);
    return rows[0];
  },

  // Get usr por email (para login)
  async getByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    return rows[0];
  },

  
  async create({ nombre, email, password, rol = "cliente" }) {
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
      [nombre, email, password, rol]
    );
    return rows[0];
  },

  
  async delete(id) {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    return { message: "Usuario eliminado correctamente" };
  },
};

module.exports = User;
