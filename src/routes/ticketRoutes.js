const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.createTicket);
router.get('/', async (req, res) => {
  const result = await require('../config/database').query(
    'SELECT * FROM tickets'
  );
  res.json(result.rows);
});

module.exports = router;
