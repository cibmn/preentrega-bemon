import { Router } from 'express';
import cartDBManager from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import { jwtAuth } from '../middlewares/jwtAuth.js';
import UserDTO from '../dtos/UserDTO.js';
import CartDTO from '../dtos/CartDTO.js';
import { isAuth, authRole } from '../middlewares/roleAuth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Obtener el carrito del usuario autenticado
router.get('/current', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) return res.status(400).send({ status: 'error', message: 'ID de usuario no encontrado en token' });

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }

    // Usando DTOs para enviar una respuesta más estructurada
    const userDto = new UserDTO(req.user);
    const cartDto = new CartDTO(cart);

    res.send({ status: 'success', payload: { user: userDto, cart: cartDto } });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// Crear carrito para el usuario autenticado (si no tiene uno)
router.post('/mycart', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const newCart = await CartService.createCart(userId);
    res.status(201).send({ status: 'success', payload: newCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Añadir producto al carrito
router.post('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { pid } = req.params;
    const { quantity } = req.body;  // <-- La cantidad enviada en la petición
    const userId = req.user._id || req.user.id;

    // Obtener el carrito del usuario autenticado
    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }

    // Agregar el producto al carrito
    const updatedCart = await CartService.addProductByID(cart.id, pid, quantity || 1);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Eliminar producto del carrito
router.delete('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user._id || req.user.id;

    // Obtener el carrito del usuario autenticado
    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Eliminar el producto del carrito
    const updatedCart = await CartService.deleteProductByID(cart.id, pid);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Actualizar cantidad de un producto en el carrito
router.put('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { pid } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).send({ status: 'error', message: 'Cantidad inválida' });
    }

    // Obtener el carrito del usuario autenticado
    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Actualizar cantidad de producto en el carrito
    const updatedCart = await CartService.updateProductByID(cart.id, pid, quantity);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Vaciar carrito completo
router.delete('/:cid', jwtAuth, async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user._id || req.user.id;

    // Obtener el carrito del usuario autenticado
    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Vaciar carrito completo
    const emptiedCart = await CartService.deleteAllProducts(cart.id);
    res.send({ status: 'success', payload: emptiedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
