import express from 'express';
import Cart from '../models/cartModel';  
import Ticket from '../models/ticketModel';  
import Product from '../models/productModel';  
import { v4 as uuidv4 } from 'uuid'; 

const router = express.Router();

// Ruta para procesar la compra
router.post('/checkout', async (req, res) => {
  const userId = req.user.id; 

  try {
    // Obtener el carrito del usuario
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    let totalPrice = 0;
    let productsToUpdate = [];

    // Verificar stock y calcular el precio total
    for (const item of cart.products) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `No hay suficiente stock de ${product.title}`,
        });
      }
      totalPrice += product.price * item.quantity;

      // Preparar para actualizar el stock
      productsToUpdate.push({
        productId: product._id,
        quantity: product.stock - item.quantity,
      });
    }

    // Crear el ticket de compra
    const ticket = new Ticket({
      code: uuidv4(),  // Genera un código único para el ticket
      amount: totalPrice,
      buyer: userId,
      products: cart.products.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
    });

    // Guardar el ticket y actualizar stock
    await ticket.save();
    for (const update of productsToUpdate) {
      await Product.findByIdAndUpdate(update.productId, { stock: update.quantity });
    }

    // Vaciar el carrito después de la compra
    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    res.status(200).json({ status: 'success', message: 'Compra realizada', ticket });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
