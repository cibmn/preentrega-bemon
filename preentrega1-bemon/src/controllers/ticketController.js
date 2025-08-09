import Ticket from '../models/ticketModel.js';
import { productDBManager } from '../dao/productDBManager.js';
import cartDBManager from '../dao/cartDBManager.js';

const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

const createTicket = async (userId, cartId) => {
  const cart = await CartService.getCartByUserId(userId);
  if (!cart || cart.id !== cartId) {
    throw new Error('Carrito no encontrado o no autorizado.');
  }

  for (const item of cart.products) {
    const product = await ProductService.getProductByID(item.productId);
    if (product.stock < item.quantity) {
      throw new Error(`No hay suficiente stock para el producto ${product.title}`);
    }
  }

  const ticket = new Ticket({
    userId,
    products: cart.products.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })),
    totalPrice: cart.products.reduce((total, item) => total + (item.price * item.quantity), 0)
  });

  await ticket.save();

  for (const item of cart.products) {
    const product = await ProductService.getProductByID(item.productId);
    product.stock -= item.quantity;
    await product.save();
  }

  await CartService.deleteAllProducts(cart.id);

  return ticket;
};

export default {
  createTicket
};
