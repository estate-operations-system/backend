import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token, { polling: false });
} else {
  console.warn('BOT_TOKEN not set — Telegram notifications disabled');
}

export async function sendTelegramMessageToId(telegramId: number | string, text: string) {
  if (!bot) return;
  try {
    const chatId = typeof telegramId === 'string' ? parseInt(telegramId, 10) : telegramId;
    if (!chatId) return;
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error('Failed to send telegram message', err);
  }
}

export default bot;
