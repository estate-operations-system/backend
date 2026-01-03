import { Request, Response } from 'express';
import Ticket from '../models/ticketModel';

class TicketController {
  static async createTicket(req: Request, res: Response) {
    try {
      const { category, description, address, resident_id } = req.body;

      if (!category || !description || !resident_id) {
        return res.status(400).json({
          success: false,
          error: 'category, description и resident_id обязательны'
        });
      }

      const ticket = await Ticket.create({
        category,
        description,
        address,
        resident_id
      });

      res.status(201).json({
        success: true,
        data: ticket
      });
    } catch (err) {
      console.error('Ошибка при создании заявки:', err);
      res.status(500).json({ success: false, error: 'Ошибка создания заявки' });
    }
  }
}

export default TicketController;
