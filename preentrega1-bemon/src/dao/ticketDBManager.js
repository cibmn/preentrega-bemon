import Ticket from '../models/ticketModel.js'; 
import { productDBManager } from './productDBManager.js';

class ticketDBManager {
  constructor(productService) {
    if (!productService || !productService.getProductByID) {
      throw new Error('Product service no está correctamente configurado');
    }
    this.productService = productService;
  }

  async createTicket(userId, items, paymentMethod) {
    let totalAmount = 0;
    let taxes = 0;
    let finalAmount = 0;
    let itemsDetails = [];

    if (!Array.isArray(items)) {
      throw new Error('El parámetro "items" debe ser un array');
    }

    for (let item of items) {
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


    taxes = totalAmount * 0.10; 
    finalAmount = totalAmount + taxes;

    const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newTicket = new Ticket({
      userId,
      items: itemsDetails,
      totalAmount,
      taxes,
      finalAmount,
      paymentMethod,
      code, 
    });

    await newTicket.save();
    return newTicket;
  }

  async getTicketsByUserId(userId) {
    return await Ticket.find({ userId }).populate('items.productId'); 
  }
}

export default ticketDBManager;
