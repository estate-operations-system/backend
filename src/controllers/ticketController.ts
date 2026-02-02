import { Request, Response } from 'express';
import Ticket from '../models/ticketModel';

class TicketController {
  static async createTicket(req: Request, res: Response) {
    try {
      const { category, description, address, status, resident_id } = req.body;

      if (!category || !address || !status || !resident_id) {
        return res.status(400).json({success: false,error: 'category, address, status и resident_id обязательны'});
      }

      const newTicket = await Ticket.create({
        category,
        description,
        address,
        status,
        resident_id
      });

      res.json({success: true, message: 'Заявка создана', data: newTicket});
    } catch (err) {
      console.error('Ошибка при создании заявки:', err);
      res.status(500).json({ success: false, error: 'Ошибка сервера при создания заявки' });
    }
  }

  static async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await Ticket.findAll();
      res.json({success: true, count: tickets.length, data: tickets});
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      res.status(500).json({success: false, error: 'Ошибка сервера при получении заявок'});
    }
  }

  static async getTicketById(req: Request, res: Response) {
    try {
      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({success: false, error: 'Заявка не найдена'});
      }
      res.json({success: true, data: ticket});
    } catch (err) {
      console.error('Ошибка при получении заявки по id:', err);
      res.status(500).json({success: false, error: 'Ошибка сервера при полученни заявки по id'});
    }
  }

  static async updateTicket(req: Request, res: Response) {
    try {
      const { category, description, address, status, resident_id } = req.body;

      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({success: false, error: 'Заявка не найдена'});
      }

      const updatedTicket = await Ticket.update(parseInt(req.params.id, 10), { category, description, address, status, resident_id });

      res.json({success: true, message: 'Заявка успешно обновлена', data: updatedTicket});
    } catch (err) {
      console.error('Ошибка при обновлении заявки:', err);
      res.status(500).json({success: false, error: 'Ошибка сервера при обновлении заявки'});
    }
  }

  static async deleteTicket(req: Request, res: Response) {
    try {
      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({success: false, error: 'Заявка не найдена'});
      }

      const deletedTicket = await Ticket.delete(parseInt(req.params.id, 10));

      res.json({ success: true, message: 'Заявка удалена', data: deletedTicket});
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при удалении заявки' });
    }
  }
}

export default TicketController;
