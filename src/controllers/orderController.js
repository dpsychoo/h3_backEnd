const Order = require("../models/Order.model");

const orderController = {
  
  async getUserOrders(req, res) {
    try {
      const { usuario_id } = req.params;
      const orders = await Order.getByUserId(usuario_id);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las compras", error });
    }
  },

  // Crear N compra
  async createOrder(req, res) {
    try {
      const { usuario_id, total, metodo_pago_id, direccion_envio } = req.body;

      const newOrder = await Order.create({ 
        usuario_id, 
        total: Math.floor(total), 
        metodo_pago_id, 
        direccion_envio 
      });

      res.status(201).json({ message: "Compra realizada exitosamente", order: newOrder });
    } catch (error) {
      res.status(500).json({ message: "Error al realizar la compra", error });
    }
  },

  // Act estado de buy
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const updatedOrder = await Order.updateStatus(id, estado);
      if (!updatedOrder) return res.status(404).json({ message: "Compra no encontrada" });

      res.status(200).json({ message: "Estado de compra actualizado", order: updatedOrder });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el estado", error });
    }
  }
};

module.exports = orderController;
