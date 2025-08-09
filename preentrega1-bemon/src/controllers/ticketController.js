import { productDBManager } from "../dao/productDBManager.js";  // Importa correctamente el productDBManager
import TicketDBManager from "../dao/ticketDBManager.js";

// Crea una instancia de productDBManager
const productService = new productDBManager();

// Crea una instancia de ticketDBManager pasando el productService
const ticketDBManager = new TicketDBManager(productService);  // Pasa el productService al constructor de TicketDBManager

export const createTicket = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { items, paymentMethod } = req.body;

    // Crear el ticket
    const newTicket = await ticketDBManager.createTicket(userId, items, paymentMethod);

    res.status(201).send({
      status: 'success',
      message: 'Ticket creado exitosamente',
      ticket: newTicket,
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tickets = await ticketDBManager.getTicketsByUserId(userId);
    
    if (!tickets.length) {
      return res.status(404).send({ status: 'error', message: 'No se encontraron tickets' });
    }

    res.send({ status: 'success', payload: tickets });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
};
