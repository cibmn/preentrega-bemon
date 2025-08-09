import Cart from '../models/cartModel.js';  
import Product from '../models/productModel.js';  

class CartService {

async getCartByUserId(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('products.product');
  if (!cart) {
    throw new Error('Carrito no encontrado');
  }
  return cart;
}



  async createCart(userId) {
    const newCart = new Cart({
      user: userId,
      products: []
    });
    await newCart.save();
    return newCart;
  }

  async addProductByID(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  }

  async deleteProductByID(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    cart.products = cart.products.filter(item => item.product.toString() !== productId);
    await cart.save();
    return cart;
  }

  async deleteAllProducts(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    cart.products = [];
    await cart.save();
    return cart;
  }

  async updateProductByID(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
    } else {
      throw new Error('Producto no encontrado en el carrito');
    }

    await cart.save();
    return cart;
  }
}

export default new CartService();
