import { Router } from 'express';
import { ticketDBManager } from '../dao/ticketDBManager.js';
import  cartDBManager from '../dao/cartDBManager.js'; 
import { productDBManager } from '../dao/productDBManager.js';
import { isAuth } from '../middlewares/auth.js';

const router = Router();
const TicketService = new ticketDBManager();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

router.post('/purchase/:cid', isAuth, async (req, res) => {
  try {
    const cart = await CartService.getProductsFromCartByID(req.params.cid);

    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    let totalAmount = 0;
    let outOfStock = [];

    for (const item of cart.products) {
      const product = await ProductService.getProductByID(item.product._id.toString());

      if (!product) {
        return res.status(404).send({ status: 'error', message: `Producto ${item.product._id} no encontrado` });
      }

      if (product.stock < item.quantity) {
        outOfStock.push({ product: product.title || product._id, available: product.stock });
      } else {
        totalAmount += product.price * item.quantity;
      }
    }

    if (outOfStock.length > 0) {
      return res.status(400).send({
        status: 'error',
        message: 'Productos fuera de stock',
        details: outOfStock
      });
    }

    for (const item of cart.products) {
      const product = await ProductService.getProductByID(item.product._id.toString());
      product.stock -= item.quantity;
      await ProductService.updateProduct(product._id, { stock: product.stock });
    }

    const ticketData = {
      code: 'TICKET-' + Date.now(),
      buyer: req.user._id,
      amount: totalAmount,
      products: cart.products.map(p => ({ product: p.product._id, quantity: p.quantity }))
    };

    const ticket = await TicketService.createTicket(ticketData);

    await CartService.deleteAllProducts(req.params.cid);

    res.send({
      status: 'success',
      message: 'Compra realizada con éxito',
      ticket
    });

  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
