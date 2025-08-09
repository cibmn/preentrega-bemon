import express from 'express';
import Cart from '../models/cartModel';  
import Ticket from '../models/ticketModel';  
import Product from '../models/productModel';  
import { v4 as uuidv4 } from 'uuid'; 

const router = express.Router();

router.post('/checkout', async (req, res) => {
  const userId = req.user.id; 

  try {
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    let totalPrice = 0;
    let productsToUpdate = [];

    for (const item of cart.products) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `No hay suficiente stock de ${product.title}`,
        });
      }
      totalPrice += product.price * item.quantity;

      productsToUpdate.push({
        productId: product._id,
        quantity: product.stock - item.quantity,
      });
    }

    const ticket = new Ticket({
      code: uuidv4(),  
      amount: totalPrice,
      buyer: userId,
      products: cart.products.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
    });

    await ticket.save();
    for (const update of productsToUpdate) {
      await Product.findByIdAndUpdate(update.productId, { stock: update.quantity });
    }

    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    res.status(200).json({ status: 'success', message: 'Compra realizada', ticket });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
