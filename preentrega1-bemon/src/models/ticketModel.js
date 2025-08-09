// models/ticketModel.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  totalPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
