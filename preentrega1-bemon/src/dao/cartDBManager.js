import { productDBManager } from './productDBManager.js';

class cartDBManager {
  constructor(productService) {
    this.productService = productService;
    this.carts = [];
  }

  async getCartByUserId(userId) {  // cambié a "Id" para que coincida con el router
    return this.carts.find(cart => cart.userId === userId) || null;
  }

  async createCart(userId) {
    const newCart = { id: String(Date.now()), userId, products: [] };
    this.carts.push(newCart);
    return newCart;
  }

  async addProductByID(cartId, productId) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await this.productService.getProductByID(productId);  // CORRECCIÓN
    if (!product) throw new Error('Producto no encontrado');

    cart.products.push({ productId, quantity: 1 });
    return cart;
  }

  async deleteProductByID(cartId, productId) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');
    cart.products = cart.products.filter(p => p.productId !== productId);
    return cart;
  }

  async deleteAllProducts(cartId) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');
    cart.products = [];
    return cart;
  }

  async updateProductByID(cartId, productId, quantity) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');
    const productInCart = cart.products.find(p => p.productId === productId);
    if (!productInCart) throw new Error('Producto no encontrado en carrito');
    productInCart.quantity = quantity;
    return cart;
  }
}

export default cartDBManager;
