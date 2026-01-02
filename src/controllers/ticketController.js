const Ticket = require('../models/ticketModel');

exports.createTicket = async (req, res) => {
  try {
    const { category, description, address, resident_id } = req.body;

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
    res.status(500).json({ success: false, error: 'Ошибка создания заявки' });
  }
};
