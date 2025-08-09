import Cart from '../models/cartModel.js';  
import Product from '../models/productModel.js';  

class CartService {

// Obtener el carrito de un usuario
async getCartByUserId(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('products.product');
  if (!cart) {
    throw new Error('Carrito no encontrado');
  }
  return cart;
}



  // Crear un carrito para un usuario
  async createCart(userId) {
    const newCart = new Cart({
      user: userId,
      products: []
    });
    await newCart.save();
    return newCart;
  }

  // Agregar un producto al carrito
  async addProductByID(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

    if (productIndex !== -1) {
      // Si el producto ya está en el carrito, aumentar la cantidad
      cart.products[productIndex].quantity += quantity;
    } else {
      // Si no, agregarlo al carrito
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  }

  // Eliminar un producto del carrito
  async deleteProductByID(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    // Eliminar el producto
    cart.products = cart.products.filter(item => item.product.toString() !== productId);
    await cart.save();
    return cart;
  }

  // Vaciar el carrito
  async deleteAllProducts(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    cart.products = [];
    await cart.save();
    return cart;
  }

  // Actualizar la cantidad de un producto en el carrito
  async updateProductByID(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
    if (productIndex !== -1) {
      // Si el producto existe, actualizar la cantidad
      cart.products[productIndex].quantity = quantity;
    } else {
      throw new Error('Producto no encontrado en el carrito');
    }

    await cart.save();
    return cart;
  }
}

export default new CartService();
