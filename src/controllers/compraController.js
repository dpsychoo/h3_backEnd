const pool = require("../config/database");

const compraController = {
  //Registrar Nw Buy
  async createCompra(req, res) {
    try {
      const { productos, metodo_pago_id, direccion_envio } = req.body;
      const usuario_id = req.user.id;

      if (!productos || productos.length === 0) {
        return res.status(400).json({ message: "Debe incluir al menos un producto en la compra." });
      }

      if (!metodo_pago_id || !direccion_envio) {
        return res.status(400).json({ message: "Debe incluir un método de pago y dirección de envío." });
      }

      let total = 0;
      for (const item of productos) {
        total += item.precio_unitario * item.cantidad;
      }

      //Insertar buy
      const result = await pool.query(
        "INSERT INTO compras (usuario_id, total, metodo_pago_id, direccion_envio) VALUES ($1, $2, $3, $4) RETURNING id",
        [usuario_id, total, metodo_pago_id, direccion_envio]
      );

      const compra_id = result.rows[0].id;

      //Insertar detail de buy
      for (const item of productos) {
        await pool.query(
          "INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
          [compra_id, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }

      res.status(201).json({ message: "Compra registrada correctamente", compra_id });
    } catch (error) {
      console.error("Error al registrar compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Get buy de user autenticado
  async getComprasUsuario(req, res) {
    try {
      const usuario_id = req.user.id;
      const result = await pool.query("SELECT * FROM compras WHERE usuario_id = $1", [usuario_id]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener compras:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Get buy de vendedor
  async getComprasVendedor(req, res) {
    try {
      const usuario_id = req.user.id;

      const result = await pool.query(`
        SELECT c.id, c.usuario_id, c.total, c.fecha, c.estado, c.metodo_pago_id, c.direccion_envio,
               d.producto_id, d.cantidad, d.precio_unitario
        FROM compras c
        JOIN detalles_compra d ON c.id = d.compra_id
        JOIN productos p ON d.producto_id = p.id
        WHERE p.usuario_id = $1
      `, [usuario_id]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener compras del vendedor:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Actualizar el estado de una compra (Solo el vendedor o admin)
  async updateEstadoCompra(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!["Pendiente", "Pagado", "Enviado", "Cancelado"].includes(estado)) {
        return res.status(400).json({ message: "Estado inválido." });
      }

      await pool.query("UPDATE compras SET estado = $1 WHERE id = $2", [estado, id]);

      res.json({ message: "Estado de compra actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar estado de compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Deletear buy (Solo admin)
  async deleteCompra(req, res) {
    try {
      const { id } = req.params;

      await pool.query("DELETE FROM compras WHERE id = $1", [id]);

      res.json({ message: "Compra eliminada correctamente." });
    } catch (error) {
      console.error("Error al eliminar compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
};

module.exports = compraController;
