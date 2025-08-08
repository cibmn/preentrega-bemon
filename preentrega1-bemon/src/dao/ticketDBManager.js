import ticketModel from './models/ticketModel.js';

class ticketDBManager {
  async createTicket(ticketData) {
    const ticket = await ticketModel.create(ticketData);
    return ticket;
  }

  async getTicketById(id) {
    return await ticketModel.findById(id).populate('buyer').populate('products.product');
  }

  async getAllTickets() {
    return await ticketModel.find().populate('buyer').populate('products.product');
  }
}

export { ticketDBManager };
