import { cartDBManager } from "../dao/cartDBManager.js";
import { productDBManager } from "../dao/productDBManager.js";

const CartService = new cartDBManager(productDBManager);
const ProductService = new productDBManager();

// Crear un nuevo carrito
const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart(req.user._id);
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Añadir un producto al carrito
const addProductToCart = async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;
  
  try {
    const updatedCart = await CartService.addProductByID(cartId, productId, quantity);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Actualizar la cantidad de un producto en el carrito
const updateProductQuantity = async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;
  
  try {
    const updatedCart = await CartService.updateProductByID(cartId, productId, quantity);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Eliminar un producto del carrito
const removeProductFromCart = async (req, res) => {
  const { cartId, productId } = req.params;
  
  try {
    const updatedCart = await CartService.deleteProductByID(cartId, productId);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Vaciar el carrito
const clearCart = async (req, res) => {
  const { cartId } = req.params;
  
  try {
    const clearedCart = await CartService.deleteAllProducts(cartId);
    res.status(200).json({ status: "success", payload: clearedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Ver los productos en el carrito
const viewCart = async (req, res) => {
  const { cartId } = req.params;
  
  try {
    const cart = await CartService.getCartByUserId(req.user._id);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export default {
  createCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCart,
  viewCart,
};
