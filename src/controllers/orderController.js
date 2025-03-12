const pool = require("../config/database");

const orderController = {
  //Crear buy
  async createOrder(req, res) {
    try {
      const { usuario_id, productos, metodo_pago_id, direccion_envio } = req.body;

      if (!usuario_id || !productos || productos.length === 0 || !metodo_pago_id || !direccion_envio) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
      }

      //Calcular total de buy
      let total = 0;
      for (const item of productos) {
        const productResult = await pool.query("SELECT precio FROM productos WHERE id = $1", [item.producto_id]);
        if (productResult.rows.length === 0) {
          return res.status(404).json({ message: `Producto con ID ${item.producto_id} no encontrado.` });
        }
        total += productResult.rows[0].precio * item.cantidad;
      }

      //Insert buy en la db
      const compraResult = await pool.query(
        "INSERT INTO compras (usuario_id, total, metodo_pago_id, direccion_envio) VALUES ($1, $2, $3, $4) RETURNING id",
        [usuario_id, total, metodo_pago_id, direccion_envio]
      );

      const compraId = compraResult.rows[0].id;

      //Insertar detalles de buy
      for (const item of productos) {
        await pool.query(
          "INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
          [compraId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }

      res.status(201).json({ message: "Compra registrada exitosamente", compraId });
    } catch (error) {
      console.error("Error al registrar compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //get TODAS las compras (Solo Admin)
  async getAllOrders(req, res) {
    try {
      const result = await pool.query(`
        SELECT c.id, c.usuario_id, u.nombre AS usuario_nombre, c.total, c.fecha, c.estado, m.nombre AS metodo_pago, c.direccion_envio
        FROM compras c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN metodos_pago m ON c.metodo_pago_id = m.id
        ORDER BY c.fecha DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener todas las compras:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Obtener buy de user específico
  async getUserOrders(req, res) {
    try {
      const { usuario_id } = req.params;
      const result = await pool.query(`
        SELECT c.id, c.total, c.fecha, c.estado, m.nombre AS metodo_pago, c.direccion_envio
        FROM compras c
        JOIN metodos_pago m ON c.metodo_pago_id = m.id
        WHERE c.usuario_id = $1
        ORDER BY c.fecha DESC
      `, [usuario_id]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener compras del usuario:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Act el estado de una compra
  async updateOrderStatus(req, res) {
    try {
      const { compra_id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ["Pendiente", "Pagado", "Enviado", "Cancelado"];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: "Estado no válido." });
      }

      await pool.query("UPDATE compras SET estado = $1 WHERE id = $2", [estado, compra_id]);
      res.json({ message: "Estado de la compra actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar estado de compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  //Deletear buy (Primero eliminamos detalles)
  async deleteOrder(req, res) {
    try {
      const { compra_id } = req.params;
      console.log("Intentando eliminar compra con ID:", compra_id);

      //Verificar si la compra existe
      const compraExistente = await pool.query("SELECT * FROM compras WHERE id = $1", [compra_id]);
      if (compraExistente.rows.length === 0) {
        console.log("⚠️ Compra no encontrada");
        return res.status(404).json({ message: "Compra no encontrada." });
      }

      //Verificar si hay detalles de la compra
      const detallesCompra = await pool.query("SELECT * FROM detalles_compra WHERE compra_id = $1", [compra_id]);
      if (detallesCompra.rows.length > 0) {
        console.log("🗑 Eliminando detalles de la compra...");
        await pool.query("DELETE FROM detalles_compra WHERE compra_id = $1", [compra_id]);
      } else {
        console.log("⚠️ No hay detalles para eliminar");
      }

      //Ahora eliminar la compra
      console.log("🗑 Eliminando compra...");
      await pool.query("DELETE FROM compras WHERE id = $1", [compra_id]);

      console.log("✅ Compra eliminada correctamente");
      res.json({ message: "Compra eliminada correctamente." });
    } catch (error) {
      console.error("❌ Error al eliminar compra:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
};

module.exports = orderController;
