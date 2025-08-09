import Ticket from '../models/ticketModel.js'; // Asegúrate de que la ruta sea correcta
import { productDBManager } from './productDBManager.js'; // Aquí se asume que tienes el productoDBManager

// Clase para gestionar tickets
class ticketDBManager {
  constructor(productService) {
    // Verificamos si productService es válido
    if (!productService || !productService.getProductByID) {
      throw new Error('Product service no está correctamente configurado');
    }
    this.productService = productService;
  }

  // Método para crear un ticket
  async createTicket(userId, items, paymentMethod) {
    let totalAmount = 0;
    let taxes = 0;
    let finalAmount = 0;
    let itemsDetails = [];

    // Verificar si items es un array
    if (!Array.isArray(items)) {
      throw new Error('El parámetro "items" debe ser un array');
    }

    // Calcular el total y los detalles de cada item
    for (let item of items) {
      // Obtenemos el producto desde el servicio
      const product = await this.productService.getProductByID(item.productId);
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      const total = product.price * item.quantity;

      itemsDetails.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total,
      });

      totalAmount += total;
    }

    // Calcular los impuestos y el total final
    taxes = totalAmount * 0.10; // Suponiendo un 10% de impuestos
    finalAmount = totalAmount + taxes;

    // Generar un código único para el ticket
    const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Crear el nuevo ticket
    const newTicket = new Ticket({
      userId,
      items: itemsDetails,
      totalAmount,
      taxes,
      finalAmount,
      paymentMethod,
      code, // Asignar el código único
    });

    // Guardar el ticket en la base de datos
    await newTicket.save();
    return newTicket;
  }

  // Método para obtener los tickets por userId
  async getTicketsByUserId(userId) {
    return await Ticket.find({ userId }).populate('items.productId'); // Asegúrate de usar populate si necesitas datos de productos
  }
}

export default ticketDBManager;
