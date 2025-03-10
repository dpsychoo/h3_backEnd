const pool = require("../config/database");

const Order = {
  // Get buy de User
  async getByUserId(usuario_id) {
    const { rows } = await pool.query(
      "SELECT * FROM compras WHERE usuario_id = $1 ORDER BY fecha DESC",
      [usuario_id]
    );
    return rows;
  },

  // Crear Nw Buy
  async create({ usuario_id, total, metodo_pago_id, direccion_envio }) {
    const { rows } = await pool.query(
      "INSERT INTO compras (usuario_id, total, metodo_pago_id, direccion_envio) VALUES ($1, $2, $3, $4) RETURNING *",
      [usuario_id, Math.floor(total), metodo_pago_id, direccion_envio]
    );
    return rows[0];
  },

  // Cambiar el estado de compra ('Pendiente' -> 'Pagado')
  async updateStatus(id, estado) {
    const { rows } = await pool.query(
      "UPDATE compras SET estado=$1 WHERE id=$2 RETURNING *",
      [estado, id]
    );
    return rows[0];
  }
};

module.exports = Order;
