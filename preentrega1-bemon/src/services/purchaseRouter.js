import Ticket from '../models/ticketModels.js';
import Product from '../models/productModel.js';
import CartDBManager from '../dao/cartDBManager.js';
import ProductDBManager from '../dao/productDBManager.js';

class PurchaseService {
  constructor(cartService, productService) {
    this.cartService = cartService;
    this.productService = productService;
  }

  async purchaseCart(userId, cartId) {
    // Obtener el carrito del usuario
    const cart = await this.cartService.getCartByUserId(userId);

    if (!cart || cart.id !== cartId || cart.products.length === 0) {
      throw new Error('Carrito vacío o no válido');
    }

    let totalAmount = 0;
    // Validar el stock de los productos en el carrito
    for (const item of cart.products) {
      const product = await this.productService.getProductById(item.product);

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity; // Reducir el stock
      await product.save(); // Guardar el producto con el stock actualizado
    }

    // Crear un ticket con la información de la compra
    const newTicket = new Ticket({
      code: `TICKET-${Date.now()}`,
      amount: totalAmount,
      buyer: userId,
      products: cart.products,
    });

    await newTicket.save(); // Guardar el ticket en la base de datos

    // Aquí podrías, por ejemplo, vaciar el carrito del usuario
    await this.cartService.deleteAllProducts(cartId);

    return newTicket; // Retornar el ticket generado
  }
}

export default PurchaseService;
