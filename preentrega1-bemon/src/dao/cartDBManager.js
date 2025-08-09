import mongoose from 'mongoose'; 
import { productDBManager } from './productDBManager.js';

class cartDBManager {
  constructor(productService) {
    this.productService = productService;
    this.carts = [];
  }

  async getCartByUserId(userId) {
    return this.carts.find(cart => cart.userId === userId) || null;
  }

  async createCart(userId) {
    const newCart = { id: String(Date.now()), userId, products: [] };
    this.carts.push(newCart);
    return newCart;
  }

  async addProductByID(cartId, productId, quantity = 1) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await this.productService.getProductByID(productId);
    if (!product) throw new Error('Producto no encontrado');

    if (quantity < 1) throw new Error('La cantidad debe ser al menos 1');

    const productInCart = cart.products.find(p => p.productId === productId);

    if (productInCart) {
      if (productInCart.quantity + quantity > product.stock) {
        throw new Error('No hay suficiente stock disponible');
      }
      productInCart.quantity += quantity;
    } else {
      if (quantity > product.stock) {
        throw new Error('No hay suficiente stock disponible');
      }
      cart.products.push({ productId, quantity });
    }
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


  async removeProductQuantity(cartId, productId, quantity) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const productInCart = cart.products.find(p => p.productId === productId);
    if (!productInCart) throw new Error('Producto no encontrado en carrito');

    if (quantity < 1) throw new Error('La cantidad debe ser al menos 1');


    productInCart.quantity -= quantity;


    if (productInCart.quantity <= 0) {
      cart.products = cart.products.filter(p => p.productId !== productId);
    }

    return cart;
  }


  async updateProductByID(cartId, productId, quantity) {
    const cart = this.carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const productInCart = cart.products.find(p => p.productId === productId);
    if (!productInCart) throw new Error('Producto no encontrado en carrito');

    if (quantity < 1) throw new Error('La cantidad debe ser al menos 1');

    const product = await this.productService.getProductByID(productId);
    if (!product) throw new Error('Producto no encontrado');

    if (quantity > product.stock) {
      throw new Error('No hay suficiente stock disponible');
    }

    productInCart.quantity = quantity;
    return cart;
  }
}

export default cartDBManager;
