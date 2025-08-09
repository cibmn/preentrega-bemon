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
    const cart = await this.cartService.getCartByUserId(userId);

    if (!cart || cart.id !== cartId || cart.products.length === 0) {
      throw new Error('Carrito vacío o no válido');
    }

    let totalAmount = 0;
    for (const item of cart.products) {
      const product = await this.productService.getProductById(item.product);

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity; 
      await product.save(); 
    }

    const newTicket = new Ticket({
      code: `TICKET-${Date.now()}`,
      amount: totalAmount,
      buyer: userId,
      products: cart.products,
    });

    await newTicket.save(); 

    await this.cartService.deleteAllProducts(cartId);

    return newTicket; 
  }
}

export default PurchaseService;
