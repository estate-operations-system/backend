import { Request, Response } from 'express';
import Ticket from '../models/ticketModel';
import User from '../models/userModel';
import TicketComment from '../models/ticketCommentModel';
import TicketStatusHistory from '../models/ticketStatusHistoryModel';

class TicketController {
  static async createTicket(req: Request, res: Response) {
    try {
      const { category, description, address, status, resident_id } = req.body;

      if (!category || !address || !status || !resident_id) {
        return res
          .status(400)
          .json({ success: false, error: 'category, address, status и resident_id обязательны' });
      }

      const newTicket = await Ticket.create({
        category,
        description,
        address,
        status,
        resident_id,
      });

      // Добавляем начальную запись в историю статусов
      const currentUser = (req as any).user;
      if (currentUser) {
        await TicketStatusHistory.create({
          ticket_id: newTicket.id!,
          new_status: status,
          changed_by: currentUser.userId,
        });
      }

      res.json({ success: true, message: 'Заявка создана', data: newTicket });
    } catch (err) {
      console.error('Ошибка при создания заявки:', err);
      res.status(500).json({ success: false, error: 'Ошибка сервера при создания заявки' });
    }
  }

  static async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await Ticket.findAll();
      res.json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при получении заявок' });
    }
  }

  static async getTicketById(req: Request, res: Response) {
    try {
      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Заявка не найдена' });
      }

      const comments = await TicketComment.findByTicketId(parseInt(req.params.id, 10));
      const statusHistory = await TicketStatusHistory.findByTicketId(parseInt(req.params.id, 10));

      res.json({
        success: true,
        data: {
          ...ticket,
          comments,
          statusHistory,
        },
      });
    } catch (err) {
      console.error('Ошибка при получении заявки по id:', err);
      res.status(500).json({ success: false, error: 'Ошибка сервера при полученни заявки по id' });
    }
  }

  static async updateTicket(req: Request, res: Response) {
    try {
      const { category, description, address, status, resident_id } = req.body;

      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Заявка не найдена' });
      }

      const updatedTicket = await Ticket.update(parseInt(req.params.id, 10), {
        category,
        description,
        address,
        status,
        resident_id,
      });

      res.json({ success: true, message: 'Заявка успешно обновлена', data: updatedTicket });
    } catch (err) {
      console.error('Ошибка при обновлении заявки:', err);
      res.status(500).json({ success: false, error: 'Ошибка сервера при обновлении заявки' });
    }
  }

  static async deleteTicket(req: Request, res: Response) {
    try {
      const ticket = await Ticket.findById(parseInt(req.params.id, 10));
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Заявка не найдена' });
      }

      const deletedTicket = await Ticket.delete(parseInt(req.params.id, 10));

      res.json({ success: true, message: 'Заявка удалена', data: deletedTicket });
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при удалении заявки' });
    }
  }

  // Обновление статуса заявки (только для администраторов)
  static async updateTicketStatus(req: Request, res: Response) {
    try {
      // Проверяем, что текущий пользователь - администратор
      const currentUser = (req as any).user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Пользователь не авторизован' });
      }

      const dbUser = await User.findById(currentUser.userId);
      if (!dbUser) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      if (dbUser.role !== 'администратор') {
        return res.status(403).json({
          success: false,
          error: 'Доступ запрещен. Только администратор может изменять статус заявки.',
        });
      }

      const { status } = req.body;
      const validStatuses = ['Новая', 'В работе', 'Выполнена'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Недопустимый статус. Допустимые значения: Новая, В работе, Выполнена',
        });
      }

      const ticketId = parseInt(req.params.id, 10);
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Заявка не найдена' });
      }

      // Обновляем только статус, сохраняя остальные поля
      const updatedTicket = await Ticket.update(ticketId, {
        category: ticket.category,
        description: ticket.description || '',
        address: ticket.address,
        status: status,
        resident_id: ticket.resident_id,
      });

      // Добавляем запись в историю статусов
      await TicketStatusHistory.create({
        ticket_id: ticketId,
        old_status: ticket.status,
        new_status: status,
        changed_by: currentUser.userId,
      });

      res.json({
        success: true,
        message: 'Статус заявки обновлен',
        data: updatedTicket,
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса заявки:', error);
      res
        .status(500)
        .json({ success: false, error: 'Ошибка сервера при обновлении статуса заявки' });
    }
  }

  // Добавление комментария к заявке
  static async addComment(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Пользователь не авторизован' });
      }

      const { comment } = req.body;
      const ticketId = parseInt(req.params.id, 10);

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Комментарий не может быть пустым' });
      }

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Заявка не найдена' });
      }

      const newComment = await TicketComment.create({
        ticket_id: ticketId,
        user_id: currentUser.userId,
        comment: comment.trim(),
      });

      // Получаем комментарий с именем пользователя
      const comments = await TicketComment.findByTicketId(ticketId);
      const addedComment = comments.find((c) => c.id === newComment.id);

      res.json({
        success: true,
        message: 'Комментарий добавлен',
        data: addedComment,
      });
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при добавлении комментария' });
    }
  }
}

export default TicketController;
