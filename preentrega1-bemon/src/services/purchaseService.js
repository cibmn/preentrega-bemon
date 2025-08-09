import ticketModel from '../models/ticketModel.js';  // Asumiendo que ya tienes el modelo Ticket
import { productDBManager } from '../dao/productDBManager.js';  // Cambiar a importación con nombre
import cartDBManager from '../dao/cartDBManager.js';  // El cart manager

class PurchaseService {
  constructor() {
    this.cartService = new cartDBManager();
    this.productService = new productDBManager();
  }

  // Método para realizar la compra
  async purchaseCart(userId, cartId) {
    // Verificar si el carrito existe y pertenece al usuario
    const cart = await this.cartService.getCartByUserId(userId);
    if (!cart || cart.id !== cartId) {
      throw new Error('Carrito no encontrado o no pertenece al usuario');
    }

    // Verificar stock de los productos en el carrito
    const updatedProducts = [];
    let totalAmount = 0;

    for (let cartItem of cart.products) {
      const product = await this.productService.getProductByID(cartItem.product);  // Corregir el método a getProductByID
      if (!product) {
        throw new Error(`Producto con ID ${cartItem.product} no encontrado`);
      }

      // Verificar si hay suficiente stock
      if (product.stock < cartItem.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${product.name}`);
      }

      // Reducir el stock
      product.stock -= cartItem.quantity;
      await this.productService.updateProduct(product._id, { stock: product.stock });  // Usar _id para actualizar el producto

      // Calcular el total
      totalAmount += product.price * cartItem.quantity;

      updatedProducts.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price
      });
    }

    // Crear el ticket
    const ticketData = {
      code: `TICKET-${new Date().getTime()}`,  // Generar un código único para el ticket
      amount: totalAmount,
      buyer: userId,
      products: updatedProducts,
    };

    const ticket = await ticketModel.create(ticketData);

    // Limpiar el carrito
    await this.cartService.deleteAllProducts(cartId);

    return ticket;
  }
}

export default PurchaseService;
