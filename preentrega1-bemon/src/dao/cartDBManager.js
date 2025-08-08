import { cartModel } from "./models/cartModel.js";

class cartDBManager {
  constructor(productDBManager) {
    this.productDBManager = productDBManager;
  }

  async getAllCarts() {
    return cartModel.find();
  }

  // Obtener carrito por id para admins
  async getProductsFromCartByID(cid) {
    const cart = await cartModel.findOne({ _id: cid }).populate('products.product');
    if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    return cart;
  }

  // Obtener carrito por usuario (usuario logueado)
  async getCartByUserId(userId) {
    const cart = await cartModel.findOne({ user: userId }).populate('products.product');
    // Aquí ya no lanza error si no existe, solo devuelve null
    return cart;
  }

  // Crear carrito para usuario (previene duplicados)
  async createCart(userId) {
    const existingCart = await cartModel.findOne({ user: userId });
    if (existingCart) return existingCart;
    return await cartModel.create({ user: userId, products: [] });
  }

  // Añadir producto al carrito
  async addProductByID(cid, pid) {
    await this.productDBManager.getProductByID(pid);

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart) throw new Error(`El carrito ${cid} no existe!`);

    let i = null;
    const result = cart.products.filter((item, index) => {
      if (item.product.toString() === pid) i = index;
      return item.product.toString() === pid;
    });

    if (result.length > 0) {
      cart.products[i].quantity += 1;
    } else {
      cart.products.push({
        product: pid,
        quantity: 1
      });
    }
    await cartModel.updateOne({ _id: cid }, { products: cart.products });

    return await this.getProductsFromCartByID(cid);
  }

  // Borrar producto del carrito
  async deleteProductByID(cid, pid) {
    await this.productDBManager.getProductByID(pid);

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart) throw new Error(`El carrito ${cid} no existe!`);

    const newProducts = cart.products.filter(item => item.product.toString() !== pid);

    await cartModel.updateOne({ _id: cid }, { products: newProducts });

    return await this.getProductsFromCartByID(cid);
  }

  // Actualizar todos los productos del carrito
  async updateAllProducts(cid, products) {
    for (let key in products) {
      await this.productDBManager.getProductByID(products[key].product);
    }

    await cartModel.updateOne({ _id: cid }, { products: products });

    return await this.getProductsFromCartByID(cid);
  }

  // Actualizar cantidad de producto en carrito
  async updateProductByID(cid, pid, quantity) {
    if (!quantity || isNaN(parseInt(quantity))) throw new Error(`La cantidad ingresada no es válida!`);

    await this.productDBManager.getProductByID(pid);

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart) throw new Error(`El carrito ${cid} no existe!`);

    let i = null;
    const result = cart.products.filter((item, index) => {
      if (item.product.toString() === pid) i = index;
      return item.product.toString() === pid;
    });

    if (result.length === 0) throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);

    cart.products[i].quantity = parseInt(quantity);

    await cartModel.updateOne({ _id: cid }, { products: cart.products });

    return await this.getProductsFromCartByID(cid);
  }

  // Vaciar carrito
  async deleteAllProducts(cid) {
    await cartModel.updateOne({ _id: cid }, { products: [] });
    return await this.getProductsFromCartByID(cid);
  }
}

export { cartDBManager };
