import { Router } from 'express';
import cartDBManager from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import { jwtAuth } from '../middlewares/jwtAuth.js';
import { isAuth, authRole } from '../middlewares/roleAuth.js';  

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);


router.get('/current', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) return res.status(400).send({ status: 'error', message: 'ID de usuario no encontrado en token' });

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }


    res.send({ status: 'success', payload: { user: req.user, cart } });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});




router.post('/mycart', jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const newCart = await CartService.createCart(userId);
    res.status(201).send({ status: 'success', payload: newCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});


router.post('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { pid } = req.params;
    const { quantity } = req.body;  
    const userId = req.user._id || req.user.id;

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      cart = await CartService.createCart(userId);
    }





    const updatedCart = await CartService.addProductByID(cart.id, pid, quantity || 1);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});


router.delete('/:cid/product/:pid', jwtAuth, authRole(['user', 'admin']), async (req, res) => {  
  try {
    const { pid } = req.params;
    const userId = req.user._id || req.user.id;

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }




    const updatedCart = await CartService.deleteProductByID(cart.id, pid);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});


router.patch('/:cid/product/:pid', jwtAuth, async (req, res) => {
  try {
    const { pid } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).send({ status: 'error', message: 'Cantidad inválida, debe ser al menos 1' });
    }

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    const updatedCart = await CartService.updateProductByID(cart.id, pid, quantity);
    res.send({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});


router.delete('/:cid', jwtAuth, authRole(['user', 'admin']), async (req, res) => {  
  try {
    const { cid } = req.params;
    const userId = req.user._id || req.user.id;

    let cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(400).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    const emptiedCart = await CartService.deleteAllProducts(cart.id);
    res.send({ status: 'success', payload: emptiedCart });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
