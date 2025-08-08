import { Router } from 'express';
import cartDBManager from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import { jwtAuth } from '../middlewares/jwtAuth.js';
import UserDTO from '../dtos/UserDTO.js';
import CartDTO from '../dtos/CartDTO.js';
import { currentUserDTO } from '../dtos/currentDTO.js';  // si usás esta versión

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Aquí va el endpoint /current con los DTOs
router.get('/current', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId)
      return res.status(400).send({ status: 'error', message: 'ID de usuario no encontrado en token' });

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }

    // Usando los DTOs para filtrar la info que devuelvo
    const userDto = new UserDTO(req.user);
    const cartDto = new CartDTO(cart);

    res.send({ status: 'success', payload: { user: userDto, cart: cartDto } });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

// Crear carrito para usuario autenticado (si no tiene)
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
    const { cid, pid } = req.params;
    const { quantity } = req.body;  // <-- Aquí la cantidad enviada
    const userId = req.user._id || req.user.id;

    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.id !== cid) {
      return res.status(403).send({ status: 'error', message: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await CartService.addProductByID(cid, pid, quantity || 1);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});


// Eliminar producto del carrito
router.delete('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const userId = req.user._id || req.user.id;

    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.id !== cid) {
      return res.status(403).send({ status: 'error', message: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await CartService.deleteProductByID(cid, pid);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Disminuir cantidad de un producto en el carrito
router.patch('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).send({ status: 'error', message: 'Cantidad inválida' });
    }

    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.id !== cid) {
      return res.status(403).send({ status: 'error', message: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await CartService.removeProductQuantity(cid, pid, quantity);
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

    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.id !== cid) {
      return res.status(403).send({ status: 'error', message: 'No autorizado para modificar este carrito' });
    }

    const emptiedCart = await CartService.deleteAllProducts(cid);
    res.send({ status: 'success', payload: emptiedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

// Actualizar cantidad de producto en carrito
router.put('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).send({ status: 'error', message: 'Cantidad inválida' });
    }

    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.id !== cid) {
      return res.status(403).send({ status: 'error', message: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await CartService.updateProductByID(cid, pid, quantity);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
