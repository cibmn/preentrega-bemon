import { Router } from 'express';
import { cartDBManager } from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import { jwtAuth } from '../middlewares/jwtAuth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Obtener carrito del usuario autenticado, crea uno si no existe
router.get('/current', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) return res.status(400).send({ status: 'error', message: 'ID de usuario no encontrado en token' });

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }

    res.send({ status: 'success', payload: cart });
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
    const updatedCart = await CartService.addProductByID(cid, pid);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
