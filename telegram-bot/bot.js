require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const STATES = require('./states');
const api = require('./api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const sessions = {};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  sessions[chatId] = {
    state: STATES.NONE,
    ticket: {}
  };

  await bot.sendMessage(chatId, 
    'Добро пожаловать 👋\n\nНажмите кнопку ниже, чтобы создать заявку.',
    {
      reply_markup: {
        keyboard: [[{ text: '📝 Создать заявку' }]],
        resize_keyboard: true
      }
    }
  );
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId]) return;

  const session = sessions[chatId];

  if (text === '📝 Создать заявку') {
    session.state = STATES.CATEGORY;
    return bot.sendMessage(chatId, 'Введите категорию заявки:');
  }

  if (session.state === STATES.CATEGORY) {
    session.ticket.category = text;
    session.state = STATES.DESCRIPTION;
    return bot.sendMessage(chatId, 'Опишите проблему:');
  }

  if (session.state === STATES.DESCRIPTION) {
    session.ticket.description = text;
    session.state = STATES.PHOTO;
    return bot.sendMessage(chatId, 'Отправьте фото (или напишите "нет"):');
  }

  if (session.state === STATES.PHOTO) {
    session.ticket.address = 'Дом 1, кв 1';

    const user = await api.findOrCreateUser(msg.from);

    const ticket = await api.createTicket({
      ...session.ticket,
      resident_id: user.id
    });

    session.state = STATES.NONE;

    return bot.sendMessage(chatId,
      `✅ Заявка создана!\n\n` +
      `№ ${ticket.id}\n` +
      `Статус: ${ticket.status}`
    );
  }
});

console.log('🤖 Telegram бот запущен');
