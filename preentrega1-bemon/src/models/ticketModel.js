import mongoose from 'mongoose';

// Definir el esquema para el modelo Ticket
const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  taxes: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  code: { type: String, unique: true, required: true }, // Agregamos un campo 'code' único
});

// Crear y exportar el modelo Ticket
const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
